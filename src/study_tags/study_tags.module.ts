import { Module } from '@nestjs/common';
import { StudyTagsService } from './study_tags.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StudyTags } from './study_tags.entity';
import { ProficiencyLevelsModule } from 'src/proficiency_levels/proficiency_levels.module';
import { CanonicalTagsModule } from 'src/vector/canonical_tags/canonical_tags.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([StudyTags]),
    ProficiencyLevelsModule,
    CanonicalTagsModule,
  ],
  providers: [StudyTagsService],
  exports: [StudyTagsService],
})
export class StudyTagsModule {}
