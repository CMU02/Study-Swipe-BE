import {
  IsInt,
  IsOptional,
  IsPositive,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

/**
 * 프로필 학습 관련 정보 데이터 전송 객체
 * 학습 목표, 활동 반경, 연락처 등의 정보를 포함합니다.
 */
export class ProfileStudyDto {
  /**
   * 학습 목표 및 다짐 (최대 1000자)
   */
  @IsOptional()
  @IsString({ message: '학습 목표는 문자열이어야 합니다.' })
  @MaxLength(1000, { message: '학습 목표는 최대 1000자까지 가능합니다.' })
  readonly goals_note?: string;

  /**
   * 활동 반경 (킬로미터 단위, 1-50km)
   */
  @IsOptional()
  @IsInt({ message: '활동 반경은 정수여야 합니다.' })
  @Min(1, { message: '활동 반경은 최소 1km 이상이어야 합니다.' })
  @Max(50, { message: '활동 반경은 최대 50km까지 가능합니다.' })
  readonly activity_radius_km?: number;

  /**
   * 연락 방법 (카카오톡, 디스코드 등)
   */
  @IsOptional()
  @IsString({ message: '연락 방법은 문자열이어야 합니다.' })
  @MaxLength(100, { message: '연락 방법은 최대 100자까지 가능합니다.' })
  readonly contact_info?: string;

  /**
   * 흡연 상태 ID
   */
  @IsOptional()
  @IsInt({ message: '흡연 상태 ID는 정수여야 합니다.' })
  @IsPositive({ message: '흡연 상태 ID는 양수여야 합니다.' })
  readonly smoking_status_id?: number;

  /**
   * 사교 모임 선호도 ID
   */
  @IsOptional()
  @IsInt({ message: '사교 모임 선호도 ID는 정수여야 합니다.' })
  @IsPositive({ message: '사교 모임 선호도 ID는 양수여야 합니다.' })
  readonly social_pref_id?: number;

  /**
   * 참여 기간 ID
   */
  @IsOptional()
  @IsInt({ message: '참여 기간 ID는 정수여야 합니다.' })
  @IsPositive({ message: '참여 기간 ID는 양수여야 합니다.' })
  readonly participation_terms_id?: number;

  /**
   * 선호 인원 수 ID
   */
  @IsOptional()
  @IsInt({ message: '선호 인원 수 ID는 정수여야 합니다.' })
  @IsPositive({ message: '선호 인원 수 ID는 양수여야 합니다.' })
  readonly preferred_member_count_id?: number;
}
