import { HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BaseResponse, UpsertProps } from 'src/base_response';
import { PreferredMemberCountService } from 'src/preferred_member_count/preferred_member_count.service';
import { RegionsService } from 'src/regions/regions.service';
import { SmokingStatusService } from 'src/smoking_status/smoking_status.service';
import { SocialPrefsService } from 'src/social_prefs/social_prefs.service';
import { UserService } from 'src/user/user.service';
import { ProfileBasicDto } from './dto/profile_basic.dto';
import { ProfileStudyDto } from './dto/profile_study.dto';
import { Profiles } from './profiles.entity';
import { Regions } from 'src/regions/regions.entity';

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
    private readonly socialPrefsService: SocialPrefsService,
    private readonly preferredMemberCountService: PreferredMemberCountService,
    private readonly regionsService: RegionsService,
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
   * 사용자 프로필의 사교모임 선호도를 업데이트합니다.
   * @param uuid 사용자 UUID
   * @param socialPrefName 사교모임 선호도 이름 (예: '네', '아니오', '가끔')
   * @returns 처리 결과를 담은 BaseResponse
   * @throws NotFoundException 사용자나 사교모임 선호도가 존재하지 않을 경우
   */
  async updateSocialPref(
    uuid: string,
    socialPrefName: string,
  ): Promise<BaseResponse> {
    // 사용자 존재 여부 확인
    await this.userService.findUserUuid(uuid);

    // 기존 프로필 조회 또는 새로 생성
    const profile = await this.findOrCreateProfile(uuid);

    // 사교모임 선호도 조회
    const socialPref =
      await this.socialPrefsService.findSocialPrefByName(socialPrefName);

    // 프로필에 사교모임 선호도 설정 및 저장
    profile.social_pref = socialPref;
    await this.profilesRepository.save(profile);

    return {
      status_code: HttpStatus.OK,
      message: '사교모임 선호도가 성공적으로 업데이트되었습니다.',
    };
  }

  /**
   * 사용자 프로필의 선호 인원 수를 업데이트합니다.
   * @param uuid 사용자 UUID
   * @param minCount 최소 선호 인원 수
   * @param maxCount 최대 선호 인원 수
   * @returns 처리 결과를 담은 BaseResponse
   * @throws NotFoundException 사용자가 존재하지 않을 경우
   * @throws Error 인원 수 범위가 유효하지 않을 경우
   */
  async updatePreferredMemberCount(
    uuid: string,
    minCount: number,
    maxCount: number,
  ): Promise<BaseResponse> {
    // 사용자 존재 여부 확인
    await this.userService.findUserUuid(uuid);

    // 기존 프로필 조회 또는 새로 생성
    const profile = await this.findOrCreateProfile(uuid);

    // 선호 인원 수 생성 또는 조회
    const preferredMemberCount =
      await this.preferredMemberCountService.createOrUpdatePreferredMemberCount(
        minCount,
        maxCount,
      );

    // 프로필에 선호 인원 수 설정 및 저장
    profile.preferred_member_count = preferredMemberCount;
    await this.profilesRepository.save(profile);

    return {
      status_code: HttpStatus.OK,
      message: '선호 인원 수가 성공적으로 업데이트되었습니다.',
    };
  }

  /**
   * 사용자의 학습 관련 프로필 정보를 업데이트합니다.
   * @param uuid 사용자 UUID
   * @param dto 학습 관련 정보 DTO
   * @returns 처리 결과를 담은 BaseResponse
   * @throws NotFoundException 사용자가 존재하지 않을 경우
   */
  async updateStudyProfile(
    uuid: string,
    dto: ProfileStudyDto,
  ): Promise<BaseResponse> {
    // 사용자 존재 여부 확인
    await this.userService.findUserUuid(uuid);

    // 기존 프로필 조회 또는 새로 생성
    const profile = await this.findOrCreateProfile(uuid);

    // DTO 데이터를 프로필 객체에 병합 (undefined 값은 제외)
    Object.keys(dto).forEach((key) => {
      if (dto[key] !== undefined) {
        profile[key] = dto[key];
      }
    });

    // 프로필 저장
    await this.profilesRepository.save(profile);

    return {
      status_code: HttpStatus.OK,
      message: '학습 관련 프로필 정보가 성공적으로 업데이트되었습니다.',
    };
  }

  /**
   * 사용자의 학습 목표를 업데이트합니다.
   * @param uuid 사용자 UUID
   * @param goalsNote 학습 목표 및 다짐
   * @returns 처리 결과를 담은 BaseResponse
   * @throws NotFoundException 사용자가 존재하지 않을 경우
   */
  async updateGoalsNote(
    uuid: string,
    goalsNote: string,
  ): Promise<BaseResponse> {
    // 사용자 존재 여부 확인
    await this.userService.findUserUuid(uuid);

    // 기존 프로필 조회 또는 새로 생성
    const profile = await this.findOrCreateProfile(uuid);

    // 학습 목표 업데이트
    profile.goals_note = goalsNote;
    await this.profilesRepository.save(profile);

    return {
      status_code: HttpStatus.OK,
      message: '학습 목표가 성공적으로 업데이트되었습니다.',
    };
  }

  /**
   * 사용자의 활동 반경을 업데이트합니다.
   * @param uuid 사용자 UUID
   * @param activityRadiusKm 활동 반경 (킬로미터)
   * @returns 처리 결과를 담은 BaseResponse
   * @throws NotFoundException 사용자가 존재하지 않을 경우
   */
  async updateActivityRadius(
    uuid: string,
    activityRadiusKm: number,
  ): Promise<BaseResponse> {
    // 사용자 존재 여부 확인
    await this.userService.findUserUuid(uuid);

    // 기존 프로필 조회 또는 새로 생성
    const profile = await this.findOrCreateProfile(uuid);

    // 활동 반경 업데이트
    profile.activity_radius_km = activityRadiusKm;
    await this.profilesRepository.save(profile);

    return {
      status_code: HttpStatus.OK,
      message: '활동 반경이 성공적으로 업데이트되었습니다.',
    };
  }

  /**
   * 사용자의 연락 방법을 업데이트합니다.
   * @param uuid 사용자 UUID
   * @param contactInfo 연락 방법
   * @returns 처리 결과를 담은 BaseResponse
   * @throws NotFoundException 사용자가 존재하지 않을 경우
   */
  async updateContactInfo(
    uuid: string,
    contactInfo: string,
  ): Promise<BaseResponse> {
    // 사용자 존재 여부 확인
    await this.userService.findUserUuid(uuid);

    // 기존 프로필 조회 또는 새로 생성
    const profile = await this.findOrCreateProfile(uuid);

    // 연락 방법 업데이트
    profile.contact_info = contactInfo;
    await this.profilesRepository.save(profile);

    return {
      status_code: HttpStatus.OK,
      message: '연락 방법이 성공적으로 업데이트되었습니다.',
    };
  }

  /**
   * 사용자 프로필의 지역 정보를 업데이트합니다.
   * @param uuid 사용자 UUID
   * @param regionIds 지역 ID 배열
   * @returns 처리 결과를 담은 BaseResponse
   * @throws NotFoundException 사용자나 지역이 존재하지 않을 경우
   */
  async updateRegions(
    uuid: string,
    regionIds: string[],
  ): Promise<BaseResponse> {
    // 사용자 존재 여부 확인
    await this.userService.findUserUuid(uuid);

    // 기존 프로필 조회 또는 새로 생성 (지역 관계 포함)
    let profile = await this.profilesRepository.findOne({
      where: { user: { uuid } },
      relations: ['regions'],
    });

    if (!profile) {
      // 프로필이 없으면 새로 생성
      const user = await this.userService.findUserUuid(uuid);
      profile = this.profilesRepository.create({ user, regions: [] });
    }

    // 지역 정보 조회 (빈 배열이면 모든 지역 제거)
    let regions: Regions[] = [];
    if (regionIds.length > 0) {
      regions = await this.regionsService.findRegionsByIds(regionIds);
    }

    // 프로필에 지역 설정 및 저장
    profile.regions = regions;
    await this.profilesRepository.save(profile);

    return {
      status_code: HttpStatus.OK,
      message: '지역 정보가 성공적으로 업데이트되었습니다.',
      option: {
        meta_data: {
          regions: regions.map((region) => ({
            id: region.id,
            city_first: region.city_first,
            city_second: region.city_second,
          })),
        },
      },
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
