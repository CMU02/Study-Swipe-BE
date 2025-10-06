import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SocialPrefs } from './social_prefs.entity';

/**
 * 사교모임 선호도 관련 비즈니스 로직을 처리하는 서비스
 * 사교모임 가능 여부 정보를 관리합니다.
 */
@Injectable()
export class SocialPrefsService {
  constructor(
    @InjectRepository(SocialPrefs)
    private readonly socialPrefsRepository: Repository<SocialPrefs>,
  ) {}

  /**
   * 사교모임 선호도 이름으로 정보를 조회합니다.
   * @param name 사교모임 선호도 이름 (예: '네', '아니오', '가끔')
   * @returns 조회된 사교모임 선호도 엔티티
   * @throws NotFoundException 해당하는 사교모임 선호도가 존재하지 않을 경우
   */
  async findSocialPrefByName(name: string): Promise<SocialPrefs> {
    // 사교모임 선호도 이름으로 데이터베이스에서 조회
    const socialPref = await this.socialPrefsRepository.findOne({
      where: { name },
    });

    // 조회 결과가 없으면 예외 발생
    if (!socialPref) {
      throw new NotFoundException(
        '해당하는 사교모임 선호도가 존재하지 않습니다.',
      );
    }

    return socialPref;
  }

  /**
   * 모든 사교모임 선호도 목록을 조회합니다.
   * @returns 사교모임 선호도 목록
   */
  async findAllSocialPrefs(): Promise<SocialPrefs[]> {
    return this.socialPrefsRepository.find({
      order: { id: 'ASC' },
    });
  }
}
