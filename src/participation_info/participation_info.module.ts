import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { participationInfo } from './participation_info.entity';
import { ParticipationInfoService } from './participation_info.service';

@Module({
  imports: [TypeOrmModule.forFeature([participationInfo])],
  providers: [ParticipationInfoService],
  exports: [ParticipationInfoService],
})
export class ParticipationInfoModule {}
