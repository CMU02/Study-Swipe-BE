import { IsNotEmpty, IsString, Matches, MinLength } from 'class-validator';

/**
 * 회원가입 요청 데이터 전송 객체
 * 사용자 ID와 비밀번호 정보를 포함합니다.
 */
export class RegisterCredentialsDto {
  /**
   * 사용자 ID
   * 영문, 숫자, 언더스코어만 허용하며 3-20자 제한
   */
  @IsString({ message: '사용자 ID는 문자열이어야 합니다.' })
  @IsNotEmpty({ message: '사용자 ID는 필수입니다.' })
  @Matches(/^[a-zA-Z0-9_]{3,20}$/, {
    message:
      '사용자 ID는 영문, 숫자, 언더스코어만 사용하여 3-20자로 입력해주세요.',
  })
  readonly user_id: string;

  /**
   * 사용자 비밀번호
   * 최소 8자 이상, 영문 대소문자, 숫자, 특수문자 조합 권장
   */
  @IsString({ message: '비밀번호는 문자열이어야 합니다.' })
  @IsNotEmpty({ message: '비밀번호는 필수입니다.' })
  @MinLength(8, { message: '비밀번호는 최소 8자 이상이어야 합니다.' })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, {
    message: '비밀번호는 영문 대소문자, 숫자, 특수문자를 포함해야 합니다.',
  })
  readonly user_pwd: string;
}
