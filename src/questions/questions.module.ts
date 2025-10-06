import { Module } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ProfilesModule } from 'src/profiles/profiles.module';
import { StudyTagsModule } from 'src/study_tags/study_tags.module';
import { CanonicalTagsModule } from 'src/vector/canonical_tags/canonical_tags.module';
import { VectorModule } from 'src/vector/vector.module';
import { QuestionsController } from './questions.controller';
import { QuestionsService } from './questions.service';
import { ScoreService } from './score.service';

@Module({
  imports: [VectorModule, CanonicalTagsModule, StudyTagsModule, ProfilesModule],
  providers: [QuestionsService, ScoreService, JwtService],
  controllers: [QuestionsController],
})
export class QuestionsModule {}
