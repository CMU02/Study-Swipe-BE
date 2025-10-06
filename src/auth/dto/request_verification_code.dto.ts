import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

/**
 * 이메일 인증 코드 요청 데이터 전송 객체
 * 사용자 ID와 인증받을 이메일 주소를 포함합니다.
 */
export class RequestVerificationCodeDto {
  /**
   * 사용자 ID
   */
  @IsString({ message: '사용자 ID는 문자열이어야 합니다.' })
  @IsNotEmpty({ message: '사용자 ID는 필수입니다.' })
  readonly user_id: string;

  /**
   * 인증받을 이메일 주소
   * 교육기관 이메일 권장 (.ac.kr, .edu 등)
   */
  @IsEmail({}, { message: '올바른 이메일 형식이 아닙니다.' })
  @IsNotEmpty({ message: '이메일 주소는 필수입니다.' })
  readonly user_email: string;
}
