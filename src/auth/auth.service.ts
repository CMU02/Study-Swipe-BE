import {
  BadRequestException,
  ConflictException,
  HttpException,
  HttpStatus,
  Injectable,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { BaseResponse } from 'src/base_response';
import { MailerService } from 'src/mailer/mailer.service';
import { VerificationStore } from 'src/mailer/verification.store';
import { User } from 'src/user/user.entity';
import { Repository } from 'typeorm';
import { ConfirmVerificationCode } from './dto/confirm_verification_code.dto';
import { RegisterCredentialsDto } from './dto/register_credentials.dto';
import { RequestVerificationCodeDto } from './dto/request_verification_code.dto';
import { SignInDto } from './dto/signIn.dto';

/**
 * 사용자 인증 관련 비즈니스 로직을 처리하는 서비스
 * 회원가입, 로그인, 이메일 인증 등의 기능을 제공합니다.
 */
@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly mailerService: MailerService,
    private readonly verificationStore: VerificationStore,
    private readonly jwtService: JwtService,
  ) {}

  private readonly logger = new Logger(AuthService.name);

  /**
   * 새로운 사용자를 등록합니다.
   * @param signUpDto 회원가입 정보 (사용자 ID, 비밀번호)
   * @returns 회원가입 결과를 담은 BaseResponse
   * @throws ConflictException 이미 존재하는 사용자 ID인 경우
   */
  async signUp(signUpDto: RegisterCredentialsDto): Promise<BaseResponse> {
    const { user_id, user_pwd } = signUpDto;

    // 중복 아이디 검증
    const existingUserId = await this.userRepository.findOne({
      where: { user_id },
    });
    if (existingUserId) {
      throw new ConflictException('이미 가입된 아이디입니다.');
    }

    // 비밀번호 해싱 (보안 강화를 위해 12 rounds 사용)
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(user_pwd, saltRounds);

    // 새 사용자 엔티티 생성
    const newUser = this.userRepository.create({
      user_id,
      password: hashedPassword,
    });

    // 데이터베이스에 사용자 정보 저장
    await this.userRepository.save(newUser);

    return {
      status_code: HttpStatus.CREATED,
      message:
        '아이디가 성공적으로 등록되었습니다. 이메일 인증을 진행해주세요.',
    };
  }

  /**
   * 이메일 인증 코드를 요청합니다.
   * @param verifyCodeDto 인증 코드 요청 정보 (사용자 ID, 이메일)
   * @returns 인증 코드 발송 결과를 담은 BaseResponse
   * @throws HttpException 쿨다운 시간이 남아있는 경우 (429)
   * @throws BadRequestException 존재하지 않는 사용자인 경우
   * @throws ConflictException 이미 인증 완료된 사용자인 경우
   * @throws ConflictException 이미 사용 중인 이메일인 경우
   */
  async requestVerificationCode(
    verifyCodeDto: RequestVerificationCodeDto,
  ): Promise<BaseResponse> {
    const { user_id, user_email } = verifyCodeDto;

    // 기존 인증 코드 요청 이력 확인
    const existingRequest = await this.verificationStore.getCode(user_email);

    if (existingRequest) {
      const now = Date.now();
      // 쿨다운 시간 확인 (스팸 방지)
      if (now < existingRequest.cooldownExpiresAtMs) {
        const remainingSeconds = Math.ceil(
          (existingRequest.cooldownExpiresAtMs - now) / 1000,
        );
        throw new HttpException(
          `${remainingSeconds}초 후에 다시 시도해주세요.`,
          HttpStatus.TOO_MANY_REQUESTS,
        );
      }
    }

    // 교육기관 이메일 형식 검증
    if (!this.isEducationEmail(user_email)) {
      throw new BadRequestException(
        '교육기관 이메일이 아닙니다. (.ac.kr, .edu, .academy)',
      );
    }

    // 이메일 중복 체크
    await this.checkEmailDuplicate(user_email);

    // 사용자 존재 여부 및 인증 상태 검증
    await this.validateUserForVerification(user_id);

    // 인증 코드 이메일 발송
    await this.mailerService.sendVerificationCode(user_email);

    return {
      status_code: HttpStatus.OK,
      message: '인증코드가 이메일로 발송되었습니다.',
    };
  }

  /**
   * 이메일 인증 코드를 확인하고 사용자 인증을 완료합니다.
   * @param confirmVerifyCode 인증 코드 확인 정보 (사용자 ID, 이메일, 인증 코드)
   * @returns 인증 완료 결과 및 JWT 토큰을 담은 BaseResponse
   * @throws NotFoundException 인증 정보가 만료된 경우
   * @throws UnauthorizedException 인증 코드가 올바르지 않은 경우
   * @throws NotFoundException 사용자를 찾을 수 없는 경우
   */
  async confirmVerificationCode(
    confirmVerifyCode: ConfirmVerificationCode,
  ): Promise<BaseResponse> {
    const { user_id, user_email, verify_code } = confirmVerifyCode;

    // 저장된 인증 코드 조회
    const verifyResult = await this.verificationStore.getCode(user_email);

    if (!verifyResult) {
      throw new NotFoundException(
        '인증 정보가 만료되었습니다. 코드를 다시 요청해주세요.',
      );
    }

    // 인증 코드 일치 여부 확인
    if (verifyResult.code !== verify_code) {
      throw new UnauthorizedException('인증코드가 올바르지 않습니다.');
    }

    // 사용자 정보 조회
    const user = await this.userRepository.findOne({ where: { user_id } });
    if (!user) {
      throw new NotFoundException('사용자 정보를 찾을 수 없습니다.');
    }

    // 사용자 이메일 인증 정보 업데이트
    user.email = user_email;
    user.email_verified = true;
    user.email_verified_at = new Date();

    // 변경사항 저장 및 인증 코드 정리
    await this.userRepository.save(user);
    await this.verificationStore.clearCode(user_email);

    // JWT 토큰 생성
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

  /**
   * 사용자 로그인을 처리합니다.
   * @param signInDto 로그인 정보 (사용자 ID, 비밀번호)
   * @returns 로그인 결과 및 JWT 토큰을 담은 BaseResponse
   * @throws UnauthorizedException 사용자 ID가 존재하지 않는 경우
   * @throws UnauthorizedException 비밀번호가 일치하지 않는 경우
   */
  async signin(signInDto: SignInDto): Promise<BaseResponse> {
    const { user_id, user_pwd } = signInDto;

    // 사용자 정보 조회
    const user = await this.userRepository.findOne({ where: { user_id } });
    if (!user) {
      throw new UnauthorizedException('아이디가 틀립니다.');
    }

    // 비밀번호 검증
    const isMatch = await bcrypt.compare(user_pwd, user.password);
    if (!isMatch) {
      throw new UnauthorizedException(
        '비밀번호가 틀립니다. 다시 시도해주세요.',
      );
    }

    // JWT 토큰 생성
    const { accessToken, refreshToken } = await this.generateToken(user);

    return {
      status_code: HttpStatus.OK,
      message: '로그인에 성공했습니다.',
      option: {
        data: { accessToken, refreshToken },
      },
    };
  }

  /**
   * 사용자를 위한 JWT 토큰을 생성합니다.
   * @param user 토큰을 생성할 사용자 엔티티
   * @returns Access Token과 Refresh Token을 포함한 객체
   * @private
   */
  private async generateToken(
    user: User,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    // JWT 페이로드 구성 (최소한의 정보만 포함)
    const payload = {
      uuid: user.uuid,
      userId: user.user_id,
    };

    // Access Token과 Refresh Token을 병렬로 생성
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: process.env.JWT_SECRET,
        expiresIn: '3h', // Access Token: 3시간
      }),
      this.jwtService.signAsync(payload, {
        secret: process.env.JWT_REFRESH_SECRET,
        expiresIn: '7d', // Refresh Token: 7일
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
   * 인증 코드 발송을 위한 사용자의 유효성을 검증합니다.
   * @param user_id 검증할 사용자의 ID
   * @throws BadRequestException 사용자가 존재하지 않는 경우
   * @throws ConflictException 이미 이메일 인증이 완료된 경우
   * @private
   */
  private async validateUserForVerification(user_id: string): Promise<void> {
    // 사용자 존재 여부 확인
    const findUser = await this.userRepository.findOne({
      where: { user_id },
    });

    if (!findUser) {
      throw new BadRequestException('해당 아이디를 가진 사용자가 없습니다.');
    }

    // 이미 인증 완료된 사용자인지 확인
    if (findUser.email_verified) {
      throw new ConflictException('이미 인증이 완료된 사용자입니다.');
    }
  }

  /**
   * 이메일 중복 여부를 확인합니다.
   * @param email 확인할 이메일 주소
   * @throws ConflictException 이미 사용 중인 이메일인 경우
   * @private
   */
  private async checkEmailDuplicate(email: string): Promise<void> {
    const existingEmail = await this.userRepository.findOne({
      where: { email },
    });

    if (existingEmail) {
      throw new ConflictException('이미 사용 중인 이메일입니다.');
    }
  }
}
