import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProfileAvailabilityWeekly } from './profile_availability_weekly.entity';

@Module({
    imports: [TypeOrmModule.forFeature([ProfileAvailabilityWeekly])]
})
export class ProfileAvailabilityWeeklyModule {}
