import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TestUsersSeedService } from './test-users.seed';
import { SeedsController } from './seeds.controller';
import { User } from 'src/user/user.entity';
import { Profiles } from 'src/profiles/profiles.entity';
import { participationInfo } from 'src/participation_info/participation_info.entity';
import { StudyTags } from 'src/study_tags/study_tags.entity';
import { Universities } from 'src/universities/universities.entity';
import { SocialPrefs } from 'src/social_prefs/social_prefs.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User,
      Profiles,
      participationInfo,
      StudyTags,
      Universities,
      SocialPrefs,
    ]),
  ],
  controllers: [SeedsController],
  providers: [TestUsersSeedService],
  exports: [TestUsersSeedService],
})
export class SeedsModule {}
