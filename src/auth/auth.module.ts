import { Module } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MailerModule } from 'src/mailer/mailer.module';
import { User } from 'src/user/user.entity';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

/**
 * 인증 관련 기능을 제공하는 모듈
 * 회원가입, 로그인, 이메일 인증 등의 기능을 포함합니다.
 */
@Module({
  imports: [
    TypeOrmModule.forFeature([User]), // User 엔티티 등록
    MailerModule, // 이메일 발송 기능
  ],
  providers: [
    AuthService, // 인증 비즈니스 로직
    JwtService, // JWT 토큰 생성/검증
  ],
  controllers: [AuthController], // HTTP 엔드포인트
  exports: [AuthService], // 다른 모듈에서 사용 가능하도록 내보내기
})
export class AuthModule {}
