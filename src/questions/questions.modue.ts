import { Module } from '@nestjs/common';
import { QuestionsService } from './questions.service';
import { QuestionsController } from './questions.controller';
import { TagsModule } from 'src/tags/tags.module';
import { ScoreService } from './score.service';

@Module({
  imports: [TagsModule],
  providers: [QuestionsService, ScoreService],
  controllers: [QuestionsController],
})
export class QuestionsModule {}
