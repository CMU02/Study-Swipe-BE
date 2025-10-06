import { Body, Controller, Post } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { BaseResponse } from 'src/base_response';
import { AuthService } from './auth.service';
import { ConfirmVerificationCode } from './dto/confirm_verification_code.dto';
import { RegisterCredentialsDto } from './dto/register_credentials.dto';
import { RequestVerificationCodeDto } from './dto/request_verification_code.dto';
import { SignInDto } from './dto/signIn.dto';

/**
 * 사용자 인증 관련 HTTP 엔드포인트를 처리하는 컨트롤러
 * 회원가입, 로그인, 이메일 인증 등의 API를 제공합니다.
 */
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * 새로운 사용자를 등록합니다.
   * @param registerCredentials 회원가입 정보
   * @returns 회원가입 결과
   */
  @Post('/register')
  async register(
    @Body() registerCredentials: RegisterCredentialsDto,
  ): Promise<BaseResponse> {
    return this.authService.signUp(registerCredentials);
  }

  /**
   * 이메일 인증 코드를 발송합니다.
   * @param verifyCode 인증 코드 요청 정보
   * @returns 인증 코드 발송 결과
   */
  @Post('/send-verification-code')
  async requestVerificationCode(
    @Body() verifyCode: RequestVerificationCodeDto,
  ): Promise<BaseResponse> {
    return this.authService.requestVerificationCode(verifyCode);
  }

  /**
   * 이메일 인증 코드를 확인하고 인증을 완료합니다.
   * @param confirmVerifyCode 인증 코드 확인 정보
   * @returns 인증 완료 결과 및 JWT 토큰
   */
  @Post('/confirm-verification-code')
  async confirmVerificationCode(
    @Body() confirmVerifyCode: ConfirmVerificationCode,
  ): Promise<BaseResponse> {
    return this.authService.confirmVerificationCode(confirmVerifyCode);
  }

  /**
   * 사용자 로그인을 처리합니다.
   * 브루트 포스 공격 방지를 위해 1분간 5회로 제한됩니다.
   * @param signIn 로그인 정보
   * @returns 로그인 결과 및 JWT 토큰
   */
  @Post('/signin')
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  async signIn(@Body() signIn: SignInDto): Promise<BaseResponse> {
    return this.authService.signin(signIn);
  }
}
