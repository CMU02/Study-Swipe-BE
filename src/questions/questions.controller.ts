import { BadRequestException, Body, Controller, Post } from '@nestjs/common';
import { QuestionsService } from './questions.service';

// GPT 상호 통신은 웬만해서는 ai 로 설정해두겠음.
@Controller('ai')
export class QuestionsController {
  constructor(private readonly qs: QuestionsService) {}

  @Post('make-questions')
  async makeQuestions(@Body() body: { tags?: string[] }) {
    const tags = (body?.tags ?? [])
      .map((s) => String(s).trim())
      .filter(Boolean);

    // Tags 배열이 없는 경우 예외 처리
    if (tags.length === 0) 
      throw new BadRequestException('tags 배열을 1~5개로 보내주세요.');

    // Tags 배열이 5개 초과인 경우 예외처리
    if (tags.length > 5) 
      throw new BadRequestException('tags는 최대 5개까지만 허용됩니다.');

    return this.qs.makeQuestions(tags);
  }
}
