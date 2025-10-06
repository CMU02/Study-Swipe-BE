import { IsInt, IsNotEmpty, Max, Min } from 'class-validator';

/**
 * 프로필 선호 인원 수 업데이트 데이터 전송 객체
 * 스터디 그룹의 최소/최대 인원 수 선호도 정보를 포함합니다.
 */
export class ProfilePreferredMemberCountDto {
  /**
   * 최소 선호 인원 수 (2-10명)
   */
  @IsInt({ message: '최소 인원 수는 정수여야 합니다.' })
  @IsNotEmpty({ message: '최소 인원 수는 필수입니다.' })
  @Min(2, { message: '최소 인원 수는 2명 이상이어야 합니다.' })
  @Max(10, { message: '최소 인원 수는 10명 이하여야 합니다.' })
  readonly min_member_count: number;

  /**
   * 최대 선호 인원 수 (2-10명)
   */
  @IsInt({ message: '최대 인원 수는 정수여야 합니다.' })
  @IsNotEmpty({ message: '최대 인원 수는 필수입니다.' })
  @Min(2, { message: '최대 인원 수는 2명 이상이어야 합니다.' })
  @Max(10, { message: '최대 인원 수는 10명 이하여야 합니다.' })
  readonly max_member_count: number;
}
