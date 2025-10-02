import { BadRequestException, Body, Controller, Post } from '@nestjs/common';
import { Item, QuestionsService } from './questions.service';
import { Level, ScoreResponse, ScoreService } from './score.service';
import { CanonicalTagsService } from 'src/vector/canonical_tags/canonical_tags.service';
import { MakeQuestionsDTO } from './dto/make_question.dto';

const normalizeKey = (s: string) =>
  s
    .normalize('NFKC')
    .trim()
    .toLowerCase()
    .replace(/[\s\-\_\/]/g, '');

type InComingAnswerBlock = {
  tag: string;
  questions: Array<{ no: number; level: Level; value: number }>;
};

// GPT 관련은 웬만해서는 ai 로 통일

@Controller('ai')
export class QuestionsController {
  constructor(
    private readonly qs: QuestionsService,
    private readonly tags: CanonicalTagsService,
    private readonly scorer: ScoreService,
  ) {}

  @Post('make-questions')
  async makeQuestions(@Body() body: MakeQuestionsDTO) {
    // 입력 검증
    const raw = (body?.tags ?? []).map((s) => String(s).trim()).filter(Boolean);

    // 태그 0개 방지
    if (raw.length === 0)
      throw new BadRequestException('tags 배열을 1~5개로 보내주세요.');

    // 태그 5개 초과 방지
    if (raw.length > 5)
      throw new BadRequestException('tags는 최대 5개까지만 허용됩니다.');

    return this.qs.makeQuestions(body.tags);
  }

  @Post('score')
  async scoreByBlocks(
    @Body()
    body: {
      answers?: InComingAnswerBlock[];
    },
  ): Promise<ScoreResponse> {
    const blocks = body?.answers ?? [];
    if (!Array.isArray(blocks) || blocks.length === 0) {
      throw new BadRequestException(
        'answers 배열(태그별 블록)을 제공해주세요.',
      );
    }
    return this.scorer.scoreFromBlocks(blocks);
  }
}
