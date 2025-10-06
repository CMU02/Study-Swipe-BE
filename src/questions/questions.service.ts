import { Injectable, InternalServerErrorException } from '@nestjs/common';
import OpenAI from 'openai';
import { VectorService } from 'src/vector/vector.service';

export type Level = '기초' | '경험' | '응용';
export type QuestionOut = { no: number; level: Level; text: string };
export type Item = { tag: string; questions: QuestionOut[] };

export type MakeQuestionsResult = { items: Item[] };

@Injectable()
export class QuestionsService {
  constructor(private vectorService: VectorService) {}

  // 질문 생성 기능
  // 표준화 및 중복 제거가 끝난 최종 태그로 문항 생성
  async makeQuestions(tags: string[]): Promise<MakeQuestionsResult> {
    // 주현이 형이 만든 Prompt
    const system = [
      '너는 설문 문항 생성기다.',
      '내가 태그(최대 5개)를 주면 각 태그별로 실력 수준을 평가하는 3문항을 만들어라.',
      '규칙:',
      '1) 문항은 [기초 → 경험 → 응용] 흐름으로.',
      '1.1) 각 흐름에는 그 사람의 수준을 알 수 있게 생성해줘.',
      '2) 응답은 5점 척도(① 전혀 아니다 ~ ⑤ 매우 그렇다)를 가정하되, 문항에 맞게 표현을 자연스럽게.',
      '3) 태그별 출력 블록으로 구분.',
      '4) 점수 계산이나 등급 판정은 하지 말고, “문항만” 만든다.',
      '출력 형식은 JSON만. 마크다운/설명 금지.',
      '형식: {"items":[{"tag":"태그","questions":[{"level":"기초","text":"..."},{"level":"경험","text":"..."},{"level":"응용","text":"..."}]}]}',
    ].join('\n');

    // 혹시 모를 방어 코드
    const finalTags = (tags || []).slice(0, 5);

    // 사용자가 입력하는 태그 목록
    const user = `태그 목록: ${finalTags.join(', ')}`;

    // 응답 생성
    const raw = await this.vectorService.invokeChatModel(system, user);

    if (!raw) {
      throw new InternalServerErrorException(`OpenAI 응답 없음 : ${raw}`);
    }

    // JSON 파싱 시도
    try {
      const parsed = JSON.parse(raw) as MakeQuestionsResult;
      const itemsIn = parsed.items || [];
      if (!itemsIn.length) throw new Error('ItemsIn이 비어있습니다.');

      // 번호 부여
      let seq = 1;
      const lvOrder: Level[] = ['기초', '경험', '응용'];

      // Items 정제 (+ 번호/레벨 보정)
      const items: Item[] = itemsIn.map((it) => ({
        tag: String(it.tag ?? ''),
        questions: (it.questions || []).slice(0, 3).map((q, i) => {
          const level: Level = (['기초', '경험', '응용'] as const).includes(
            (q as any).level as Level,
          )
            ? ((q as any).level as Level)
            : lvOrder[Math.min(i, 2)];
          return { no: seq++, level, text: String((q as any).text ?? '') };
        }),
      }));

      return { items };
    } catch {
      // LLM 파싱 실패 시 템플릿 + 번호 부여
      let seq = 1;
      const items: Item[] = finalTags.map((t) => ({
        tag: t,
        questions: [
          {
            no: seq++,
            level: '기초',
            text: `${t}의 핵심 개념과 역할을 설명할 수 있다.`,
          },
          {
            no: seq++,
            level: '경험',
            text: `${t}을(를) 활용해 작은 기능이나 모듈을 직접 구현해 본 경험이 있다.`,
          },
          {
            no: seq++,
            level: '응용',
            text: `${t}을(를) 사용해 요구사항을 분석하고 적절한 설계를 적용해 문제를 해결한 경험이 있다.`,
          },
        ],
      }));
      return { items };
    }
  }
}
