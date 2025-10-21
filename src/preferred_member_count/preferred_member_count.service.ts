import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PreferredMemberCount } from './preferred_member_count.entity';

/**
 * 선호 인원 수 관련 비즈니스 로직을 처리하는 서비스
 * 스터디 그룹의 최소/최대 인원 수 선호도를 관리합니다.
 */
@Injectable()
export class PreferredMemberCountService {
  constructor(
    @InjectRepository(PreferredMemberCount)
    private readonly preferredMemberCountRepository: Repository<PreferredMemberCount>,
  ) {}

  /**
   * 선호 인원 수 정보를 생성하거나 업데이트합니다.
   * @param profileId 프로필 ID
   * @param minCount 최소 인원 수
   * @param maxCount 최대 인원 수
   * @returns 생성되거나 업데이트된 선호 인원 수 엔티티
   * @throws Error 최소 인원이 최대 인원보다 큰 경우
   */
  async createOrUpdatePreferredMemberCount(
    profileId: number,
    minCount: number,
    maxCount: number,
  ): Promise<PreferredMemberCount> {
    // 유효성 검증
    if (minCount > maxCount) {
      throw new BadRequestException(
        '최소 인원 수는 최대 인원 수보다 클 수 없습니다.',
      );
    }

    if (minCount < 2 || maxCount > 10) {
      throw new BadRequestException('인원 수는 2명 이상 10명 이하여야 합니다.');
    }

    // 해당 프로필의 기존 선호 인원 수 조회
    let preferredMemberCount =
      await this.preferredMemberCountRepository.findOne({
        where: { profileId },
      });

    if (preferredMemberCount) {
      // 기존 레코드가 있으면 업데이트
      preferredMemberCount.min_member_count = minCount;
      preferredMemberCount.max_member_count = maxCount;
    } else {
      // 없으면 새로 생성
      preferredMemberCount = this.preferredMemberCountRepository.create({
        profileId,
        min_member_count: minCount,
        max_member_count: maxCount,
      });
    }

    await this.preferredMemberCountRepository.save(preferredMemberCount);

    return preferredMemberCount;
  }

  /**
   * ID로 선호 인원 수 정보를 조회합니다.
   * @param id 선호 인원 수 ID
   * @returns 선호 인원 수 엔티티
   * @throws NotFoundException 해당 ID의 선호 인원 수가 존재하지 않을 경우
   */
  async findPreferredMemberCountById(
    id: number,
  ): Promise<PreferredMemberCount> {
    const preferredMemberCount =
      await this.preferredMemberCountRepository.findOne({
        where: { id },
      });

    if (!preferredMemberCount) {
      throw new NotFoundException(
        '해당하는 선호 인원 수 정보가 존재하지 않습니다.',
      );
    }

    return preferredMemberCount;
  }

  /**
   * 모든 선호 인원 수 목록을 조회합니다.
   * @returns 선호 인원 수 목록
   */
  async findAllPreferredMemberCounts(): Promise<PreferredMemberCount[]> {
    return this.preferredMemberCountRepository.find({
      order: { min_member_count: 'ASC', max_member_count: 'ASC' },
    });
  }
}
