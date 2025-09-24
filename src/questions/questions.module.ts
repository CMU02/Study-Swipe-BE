import { Module } from '@nestjs/common';
import { QuestionsService } from './questions.service';
import { QuestionsController } from './questions.controller';
import { ScoreService } from './score.service';
import { VectorModule } from 'src/vector/vector.module';
import { CanonicalTagsModule } from 'src/vector/canonical_tags/canonical_tags.module';

@Module({
  imports: [VectorModule, CanonicalTagsModule],
  providers: [QuestionsService, ScoreService],
  controllers: [QuestionsController],
})
export class QuestionsModule {}
