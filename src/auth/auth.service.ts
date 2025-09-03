import {
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/user/user.entity';
import { Repository } from 'typeorm';
import { SignUpDto } from './dto/signUp.dto';
import { BaseResponse } from 'src/base_response';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async signUp(signUpDto: SignUpDto): Promise<BaseResponse> {
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
      message: '성공적으로 등록되었습니다! 이제 가입을 완료하기 위해 이메일 인증을 진행해주세요.'
    };
  }
}
