import { Module } from '@nestjs/common';
import { StudyTagsService } from './study_tags.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StudyTags } from './study_tags.entity';
import { User } from 'src/user/user.entity';
import { CanonicalTagsModule } from 'src/vector/canonical_tags/canonical_tags.module';

@Module({
  imports: [TypeOrmModule.forFeature([StudyTags, User]), CanonicalTagsModule],
  providers: [StudyTagsService],
  exports: [StudyTagsService],
})
export class StudyTagsModule {}
