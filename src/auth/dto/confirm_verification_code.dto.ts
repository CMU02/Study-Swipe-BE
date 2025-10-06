import {
  IsEmail,
  IsNotEmpty,
  IsString,
  Length,
  Matches,
} from 'class-validator';

/**
 * 이메일 인증 코드 확인 데이터 전송 객체
 * 사용자 ID, 이메일 주소, 인증 코드를 포함합니다.
 */
export class ConfirmVerificationCode {
  /**
   * 사용자 ID
   */
  @IsString({ message: '사용자 ID는 문자열이어야 합니다.' })
  @IsNotEmpty({ message: '사용자 ID는 필수입니다.' })
  readonly user_id: string;

  /**
   * 인증받을 이메일 주소
   */
  @IsEmail({}, { message: '올바른 이메일 형식이 아닙니다.' })
  @IsNotEmpty({ message: '이메일 주소는 필수입니다.' })
  readonly user_email: string;

  /**
   * 6자리 숫자 인증 코드
   */
  @IsString({ message: '인증 코드는 문자열이어야 합니다.' })
  @IsNotEmpty({ message: '인증 코드는 필수입니다.' })
  @Length(6, 6, { message: '인증 코드는 6자리여야 합니다.' })
  @Matches(/^\d{6}$/, { message: '인증 코드는 6자리 숫자여야 합니다.' })
  readonly verify_code: string;
}
