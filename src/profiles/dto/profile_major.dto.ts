import { IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';

/**
 * 프로필 전공 업데이트 데이터 전송 객체
 * 사용자가 직접 입력한 전공명을 포함합니다.
 */
export class ProfileMajorDto {
  /**
   * 전공명 (사용자 직접 입력)
   * @example '컴퓨터공학과'
   * @example '경영학부'
   * @example '시각디자인학과'
   * @example '심리학과'
   */
  @IsString({ message: '전공명은 문자열이어야 합니다.' })
  @IsNotEmpty({ message: '전공명은 필수입니다.' })
  @MinLength(2, { message: '전공명은 최소 2글자 이상이어야 합니다.' })
  @MaxLength(50, { message: '전공명은 최대 50글자까지 입력 가능합니다.' })
  readonly major_name: string;
}
