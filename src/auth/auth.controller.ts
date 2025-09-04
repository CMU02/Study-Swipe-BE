import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterCredentialsDto } from './dto/registerCredentials.dto';
import { BaseResponse } from 'src/base_response';
import { RequestVerificationCodeDto } from './dto/requestVerificationCode.dto';
import { ConfirmVerificationCode } from './dto/confirmVerificationCode.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('/register')
  register(
    @Body() registerCredentials: RegisterCredentialsDto,
  ): Promise<BaseResponse> {
    return this.authService.signUp(registerCredentials);
  }

  @Post('/send-verification-code')
  requestVerificationCode(
    @Body() verifyCode: RequestVerificationCodeDto,
  ): Promise<BaseResponse> {
    return this.authService.requestVerificationCode(verifyCode);
  }

  @Post('/confirm-verification-code')
  confirmVerificationcode(
    @Body() confirmVerifycode: ConfirmVerificationCode,
  ): Promise<BaseResponse> {
    return this.authService.cofirmVerificationCode(confirmVerifycode);
  }
}
