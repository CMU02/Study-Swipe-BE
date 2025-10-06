import {
  IsInt,
  IsPositive,
  IsString,
  IsNotEmpty,
  Matches,
} from 'class-validator';

/**
 * 프로필 참여 정보 업데이트 데이터 전송 객체
 * 참여 기간, 시간 등의 정보를 포함합니다.
 */
export class ProfileParticipationInfoDto {
  /**
   * 참여기간 (개월 수)
   * @example 1, 2, 3
   */
  @IsInt({ message: '참여기간은 정수여야 합니다.' })
  @IsPositive({ message: '참여기간은 양수여야 합니다.' })
  readonly period: number;

  /**
   * 참여기간의 길이 분류
   * @example '단기', '중기', '장기'
   */
  @IsString({ message: '참여기간 길이는 문자열이어야 합니다.' })
  @IsNotEmpty({ message: '참여기간 길이는 필수입니다.' })
  readonly period_length: string;

  /**
   * 시작시간 (HH:MM 형식)
   * @example '09:00', '14:00'
   */
  @IsString({ message: '시작시간은 문자열이어야 합니다.' })
  @Matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, {
    message: '시작시간은 HH:MM 형식이어야 합니다. (예: 09:00)',
  })
  readonly start_time: string;

  /**
   * 마침시간 (HH:MM 형식)
   * @example '18:00', '22:00'
   */
  @IsString({ message: '마침시간은 문자열이어야 합니다.' })
  @Matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, {
    message: '마침시간은 HH:MM 형식이어야 합니다. (예: 18:00)',
  })
  readonly end_time: string;
}
