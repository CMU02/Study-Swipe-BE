import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/user/user.entity';
import { Repository } from 'typeorm';
import { RegisterCredentialsDto } from './dto/registerCredentials.dto';
import { BaseResponse } from 'src/base_response';
import * as bcrypt from 'bcrypt';
import { RequestVerificationCodeDto } from './dto/requestVerificationCode.dto';
import { MailerService } from 'src/mailer/mailer.service';
import { ConfirmVerificationCode } from './dto/confirmVerificationCode.dto';
import { VerificationStore } from 'src/mailer/verification.store';
import { emit } from 'process';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly mailerServcie: MailerService,
    private readonly verificationStore: VerificationStore,
    private readonly jwtService: JwtService,
  ) {}

  private readonly logger = new Logger(AuthService.name);

  async signUp(signUpDto: RegisterCredentialsDto): Promise<BaseResponse> {
    const { user_id, user_pwd } = signUpDto;
    // 중복 아이디 찾기
    const existingUserId = await this.userRepository.findOne({
      where: { user_id },
    });
    if (existingUserId) {
      throw new HttpException('이미 가입된 아이디입니다.', HttpStatus.CONFLICT);
    }

    // 비밀번호 해싱
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(user_pwd, saltRounds);

    // 새 유저 생성 (create는 동기 메서드이므로 await 불필요)
    const newUser = this.userRepository.create({
      user_id,
      password: hashedPassword,
    });

    // 유저정보 저장
    await this.userRepository.save(newUser);

    return {
      status_code: HttpStatus.CREATED,
      message:
        '아이디가 성공적으로 등록되었습니다. 이메일 인증을 진행해주세요.',
    };
  }

  async requestVerificationCode(
    verifyCodeDto: RequestVerificationCodeDto,
  ): Promise<BaseResponse> {
    const { user_id, user_email } = verifyCodeDto;

    // 1. 기존 요청코드가 있는지 확인
    const existingRequest = await this.verificationStore.getCode(user_email);

    if (existingRequest) {
      const now = Date.now();
      // 2. 현재 시간이 만료 시간 전인지 확인
      if (now < existingRequest.cooldownExpiresAtMs) {
        // 3. 남은 시간을 정확히 계산
        const remainingSeconds = Math.ceil(
          (existingRequest.cooldownExpiresAtMs - now) / 1000,
        );
        throw new HttpException(
          `${remainingSeconds}초 후에 다시 시도해주세요.`,
          HttpStatus.TOO_MANY_REQUESTS, // 429
        );
      }
    }

    // 4. 교육기관 이메일 형식 검증
    if (!this.isEducationEmail(user_email)) {
      throw new HttpException(
        '교육기관 이메일이 아닙니다. (.ac.kr, .edu, .academy)',
        HttpStatus.BAD_REQUEST,
      );
    }

    // 5. 유저 존재 여부 및 인증 상태 검증 (별도 메서드로 책임 분리)
    await this.vaildateUserForVerification(user_id);
    // 6. 모든 검증 통과 후 이메일 발송
    await this.mailerServcie.sendVerificationCode(user_email);

    return {
      status_code: HttpStatus.OK,
      message: '인증코드가 이메일로 발송되었습니다.',
    };
  }

  async cofirmVerificationCode(
    confirmVerifyCode: ConfirmVerificationCode,
  ): Promise<BaseResponse> {
    const { user_id, user_email, verify_code } = confirmVerifyCode;

    const verifyResult = await this.verificationStore.getCode(user_email);

    if (!verifyResult) {
      throw new HttpException(
        '인증 정보가 만료되었습니다. 코드를 다시 요청해주세요.',
        HttpStatus.NOT_FOUND, // 404
      );
    }
    if (verifyResult.code !== verify_code) {
      throw new HttpException(
        '인증코드가 올바르지 않습니다.',
        HttpStatus.UNAUTHORIZED, // 401
      );
    }

    const user = await this.userRepository.findOne({ where: { user_id } });
    if (!user) {
      throw new HttpException(
        '사용자 정보를 찾을 수 없습니다.',
        HttpStatus.NOT_FOUND, // 404
      );
    }

    user.email = user_email; // 인증에 사용된 이메일 저장
    user.email_verified = true; // 인증완료 상태로 변경
    user.email_verified_at = new Date(); // 인증 완료 시각 기록

    await this.userRepository.save(user);
    await this.verificationStore.clearCode(user_email);

    const { accessToken, refreshToken } = await this.generateToken(user);

    return {
      status_code: HttpStatus.OK,
      message: '인증이 완료되었습니다. 회원가입을 환영합니다!',
      option: {
        data: {
          accessToken,
          refreshToken,
        },
      },
    };
  }

  private async generateToken(
    user: User,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const payload = {
      id: user.id,
      userId: user.user_id,
    };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: process.env.JWT_SECRET,
        expiresIn: '3h',
      }),
      this.jwtService.signAsync(payload, {
        secret: process.env.JWT_REFRESH_SECRET,
        expiresIn: '7d',
      }),
    ]);

    return { accessToken, refreshToken };
  }

  /**
   * 교육기관 이메일 검증 유틸 함수
   * @param email 검증할 사용자 이메일
   */
  private isEducationEmail(email: string): boolean {
    // 1. 이메일 형식이 올바른지, @가 포함되어 있는지 기본적인 확인을 합니다.
    if (!email || !email.includes('@')) return false;

    // 2. '@'를 기준으로 뒷부분(도메인)을 추출하고, 소문자로 변환합니다.
    //    (예: 'USER@EXAMPLE.EDU' -> 'example.edu')
    const domain = email.split('@')[1].toLowerCase();

    // 3. 허용된 도메인 조건인지 확인합니다.
    const isAcKr = domain.endsWith('.ac.kr');
    const isEdu = domain.endsWith('.edu');
    const includesAcademy = domain.includes('.academy');

    // 4. 위 조건 중 하나라도 만족하면 true를 반환합니다.
    return isAcKr || isEdu || includesAcademy;
  }

  /**
   * 인증 코드 발송을 위한 유저의 유효성을 검증합니다.
   * 1. 유저가 존재하는지 확인합니다.
   * 2. 유저가 이미 이메일 인증을 완료했는지 확인합니다.
   * @param user_id 검증할 유저의 ID
   */
  private async vaildateUserForVerification(user_id: string): Promise<void> {
    const findUser = await this.userRepository.findOne({
      where: { user_id },
    });

    if (!findUser) {
      throw new HttpException(
        '해당 아이디를 가진 사용자는 없습니다.',
        HttpStatus.BAD_REQUEST,
      );
    }
    if (findUser.email_verified) {
      throw new HttpException(
        '이미 인증이 완료된 이메일입니다.',
        HttpStatus.CONFLICT,
      );
    }
  }
}
