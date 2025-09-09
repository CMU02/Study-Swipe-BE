import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsInt,
  IsPositive,
} from 'class-validator';

/**
 * 프로필 지역 정보 업데이트 데이터 전송 객체
 * 사용자가 선호하는 지역 ID 목록을 포함합니다.
 */
export class ProfileRegionsDto {
  /**
   * 지역 ID 배열 (최대 5개까지 선택 가능)
   * 빈 배열을 전송하면 모든 지역이 제거됩니다.
   */
  @IsArray({ message: '지역 ID는 배열이어야 합니다.' })
  @IsInt({ each: true, message: '지역 ID는 정수여야 합니다.' })
  @IsPositive({ each: true, message: '지역 ID는 양수여야 합니다.' })
  @ArrayMinSize(0, { message: '지역은 최소 0개 이상 선택할 수 있습니다.' })
  @ArrayMaxSize(5, { message: '지역은 최대 5개까지 선택할 수 있습니다.' })
  readonly region_ids: string[];
}
