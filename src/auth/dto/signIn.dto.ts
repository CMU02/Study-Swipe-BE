import { IsNotEmpty, IsString } from 'class-validator';

/**
 * 로그인 요청 데이터 전송 객체
 * 사용자 ID와 비밀번호 정보를 포함합니다.
 */
export class SignInDto {
  /**
   * 사용자 ID
   */
  @IsString({ message: '사용자 ID는 문자열이어야 합니다.' })
  @IsNotEmpty({ message: '사용자 ID는 필수입니다.' })
  readonly user_id: string;

  /**
   * 사용자 비밀번호
   */
  @IsString({ message: '비밀번호는 문자열이어야 합니다.' })
  @IsNotEmpty({ message: '비밀번호는 필수입니다.' })
  readonly user_pwd: string;
}
