import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/user/user.entity';
import { AuthController } from './auth.controller';
import { MailerModule } from 'src/mailer/mailer.module';
import { JwtService } from '@nestjs/jwt';

@Module({
  imports: [TypeOrmModule.forFeature([User]), MailerModule],
  providers: [AuthService, JwtService],
  exports: [AuthService],
  controllers: [AuthController],
})
export class AuthModule {}
