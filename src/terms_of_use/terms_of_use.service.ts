import { HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TermsOfUse } from './terms_of_use.entity';
import { Repository } from 'typeorm';
import { CreateTermsOfUseDto } from './dto/create_Temrs_of_use.dto';
import { BaseResponse } from 'src/base_response';
import { User } from 'src/user/user.entity';

@Injectable()
export class TermsOfUseService {
  constructor(
    @InjectRepository(TermsOfUse)
    private readonly termsOfUseRepository: Repository<TermsOfUse>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  /**
   * 사용자의 약관 동의 내역을 생성
   */
  async createTerms(
    createTermsOfUse: CreateTermsOfUseDto,
  ): Promise<BaseResponse> {
    const { user_id, ...termsData } = createTermsOfUse;

    const user = await this.userRepository.findOne({ where: { user_id } });
    if (!user) {
      throw new NotFoundException('해당 아이디를 가진 사용자 없습니다.');
    }

    const newTermData = this.termsOfUseRepository.create({
      user,
      ...termsData,
    });

    await this.termsOfUseRepository.save(newTermData);

    return {
      status_code: HttpStatus.OK,
      message: '약관 동의를 완료했습니다.',
    };
  }
}
