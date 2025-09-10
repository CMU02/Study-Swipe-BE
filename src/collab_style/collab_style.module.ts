import { Module } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CollabStyleController } from './collab_style.controller';
import { CollabStyle } from './collab_style.entity';
import { CollabStyleService } from './collab_style.service';

/**
 * 협업 성향 관련 기능을 제공하는 모듈
 * 협업 성향 정보 조회 및 관리 기능을 포함합니다.
 */
@Module({
  imports: [
    TypeOrmModule.forFeature([CollabStyle]), // CollabStyle 엔티티 등록
  ],
  providers: [
    CollabStyleService, // 협업 성향 비즈니스 로직
    JwtService, // JWT 토큰 처리 (AuthGuard에서 사용)
  ],
  controllers: [CollabStyleController], // HTTP 엔드포인트
  exports: [
    CollabStyleService, // 다른 모듈에서 사용 가능하도록 내보내기
  ],
})
export class CollabStyleModule {}
