import { Module } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MeetingTypesController } from './meeting_types.controller';
import { MeetingTypes } from './meeting_types.entity';
import { MeetingTypesService } from './meeting_types.service';

/**
 * 모임 유형 관련 기능을 제공하는 모듈
 * 모임 유형 정보 조회 및 관리 기능을 포함합니다.
 */
@Module({
  imports: [
    TypeOrmModule.forFeature([MeetingTypes]), // MeetingTypes 엔티티 등록
  ],
  providers: [
    MeetingTypesService, // 모임 유형 비즈니스 로직
    JwtService, // JWT 토큰 처리 (AuthGuard에서 사용)
  ],
  controllers: [MeetingTypesController], // HTTP 엔드포인트
  exports: [
    MeetingTypesService, // 다른 모듈에서 사용 가능하도록 내보내기
  ],
})
export class MeetingTypesModule {}
