import { BadRequestException, Injectable } from '@nestjs/common';
import { Item, Level } from './questions.service';

type Answer = { no: number; value: number };

export type ScorePerTag = {
  tag: string;
  count: number;
  avg5: number;      // 1~5 평균
  wavg5: number;     // 가중 평균(1~5)
  avg100: number;    // 0~100 환산
  wavg100: number;   // 가중 0~100
  details: Array<{ no: number; level: Level; value: number }>;
};

export type ScoreResponse = {
  perTag: ScorePerTag[];
  overall: {
    count: number;
    avg5: number;
    wavg5: number;
    avg100: number;
    wavg100: number;
  };
};

// 레벨 가중치(원하면 조정 가능)
const WEIGHT: Record<Level, number> = { 기초: 1.0, 경험: 1.2, 응용: 1.4 };

@Injectable()
export class ScoreService {
  score(payload: { items: Item[]; answers: Answer[] }): ScoreResponse {
    const { items, answers } = payload;

    // 1) 문항 평탄화: no -> { tag, level }
    const flat: Array<{ tag: string; no: number; level: Level }> = [];
    for (const it of items || []) {
      for (const q of (it.questions || [])) {
        flat.push({ tag: it.tag, no: q.no, level: q.level });
      }
    }
    if (!flat.length) throw new BadRequestException('채점할 문항이 없습니다.');

    const idx = new Map<number, { tag: string; level: Level }>();
    for (const f of flat) idx.set(f.no, { tag: f.tag, level: f.level });

    // 2) 답안 검증
    if (!answers?.length) throw new BadRequestException('answers 배열을 제공해주세요.');
    const seen = new Set<number>();
    for (const a of answers) {
      if (!Number.isFinite(a.no)) throw new BadRequestException(`no가 유효하지 않습니다: ${a.no}`);
      if (!Number.isFinite(a.value)) throw new BadRequestException(`value가 유효하지 않습니다: ${a.value}`);
      if (a.value < 1 || a.value > 5) throw new BadRequestException(`점수는 1~5 사이여야 합니다: no=${a.no}, value=${a.value}`);
      if (seen.has(a.no)) throw new BadRequestException(`중복 응답: no=${a.no}`);
      seen.add(a.no);
      if (!idx.has(a.no)) throw new BadRequestException(`존재하지 않는 문제 번호: no=${a.no}`);
    }

    // 3) 태그별 집계
    const perTagAgg = new Map<
      string,
      { sum: number; wsum: number; wtot: number; cnt: number; details: Array<{ no: number; level: Level; value: number }> }
    >();

    let globalSum = 0, globalWSum = 0, globalWTot = 0, globalCnt = 0;

    for (const a of answers) {
      const meta = idx.get(a.no)!;
      const w = WEIGHT[meta.level];

      const g = perTagAgg.get(meta.tag) ?? { sum: 0, wsum: 0, wtot: 0, cnt: 0, details: [] };
      g.sum += a.value;
      g.wsum += a.value * w;
      g.wtot += w;
      g.cnt += 1;
      g.details.push({ no: a.no, level: meta.level, value: a.value });
      perTagAgg.set(meta.tag, g);

      globalSum += a.value;
      globalWSum += a.value * w;
      globalWTot += w;
      globalCnt += 1;
    }

    // 4) 결과 변환
    const perTag: ScorePerTag[] = Array.from(perTagAgg.entries()).map(([tag, g]) => {
      const avg5 = g.sum / g.cnt;
      const wavg5 = g.wsum / g.wtot;
      return {
        tag,
        count: g.cnt,
        avg5: round2(avg5),
        wavg5: round2(wavg5),
        avg100: round2(avg5 * 20),
        wavg100: round2(wavg5 * 20),
        details: g.details.sort((a, b) => a.no - b.no),
      };
    }).sort((a, b) => a.tag.localeCompare(b.tag));

    const overallAvg5 = globalSum / globalCnt;
    const overallWAvg5 = globalWSum / globalWTot;

    return {
      perTag,
      overall: {
        count: globalCnt,
        avg5: round2(overallAvg5),
        wavg5: round2(overallWAvg5),
        avg100: round2(overallAvg5 * 20),
        wavg100: round2(overallWAvg5 * 20),
      },
    };
  }
}

function round2(n: number) {
  return Math.round(n * 100) / 100;
}
