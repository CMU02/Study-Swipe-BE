import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';

/**
 * JWT 토큰 기반 인증을 처리하는 가드
 * Authorization 헤더의 Bearer 토큰을 검증하고 사용자 정보를 요청 객체에 추가합니다.
 */
@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  /**
   * 요청의 JWT 토큰을 검증하고 사용자 정보를 추출합니다.
   * @param context 실행 컨텍스트
   * @returns 인증 성공 시 true
   * @throws UnauthorizedException 토큰이 없거나 유효하지 않은 경우
   */
  async canActivate(context: ExecutionContext): Promise<boolean> {
    // HTTP 요청 객체 추출
    const request = context.switchToHttp().getRequest();

    // Authorization 헤더에서 JWT 토큰 추출
    const token = this.extractTokenFromHeader(request);
    if (!token) {
      throw new UnauthorizedException('인증 토큰이 필요합니다.');
    }

    try {
      // JWT 토큰 검증 및 페이로드 추출
      const payload = await this.jwtService.verifyAsync(token, {
        secret: process.env.JWT_SECRET,
      });

      // 요청 객체에 사용자 정보 추가 (컨트롤러에서 사용 가능)
      request['user'] = payload;
    } catch (error) {
      throw new UnauthorizedException('인증 토큰이 유효하지 않습니다.');
    }

    return true;
  }

  /**
   * HTTP 요청 헤더에서 Bearer 토큰을 추출합니다.
   * @param request HTTP 요청 객체
   * @returns 추출된 JWT 토큰 또는 undefined
   * @private
   */
  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
