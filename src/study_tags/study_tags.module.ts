import { Module } from '@nestjs/common';
import { StudyTagsService } from './study_tags.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StudyTags } from './study_tags.entity';
import { ProficiencyLevelsModule } from 'src/proficiency_levels/proficiency_levels.module';

@Module({
  imports: [TypeOrmModule.forFeature([StudyTags]), ProficiencyLevelsModule],
  providers: [StudyTagsService],
  exports: [StudyTagsService],
})
export class StudyTagsModule {}
