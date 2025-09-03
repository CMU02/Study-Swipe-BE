import { IsEmail, IsString, MinLength } from 'class-validator';

export class SignUpDto {
    @IsString()
    user_id: string;

    @IsEmail({}, { message: '유효한 이메일 주소를 입력해주세요.'})
    user_email: string;

    @IsString()
    @MinLength(8, { message : '비밀번호는 최소 8자 이상이어야 합니다.'})
    user_pwd: string;
}