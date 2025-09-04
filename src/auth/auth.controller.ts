import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterCredentialsDto } from './dto/registerCredentials.dto';
import { BaseResponse } from 'src/base_response';
import { RequestVerificationCodeDto } from './dto/requestVerificationCode.dto';
import { ConfirmVerificationCode } from './dto/confirmVerificationCode.dto';
import { SignInDto } from './dto/signIn.dto';
import { Throttle } from '@nestjs/throttler';

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

  @Post('/signin')
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  signIn(@Body() signin: SignInDto): Promise<BaseResponse> {
    return this.authService.signin(signin);
  }
}
