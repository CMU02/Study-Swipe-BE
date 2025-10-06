import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Profiles } from 'src/profiles/profiles.entity';
import { participationInfo } from './participation_info.entity';

/**
 * 참여 정보 관련 비즈니스 로직을 처리하는 서비스
 * 사용자별 개별 참여 정보 생성, 조회, 수정 기능을 제공합니다.
 */
@Injectable()
export class ParticipationInfoService {
  constructor(
    @InjectRepository(participationInfo)
    private readonly participationInfoRepository: Repository<participationInfo>,
  ) {}

  /**
   * 프로필 ID로 참여 정보를 조회합니다.
   * @param profileId 프로필 ID
   * @returns 참여 정보 엔티티 또는 null
   */
  async findParticipationInfoByProfileId(
    profileId: number,
  ): Promise<participationInfo | null> {
    return this.participationInfoRepository.findOne({
      where: { profile: { id: profileId } },
      relations: ['profile'],
    });
  }

  /**
   * 사용자의 참여 정보를 생성하거나 업데이트합니다.
   * @param profile 프로필 엔티티
   * @param period 참여기간 (개월)
   * @param periodLength 참여기간 길이
   * @param startTime 시작시간
   * @param endTime 마침시간
   * @returns 참여 정보 엔티티
   */
  async createOrUpdateParticipationInfo(
    profile: Profiles,
    period: number,
    periodLength: string,
    startTime: string,
    endTime: string,
  ): Promise<participationInfo> {
    // 기존 참여 정보가 있는지 확인
    let participationInfo = await this.findParticipationInfoByProfileId(
      profile.id,
    );

    if (participationInfo) {
      // 기존 정보 업데이트
      participationInfo.period = period;
      participationInfo.period_length = periodLength;
      participationInfo.start_time = startTime;
      participationInfo.end_time = endTime;
    } else {
      // 새로운 참여 정보 생성
      participationInfo = this.participationInfoRepository.create({
        profile,
        period,
        period_length: periodLength,
        start_time: startTime,
        end_time: endTime,
      });
    }

    return this.participationInfoRepository.save(participationInfo);
  }

  /**
   * 참여 정보를 삭제합니다.
   * @param profileId 프로필 ID
   * @returns 삭제 성공 여부
   */
  async deleteParticipationInfo(profileId: number): Promise<boolean> {
    const participationInfo =
      await this.findParticipationInfoByProfileId(profileId);

    if (participationInfo) {
      await this.participationInfoRepository.softDelete(participationInfo.id);
      return true;
    }

    return false;
  }
}
