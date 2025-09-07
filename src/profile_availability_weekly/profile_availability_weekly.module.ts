import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProfileAvailabilityWeekly } from './profile_availability_weekly.entity';
import { ProfileAvailabilityWeeklyService } from './profile_availability_weekly.service';
import { DaysOfWeekModule } from 'src/days_of_week/days_of_week.module';
import { Profiles } from 'src/profiles/profiles.entity';
import { ProfileAvailabilityWeeklyController } from './profile_availability_weekly.controller';
import { JwtService } from '@nestjs/jwt';

@Module({
  imports: [
    TypeOrmModule.forFeature([ProfileAvailabilityWeekly, Profiles]),
    DaysOfWeekModule,
  ],
  providers: [ProfileAvailabilityWeeklyService, JwtService],
  exports: [ProfileAvailabilityWeeklyService],
  controllers: [ProfileAvailabilityWeeklyController],
})
export class ProfileAvailabilityWeeklyModule {}
