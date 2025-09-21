import { BadRequestException, Injectable } from '@nestjs/common';

/** 문항 난이도 단계 */
export type Level = '기초' | '경험' | '응용'; 

/** 등급 라벨 */
export type Grade = '초급' | '중급' | '상급';

/** 태그별 점수 결과 */
export type ScorePerTag = {
  tag: string;
  count: number;        // 해당 태그 문항 수(보통 3)
  sum: number;         // 합계(1~5)
  wavg: number;        // 가중 평균(1~5) → 매칭에 사용될 예정인데, 필요 없으면 제거 요청해주셈.
  grade: Grade;         // 태그의 최종 등급
  details: Array<{ no: number; level: Level; value: number }>;
};

/** 전체 결과 */
export type ScoreResponse = {
  perTag: ScorePerTag[];
  overall: {
    count: number;   // 전체 문항 수
    avg5: number;    // 전체 단순 평균(1~5)
    wavg: number;   // 전체 가중 평균(1~5)
    sumAvg: number; // 태그별 합계의 평균(스케일 3~15, 대시보드 요약용)
    overallGrade: Grade;  // 전체 등급(평균 기준)
  };
};

/** 레벨 가중치 (각 등급 별 점수 수정시 가중치 증가) */
const WEIGHT: Record<Level, number> = { 기초: 1.0, 경험: 1.2, 응용: 1.4 };

/** 등급 경계(평균 기준)
 *  - 평균 ≤ 2.0     → 초급
 *  - 평균 ≤ 11/3    → 중급
 *  - 그 외          → 상급
 */
const AVG_BOUND_LOW = 2.0;    // 초급 평균 범위
const AVG_BOUND_MID = 11 / 3;   // 중급 평균 범위

/** 입력 블록(태그별 제출) */
type IncomingAnswerBlock = {
  tag: string;
  questions: Array<{ no: number; level: Level; value: number }>;
};

@Injectable()
export class ScoreService {
  /**
   * 태그별 블록 입력을 점수화.
   * - 유효성 검사(범위/중복/존재성)
   * - 태그별 집계(합계/가중합 등)
   * - perTag/overall 지표 계산 및 등급 산출
   */
  scoreFromBlocks(blocks: IncomingAnswerBlock[]): ScoreResponse {

    // 입력 유효성 검사 
    if (!blocks?.length) throw new BadRequestException('answers가 비었습니다.');

    const seenNo = new Set<number>(); // 전역 문항번호 중복 방지

    const perTagAgg = new Map<
      string,
      {
        sum: number;   // 단순 합계 (1~5)
        wsum: number;  // 가중 합계
        wtot: number;  // 가중치 총합
        cnt: number;   // 문항 수
        details: Array<{ no: number; level: Level; value: number }>;
      }
    >();

    // overall 집계용 누적 변수
    let globalSum = 0, globalWSum = 0, globalWTot = 0, globalCnt = 0;

    // 태그별 집계
    for (const block of blocks) {
      const tag = String(block?.tag ?? '').trim();
      if (!tag) throw new BadRequestException('각 블록은 tag가 필요합니다.');

      const qs = Array.isArray(block.questions) ? block.questions : [];
      if (!qs.length) throw new BadRequestException(`태그 "${tag}"의 questions가 비었습니다.`);

      for (const q of qs) {
        const no = Number(q.no);
        const level = q.level as Level;
        const value = Number(q.value);

        // 기본 유효성 체크
        if (!Number.isFinite(no)) throw new BadRequestException(`no가 유효하지 않습니다: ${no}`);

        if (!['기초', '경험', '응용'].includes(level))
          throw new BadRequestException(`level은 기초/경험/응용 중 하나여야 합니다: no=${no}, level=${level}`);
        
        if (!Number.isFinite(value) || value < 1 || value > 5)
          throw new BadRequestException(`value는 1~5 사이여야 합니다: no=${no}, value=${value}`);
        
        if (seenNo.has(no)) throw new BadRequestException(`중복 응답: no=${no}`);
        seenNo.add(no);

        // 가중치 적용
        const w = WEIGHT[level];
        const g = perTagAgg.get(tag) ?? { sum: 0, wsum: 0, wtot: 0, cnt: 0, details: [] };

        // 태그별 누적
        g.sum  += value;
        g.wsum += value * w;
        g.wtot += w;
        g.cnt  += 1;
        g.details.push({ no, level, value });
        perTagAgg.set(tag, g);

        // 전체 누적
        globalSum  += value;
        globalWSum += value * w;
        globalWTot += w;
        globalCnt  += 1;
      }
    }

    // 태그별 결과 생성 및 등급 산출 
    const perTag: ScorePerTag[] = Array.from(perTagAgg.entries())
      .map(([tag, g]) => {
        const sum  = g.sum;
        const avg5  = sum / g.cnt;            // 등급 판정은 평균 기반
        const wavg = g.wsum / g.wtot;

        const grade = gradeFromAvg(avg5);

        return {
          tag,
          count: g.cnt,
          sum: round2(sum),
          wavg: round2(wavg),
          grade,
          details: g.details.sort((a, b) => a.no - b.no),
        };
      })
      .sort((a, b) => a.tag.localeCompare(b.tag));

    // 전체 집계 및 등급
    if (globalCnt === 0) throw new BadRequestException('채점할 문항이 없습니다.');

    const overallAvg5  = globalSum / globalCnt;          // 전체 단순 평균
    const overallwavg = globalWSum / globalWTot;        // 전체 가중 평균
    const sumAvg      = perTag.reduce((s, t) => s + t.sum, 0) / perTag.length; // 태그 합계의 평균(3~15)
    const overallGrade = gradeFromAvg(overallAvg5);      // 평균 기준 등급(문항 수 차이 무시)

    // 응답 파트
    return {
      perTag,
      overall: {
        count: globalCnt,
        avg5: round2(overallAvg5),
        wavg: round2(overallwavg),
        sumAvg: round2(sumAvg),
        overallGrade, 
      },
    };
  }
}

/** 평균(1~5) -> 등급 라벨 매핑 */
function gradeFromAvg(avg5: number): Grade {
  if (avg5 <= AVG_BOUND_LOW) return '초급';
  if (avg5 <= AVG_BOUND_MID) return '중급';
  return '상급';
}

/** 소수점 둘째 자리 반올림 */
function round2(n: number) {
  return Math.round(n * 100) / 100;
}
