import { Injectable, InternalServerErrorException } from '@nestjs/common';
import OpenAI from 'openai';

type Level = '기초' | '경험' | '응용';
type Item = { tag: string; questions: Array<{ level: Level; text: string }> };

export type MakeQuestionsResult = { items: Item[] };

@Injectable()
export class QuestionsService {
  private client: OpenAI;
  private model: string;

  constructor() {
    // env 에서 API_KEY 가져옴.
    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
      throw new InternalServerErrorException('.env 내 API KEY 확인');
    }
    this.client = new OpenAI({ apiKey });
    this.model = process.env.OPENAI_MODEL || 'o4-mini';

  }

  // 질문 생성 기능
  async makeQuestions(tags: string[]): Promise<MakeQuestionsResult> {

    // 주현이 형이 만든 Prompt
    const system = [
      '너는 설문 문항 생성기다.',
      '내가 태그(최대 5개)를 주면 각 태그별로 실력 수준을 평가하는 3문항을 만들어라.',
      '규칙:',
      '1) 문항은 [기초 → 경험 → 응용] 흐름으로.',
      '2) 응답은 5점 척도(① 전혀 아니다 ~ ⑤ 매우 그렇다)를 가정하되, 문항에 맞게 표현을 자연스럽게.',
      '3) 태그별 출력 블록으로 구분.',
      '4) 점수 계산이나 등급 판정은 하지 말고, “문항만” 만든다.',
      '출력 형식은 JSON만. 마크다운/설명 금지.',
      '형식: {"items":[{"tag":"태그","questions":[{"level":"기초","text":"..."},{"level":"경험","text":"..."},{"level":"응용","text":"..."}]}]}',
    ].join('\n');

    // 사용자가 입력하는 태그 목록
    const user = `태그 목록: ${tags.join(', ')}`;

    // 응답 생성
    const res = await this.client.chat.completions.create({
      model: this.model,
      temperature: 0.7,
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: user },
      ],
    });

    let raw = res.choices?.[0]?.message?.content?.trim() ?? '';
    // ```json … ``` 제거 방어
    raw = raw.replace(/^```(?:json)?\s*/i, '').replace(/```$/i, '').trim();

    // JSON 파싱 시도
    try {
      const parsed = JSON.parse(raw) as MakeQuestionsResult;
      // 최소 정제
      const items =
        (parsed.items || []).map((it) => ({
          tag: String(it.tag ?? ''),
          questions: (it.questions || [])
            .slice(0, 3)
            .map((q, i) => {
              const lv: Level[] = ['기초', '경험', '응용'];
              const level =
                (['기초', '경험', '응용'] as const).includes(q.level as Level)
                  ? (q.level as Level)
                  : lv[Math.min(i, 2)];
              return { level, text: String((q as any).text ?? '') };
            }),
        })) || [];

      // 비정상 응답 시 에러 응답 처리
      if (!items.length) 
        throw new Error('empty');

      return { items };

    } catch {
      // 태그별 기본 문항 템플릿
      return {
        items: tags.map((t) => ({
          tag: t,
          questions: [
            { level: '기초', text: `${t}의 핵심 개념과 역할을 설명할 수 있다.` },
            { level: '경험', text: `${t}을(를) 활용해 작은 기능이나 모듈을 직접 구현해 본 경험이 있다.` },
            { level: '응용', text: `${t}을(를) 사용해 요구사항을 분석하고 적절한 설계를 적용해 문제를 해결한 경험이 있다.` },
          ],
        })),
      };
    }
  }
}
