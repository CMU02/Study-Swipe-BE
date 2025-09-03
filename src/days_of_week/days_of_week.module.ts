import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DaysOfWeek } from './days_of_week.entity';

@Module({
    imports: [TypeOrmModule.forFeature([DaysOfWeek])]
})
export class DaysOfWeekModule {}
