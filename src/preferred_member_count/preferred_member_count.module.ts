import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PreferredMemberCount } from './preferred_member_count.entity';
import { PreferredMemberCountService } from './preferred_member_count.service';

/**
 * 선호 인원 수 관련 기능을 제공하는 모듈
 * 스터디 그룹의 최소/최대 인원 수 선호도 관리 기능을 포함합니다.
 */
@Module({
  imports: [
    TypeOrmModule.forFeature([PreferredMemberCount]), // PreferredMemberCount 엔티티 등록
  ],
  providers: [
    PreferredMemberCountService, // 선호 인원 수 비즈니스 로직
  ],
  exports: [
    PreferredMemberCountService, // 다른 모듈에서 사용 가능하도록 내보내기
  ],
})
export class PreferredMemberCountModule {}
