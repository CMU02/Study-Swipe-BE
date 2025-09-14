import { IsInt, IsOptional, IsPositive } from 'class-validator';

/**
 * 프로필 모임 유형 업데이트 데이터 전송 객체
 * 사용자가 선호하는 단일 모임 유형 ID를 포함합니다.
 */
export class ProfileMeetingTypesDto {
  /**
   * 모임 유형 ID (단일 선택)
   * null을 전송하면 모임 유형이 제거됩니다.
   * @example 1 // 온라인
   */
  @IsOptional()
  @IsInt({ message: '모임 유형 ID는 정수여야 합니다.' })
  @IsPositive({ message: '모임 유형 ID는 양수여야 합니다.' })
  readonly meeting_type_id: number;
}
