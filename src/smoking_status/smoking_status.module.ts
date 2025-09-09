import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SmokingStatus } from './smoking_status.entity';
import { SmokingStatusService } from './smoking_status.service';

@Module({
  imports: [TypeOrmModule.forFeature([SmokingStatus])],
  providers: [SmokingStatusService],
  exports: [SmokingStatusService],
})
export class SmokingStatusModule {}
