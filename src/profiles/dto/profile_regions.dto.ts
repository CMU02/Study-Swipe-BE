import { IsOptional, IsString } from 'class-validator';

/**
 * 프로필 지역 정보 업데이트 데이터 전송 객체
 * 사용자가 선호하는 단일 지역 ID를 포함합니다.
 */
export class ProfileRegionsDto {
  /**
   * 지역 ID (단일 선택)
   * null 또는 빈 문자열을 전송하면 지역이 제거됩니다.
   */
  @IsOptional()
  @IsString({ message: '지역 ID는 문자열이어야 합니다.' })
  readonly region_id: string;
}
