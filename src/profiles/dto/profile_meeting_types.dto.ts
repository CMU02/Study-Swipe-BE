import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsInt,
  IsPositive,
} from 'class-validator';

/**
 * 프로필 모임 유형 업데이트 데이터 전송 객체
 * 사용자가 선호하는 모임 유형 ID 목록을 포함합니다.
 */
export class ProfileMeetingTypesDto {
  /**
   * 모임 유형 ID 배열 (최대 3개까지 선택 가능)
   * 빈 배열을 전송하면 모든 모임 유형이 제거됩니다.
   * @example [1, 2] // 온라인, 오프라인
   */
  @IsArray({ message: '모임 유형 ID는 배열이어야 합니다.' })
  @IsInt({ each: true, message: '모임 유형 ID는 정수여야 합니다.' })
  @IsPositive({ each: true, message: '모임 유형 ID는 양수여야 합니다.' })
  @ArrayMinSize(0, { message: '모임 유형은 최소 0개 이상 선택할 수 있습니다.' })
  @ArrayMaxSize(3, { message: '모임 유형은 최대 3개까지 선택할 수 있습니다.' })
  readonly meeting_type_ids: number[];
}
