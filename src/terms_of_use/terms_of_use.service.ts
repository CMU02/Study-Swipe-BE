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
   * 사용자의 약관 동의 내역을 생성하거나 업데이트합니다.
   * @param createTermsOfUse 약관 동의 정보
   * @returns 처리 결과를 담은 BaseResponse
   * @throws NotFoundException 사용자가 존재하지 않을 경우
   */
  async createOrUpdateTerms(
    createTermsOfUse: CreateTermsOfUseDto,
  ): Promise<BaseResponse> {
    const { user_id, ...termsData } = createTermsOfUse;

    // 사용자 존재 여부 확인
    const user = await this.userRepository.findOne({ where: { user_id } });
    if (!user) {
      throw new NotFoundException('해당 아이디를 가진 사용자가 없습니다.');
    }

    // 기존 약관 동의 내역 조회
    let existingTerms = await this.termsOfUseRepository.findOne({
      where: { user: { uuid: user.uuid } },
    });

    let isUpdate = false;

    if (existingTerms) {
      // 기존 약관 동의 내역이 있으면 업데이트
      Object.assign(existingTerms, termsData);
      await this.termsOfUseRepository.save(existingTerms);
      isUpdate = true;
    } else {
      // 없으면 새로 생성
      const newTermData = this.termsOfUseRepository.create({
        user,
        ...termsData,
      });
      await this.termsOfUseRepository.save(newTermData);
    }

    return {
      status_code: isUpdate ? HttpStatus.OK : HttpStatus.CREATED,
      message: isUpdate
        ? '약관 동의 내역이 업데이트되었습니다.'
        : '약관 동의를 완료했습니다.',
    };
  }

  /**
   * 사용자의 약관 동의 내역을 조회합니다.
   * @param user_id 사용자 ID
   * @returns 약관 동의 내역을 담은 BaseResponse
   * @throws NotFoundException 사용자가 존재하지 않을 경우
   */
  async getTerms(user_id: string): Promise<BaseResponse> {
    // 사용자 존재 여부 확인
    const user = await this.userRepository.findOne({ where: { user_id } });
    if (!user) {
      throw new NotFoundException('해당 아이디를 가진 사용자가 없습니다.');
    }

    // 약관 동의 내역 조회
    const terms = await this.termsOfUseRepository.findOne({
      where: { user: { uuid: user.uuid } },
    });

    if (!terms) {
      throw new NotFoundException('약관 동의 내역이 존재하지 않습니다.');
    }

    return {
      status_code: HttpStatus.OK,
      message: '약관 동의 내역 조회 성공',
      option: {
        meta_data: {
          terms,
        },
      },
    };
  }
}
