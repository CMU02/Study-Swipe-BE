import { Module } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PreferredMemberCountModule } from 'src/preferred_member_count/preferred_member_count.module';
import { SmokingStatusModule } from 'src/smoking_status/smoking_status.module';
import { SocialPrefsModule } from 'src/social_prefs/social_prefs.module';
import { UserModule } from 'src/user/user.module';
import { ProfilesController } from './profiles.controller';
import { Profiles } from './profiles.entity';
import { ProfilesService } from './profiles.service';

/**
 * 사용자 프로필 관련 기능을 제공하는 모듈
 * 프로필 생성, 조회, 수정 및 관련 엔티티 관리 기능을 포함합니다.
 */
@Module({
  imports: [
    TypeOrmModule.forFeature([Profiles]), // Profiles 엔티티 등록
    UserModule, // 사용자 관리 기능
    SmokingStatusModule, // 흡연 상태 관리 기능
    SocialPrefsModule, // 사교모임 선호도 관리 기능
    PreferredMemberCountModule, // 선호 인원 수 관리 기능
  ],
  providers: [
    ProfilesService, // 프로필 비즈니스 로직
    JwtService, // JWT 토큰 처리 (AuthGuard에서 사용)
  ],
  controllers: [ProfilesController], // HTTP 엔드포인트
  exports: [ProfilesService], // 다른 모듈에서 사용 가능하도록 내보내기
})
export class ProfilesModule {}
