import { IsEmail, IsNotEmpty, IsString } from "class-validator";

export class RequestVerificationCodeDto {
  @IsString()
  @IsNotEmpty()
  user_id: string;

  @IsEmail()
  @IsNotEmpty()
  user_email: string;
}
