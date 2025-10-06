import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SmokingStatusService } from './smoking_status.service';
import { SmokingStatus } from './smoking_status.entity';

@Module({
  imports: [TypeOrmModule.forFeature([SmokingStatus])],
  providers: [SmokingStatusService],
  exports: [SmokingStatusService],
})
export class SmokingStatusModule {}
