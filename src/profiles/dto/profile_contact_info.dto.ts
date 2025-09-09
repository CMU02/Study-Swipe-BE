import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

/**
 * 프로필 연락 방법 업데이트 데이터 전송 객체
 * 연락 방법 정보를 포함합니다.
 */
export class ProfileContactInfoDto {
  /**
   * 연락 방법 (카카오톡, 디스코드 등, 최대 100자)
   */
  @IsString({ message: '연락 방법은 문자열이어야 합니다.' })
  @IsNotEmpty({ message: '연락 방법은 필수입니다.' })
  @MaxLength(100, { message: '연락 방법은 최대 100자까지 가능합니다.' })
  readonly contact_info: string;
}
