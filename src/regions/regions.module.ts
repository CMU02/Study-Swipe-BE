import { Module } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RegionsController } from './regions.controller';
import { Regions } from './regions.entity';
import { RegionsService } from './regions.service';

/**
 * 지역 관련 기능을 제공하는 모듈
 * 지역 정보 조회 및 관리 기능을 포함합니다.
 */
@Module({
  imports: [
    TypeOrmModule.forFeature([Regions]), // Regions 엔티티 등록
  ],
  providers: [
    RegionsService, // 지역 비즈니스 로직
    JwtService, // JWT 토큰 처리 (AuthGuard에서 사용)
  ],
  controllers: [RegionsController], // HTTP 엔드포인트
  exports: [
    RegionsService, // 다른 모듈에서 사용 가능하도록 내보내기
  ],
})
export class RegionsModule {}
