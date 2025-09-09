import { HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BaseResponse, UpsertProps } from 'src/base_response';
import { SmokingStatusService } from 'src/smoking_status/smoking_status.service';
import { UserService } from 'src/user/user.service';
import { ProfileBasicDto } from './dto/profile_basic.dto';
import { Profiles } from './profiles.entity';

/**
 * 사용자 프로필 관련 비즈니스 로직을 처리하는 서비스
 * 프로필 생성, 조회, 수정, 관련 엔티티 업데이트 등의 기능을 제공합니다.
 */
@Injectable()
export class ProfilesService {
  constructor(
    @InjectRepository(Profiles)
    private readonly profilesRepository: Repository<Profiles>,
    private readonly userService: UserService,
    private readonly smokingStatusService: SmokingStatusService,
  ) {}

  /**
   * 사용자의 프로필 정보를 조회합니다.
   * @param uuid 사용자 UUID
   * @returns 프로필 정보를 담은 BaseResponse
   * @throws NotFoundException 프로필이 존재하지 않을 경우
   */
  async getProfile(uuid: string): Promise<BaseResponse> {
    // 사용자 존재 여부 확인
    await this.userService.findUserUuid(uuid);

    // 프로필 조회 (관련 엔티티 포함)
    const profile = await this.profilesRepository.findOne({
      where: { user: { uuid } },
      relations: [
        'smoking_status',
        'social_pref',
        'participation_terms',
        'preferred_member_count',
        'regions',
        'meeting_types',
        'major',
        'collab_style',
      ],
    });

    if (!profile) {
      throw new NotFoundException('프로필 정보를 찾을 수 없습니다.');
    }

    return {
      status_code: HttpStatus.OK,
      message: '프로필 조회 성공',
      option: {
        meta_data: {
          profile,
        },
      },
    };
  }

  /**
   * 사용자의 기본 프로필 정보를 생성하거나 업데이트합니다.
   * @param props uuid, dto, target을 포함하는 UpsertProps 객체
   * @returns 처리 결과를 담은 BaseResponse
   */
  async upsertBasicProfile({
    ...props
  }: UpsertProps<ProfileBasicDto>): Promise<BaseResponse> {
    const { uuid, dto, target } = props;

    // 사용자 정보 조회
    const user = await this.userService.findUserUuid(uuid);

    // 기존 프로필 조회 또는 새로 생성
    let profile = await this.findOrCreateProfile(user.uuid);

    // DTO 데이터를 프로필 객체에 병합
    Object.assign(profile, dto);
    await this.profilesRepository.save(profile);

    return {
      status_code: target === 'create' ? HttpStatus.CREATED : HttpStatus.OK,
      message:
        target === 'update'
          ? '기본 프로필 업데이트 성공'
          : '기본 프로필 생성 완료',
    };
  }

  /**
   * 사용자 프로필의 흡연 상태를 업데이트합니다.
   * @param uuid 사용자 UUID
   * @param smokingStatusName 흡연 상태 이름 (예: '흡연', '비흡연', '무관')
   * @returns 처리 결과를 담은 BaseResponse
   * @throws NotFoundException 사용자나 흡연 상태가 존재하지 않을 경우
   */
  async updateSmokingStatus(
    uuid: string,
    smokingStatusName: string,
  ): Promise<BaseResponse> {
    // 사용자 존재 여부 확인
    await this.userService.findUserUuid(uuid);

    // 기존 프로필 조회 또는 새로 생성
    const profile = await this.findOrCreateProfile(uuid);

    // 흡연 상태 조회
    const smokingStatus =
      await this.smokingStatusService.findSmokingStatusName(smokingStatusName);

    // 프로필에 흡연 상태 설정 및 저장
    profile.smoking_status = smokingStatus;
    await this.profilesRepository.save(profile);

    return {
      status_code: HttpStatus.OK,
      message: '흡연 상태가 성공적으로 업데이트되었습니다.',
    };
  }

  /**
   * 사용자의 프로필을 조회하거나 없으면 새로 생성합니다.
   * @param uuid 사용자 UUID
   * @returns 프로필 엔티티
   * @private
   */
  private async findOrCreateProfile(uuid: string): Promise<Profiles> {
    // 기존 프로필 조회
    let profile = await this.profilesRepository.findOne({
      where: { user: { uuid } },
    });

    if (!profile) {
      // 프로필이 없으면 사용자 정보를 다시 조회하여 새로 생성
      const user = await this.userService.findUserUuid(uuid);
      profile = this.profilesRepository.create({ user });
      await this.profilesRepository.save(profile);
    }

    return profile;
  }
}
