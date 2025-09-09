import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SocialPrefs } from './social_prefs.entity';
import { SocialPrefsService } from './social_prefs.service';

/**
 * 사교모임 선호도 관련 기능을 제공하는 모듈
 * 사교모임 가능 여부 정보 관리 기능을 포함합니다.
 */
@Module({
  imports: [
    TypeOrmModule.forFeature([SocialPrefs]), // SocialPrefs 엔티티 등록
  ],
  providers: [
    SocialPrefsService, // 사교모임 선호도 비즈니스 로직
  ],
  exports: [
    SocialPrefsService, // 다른 모듈에서 사용 가능하도록 내보내기
  ],
})
export class SocialPrefsModule {}
