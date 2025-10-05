import {
  BadRequestException,
  Body,
  Controller,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { Item, QuestionsService } from './questions.service';
import { Level, ScoreResponse, ScoreService } from './score.service';
import { CanonicalTagsService } from 'src/vector/canonical_tags/canonical_tags.service';
import { MakeQuestionsDTO } from './dto/make_question.dto';
import { CompleteSurveyDto } from './dto/complete_survey.dto';
import { StudyTagsService } from 'src/study_tags/study_tags.service';
import { AuthGuard } from 'src/auth/authGuard';
import { ProfilesService } from 'src/profiles/profiles.service';
import { zip } from 'rxjs/operators';

type InComingAnswerBlock = {
  tag: string;
  questions: Array<{ no: number; level: Level; value: number }>;
};

// GPT 관련은 웬만해서는 ai 로 통일
@UseGuards(AuthGuard)
@Controller('ai')
export class QuestionsController {
  constructor(
    private readonly qs: QuestionsService,
    private readonly tags: CanonicalTagsService,
    private readonly scorer: ScoreService,
    private readonly studyTagsService: StudyTagsService,
    private readonly profilesService: ProfilesService,
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

  @Post('complete-survey')
  async completeSurvey(@Request() req: any, @Body() body: CompleteSurveyDto) {
    const { answers } = body;
    const userUuid = req.user.uuid;

    // 입력 검증
    if (!Array.isArray(answers) || answers.length === 0) {
      throw new BadRequestException(
        'answers 배열(태그별 블록)을 제공해주세요.',
      );
    }

    // 1. JWT 토큰에서 사용자 UUID로 프로필 조회
    const profileResponse = await this.profilesService.getProfile(userUuid);
    const profile = profileResponse.option?.meta_data?.profile as any;

    if (!profile || !profile.id) {
      throw new BadRequestException('사용자 프로필을 찾을 수 없습니다.');
    }

    // 2. 점수 계산
    const scoreResult = this.scorer.scoreFromBlocks(answers);

    // 3. 태그별 점수 데이터 추출
    const tagScores = scoreResult.perTag.map(({ sum, wavg, grade, tag }) => ({
      tag,
      sum,
      wavg,
      grade,
    }));

    // 4. StudyTags 테이블 업데이트
    const updatedTags = await this.studyTagsService.updateTagScoresAfterSurvey(
      profile.id,
      tagScores,
    );

    return {
      message: '설문조사가 완료되었습니다.',
      scoreResult,
      updatedTags: updatedTags.map((tag) => ({
        id: tag.id,
        tag_name: tag.tag_name,
        proficiency_score: tag.proficiency_score,
        proficiency_avg_score: tag.proficiency_avg_score,
        proficiency_level: tag.proficiency_levels,
        is_survey_completed: tag.is_survey_completed,
      })),
    };
  }
}
