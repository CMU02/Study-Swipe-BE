import { Module } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MajorController } from './major.controller';
import { Major } from './major.entity';
import { MajorService } from './major.service';

/**
 * 전공 관련 기능을 제공하는 모듈
 * 전공 정보 조회 및 관리 기능을 포함합니다.
 */
@Module({
  imports: [
    TypeOrmModule.forFeature([Major]), // Major 엔티티 등록
  ],
  providers: [
    MajorService, // 전공 비즈니스 로직
    JwtService, // JWT 토큰 처리 (AuthGuard에서 사용)
  ],
  controllers: [MajorController], // HTTP 엔드포인트
  exports: [
    MajorService, // 다른 모듈에서 사용 가능하도록 내보내기
  ],
})
export class MajorModule {}
