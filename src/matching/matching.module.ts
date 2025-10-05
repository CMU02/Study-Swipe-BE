import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MatchingService } from './matching.service';
import { MatchingController } from './matching.controller';
import { Profiles } from 'src/profiles/profiles.entity';
import { StudyTags } from 'src/study_tags/study_tags.entity';
import { User } from 'src/user/user.entity';
import { JwtService } from '@nestjs/jwt';

@Module({
  imports: [TypeOrmModule.forFeature([Profiles, StudyTags, User])],
  controllers: [MatchingController],
  providers: [MatchingService, JwtService],
  exports: [MatchingService],
})
export class MatchingModule {}
