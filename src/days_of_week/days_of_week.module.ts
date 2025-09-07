import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DaysOfWeek } from './days_of_week.entity';
import { DaysOfWeekService } from './days_of_week.service';

@Module({
  imports: [TypeOrmModule.forFeature([DaysOfWeek])],
  providers: [DaysOfWeekService],
  exports: [DaysOfWeekService],
})
export class DaysOfWeekModule {}
