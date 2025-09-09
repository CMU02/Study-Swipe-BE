import { IsEmail, IsNotEmpty, IsString, Length } from "class-validator";

export class ConfirmVerificationCode {
  @IsString()
  @IsNotEmpty()
  user_id: string;

  @IsEmail()
  @IsNotEmpty()
  user_email: string;

  @IsString()
  @IsNotEmpty()
  @Length(6, 6) // 인증 코드가 6자리라고 가정
  verify_code: string;
}
