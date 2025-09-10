import { IsInt, IsNotEmpty, IsPositive } from 'class-validator';

/**
 * 프로필 협업 성향 업데이트 데이터 전송 객체
 * 사용자가 선택한 협업 성향 ID를 포함합니다.
 */
export class ProfileCollabStyleDto {
  /**
   * 협업 성향 ID (단일 선택)
   * @example 1 // 가르쳐주고 싶음(멘토)
   * @example 2 // 같이 성장(피어)
   * @example 3 // 배우고 싶음(러너)
   */
  @IsInt({ message: '협업 성향 ID는 정수여야 합니다.' })
  @IsNotEmpty({ message: '협업 성향 ID는 필수입니다.' })
  @IsPositive({ message: '협업 성향 ID는 양수여야 합니다.' })
  readonly collab_style_id: number;
}
