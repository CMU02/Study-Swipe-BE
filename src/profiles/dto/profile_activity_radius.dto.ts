import { IsInt, IsNotEmpty, Max, Min } from 'class-validator';

/**
 * 프로필 활동 반경 업데이트 데이터 전송 객체
 * 활동 반경 정보를 포함합니다.
 */
export class ProfileActivityRadiusDto {
  /**
   * 활동 반경 (킬로미터 단위, 1-50km)
   */
  @IsInt({ message: '활동 반경은 정수여야 합니다.' })
  @IsNotEmpty({ message: '활동 반경은 필수입니다.' })
  @Min(1, { message: '활동 반경은 최소 1km 이상이어야 합니다.' })
  @Max(50, { message: '활동 반경은 최대 50km까지 가능합니다.' })
  readonly activity_radius_km: number;
}
