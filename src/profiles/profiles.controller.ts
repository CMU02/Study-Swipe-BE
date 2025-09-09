import {
  Body,
  Controller,
  Get,
  Patch,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from 'src/auth/authGuard';
import { BaseResponse } from 'src/base_response';
import { ProfileActivityRadiusDto } from './dto/profile_activity_radius.dto';
import { ProfileBasicDto } from './dto/profile_basic.dto';
import { ProfileContactInfoDto } from './dto/profile_contact_info.dto';
import { ProfileGoalsNoteDto } from './dto/profile_goals_note.dto';
import { ProfilePreferredMemberCountDto } from './dto/profile_preferred_member_count.dto';
import { ProfileRegionsDto } from './dto/profile_regions.dto';
import { ProfileSocialPrefDto } from './dto/profile_social_pref.dto';
import { ProfileStudyDto } from './dto/profile_study.dto';
import { ProfilesService } from './profiles.service';

/**
 * 사용자 프로필 관련 HTTP 엔드포인트를 처리하는 컨트롤러
 * 프로필 생성, 조회, 수정 등의 API를 제공합니다.
 */
@UseGuards(AuthGuard)
@Controller('profiles')
export class ProfilesController {
  constructor(private readonly profilesService: ProfilesService) {}

  /**
   * 현재 사용자의 프로필 정보를 조회합니다.
   * @param req 인증된 사용자 요청 객체
   * @returns 사용자 프로필 정보
   */
  @Get('/my-profile')
  async getMyProfile(@Request() req): Promise<BaseResponse> {
    const userUuid = req.user.uuid;
    return this.profilesService.getProfile(userUuid);
  }

  /**
   * 새로운 프로필을 생성합니다.
   * @param req 인증된 사용자 요청 객체
   * @param dto 프로필 기본 정보
   * @returns 프로필 생성 결과
   */
  @Post('/create-profile')
  async createMyProfile(
    @Request() req,
    @Body() dto: ProfileBasicDto,
  ): Promise<BaseResponse> {
    const userUuid = req.user.uuid;
    return this.profilesService.upsertBasicProfile({
      uuid: userUuid,
      dto,
      target: 'create',
    });
  }

  /**
   * 기존 프로필을 수정합니다.
   * @param req 인증된 사용자 요청 객체
   * @param dto 수정할 프로필 정보
   * @returns 프로필 수정 결과
   */
  @Patch('/update-profile')
  async updateMyProfile(
    @Request() req,
    @Body() dto: ProfileBasicDto,
  ): Promise<BaseResponse> {
    const userUuid = req.user.uuid;
    return this.profilesService.upsertBasicProfile({
      uuid: userUuid,
      dto,
      target: 'update',
    });
  }

  /**
   * 사용자의 흡연 상태를 업데이트합니다.
   * @param req 인증된 사용자 요청 객체
   * @param smokingStatusName 흡연 상태 이름
   * @returns 흡연 상태 업데이트 결과
   */
  @Patch('/smoking-status')
  async updateSmokingStatus(
    @Request() req,
    @Body() { smoking_status_name }: { smoking_status_name: string },
  ): Promise<BaseResponse> {
    const userUuid = req.user.uuid;
    return this.profilesService.updateSmokingStatus(
      userUuid,
      smoking_status_name,
    );
  }

  /**
   * 사용자의 사교모임 선호도를 업데이트합니다.
   * @param req 인증된 사용자 요청 객체
   * @param dto 사교모임 선호도 정보
   * @returns 사교모임 선호도 업데이트 결과
   */
  @Patch('/social-pref')
  async updateSocialPref(
    @Request() req,
    @Body() dto: ProfileSocialPrefDto,
  ): Promise<BaseResponse> {
    const userUuid = req.user.uuid;
    return this.profilesService.updateSocialPref(
      userUuid,
      dto.social_pref_name,
    );
  }

  /**
   * 사용자의 선호 인원 수를 업데이트합니다.
   * @param req 인증된 사용자 요청 객체
   * @param dto 선호 인원 수 정보
   * @returns 선호 인원 수 업데이트 결과
   */
  @Patch('/preferred-member-count')
  async updatePreferredMemberCount(
    @Request() req,
    @Body() dto: ProfilePreferredMemberCountDto,
  ): Promise<BaseResponse> {
    const userUuid = req.user.uuid;
    return this.profilesService.updatePreferredMemberCount(
      userUuid,
      dto.min_member_count,
      dto.max_member_count,
    );
  }

  /**
   * 사용자의 학습 관련 프로필 정보를 업데이트합니다.
   * @param req 인증된 사용자 요청 객체
   * @param dto 학습 관련 정보 (목표, 활동 반경, 연락처)
   * @returns 학습 정보 업데이트 결과
   */
  @Patch('/study-info')
  async updateStudyProfile(
    @Request() req,
    @Body() dto: ProfileStudyDto,
  ): Promise<BaseResponse> {
    const userUuid = req.user.uuid;
    return this.profilesService.updateStudyProfile(userUuid, dto);
  }

  /**
   * 사용자의 학습 목표를 업데이트합니다.
   * @param req 인증된 사용자 요청 객체
   * @param dto 학습 목표 정보
   * @returns 학습 목표 업데이트 결과
   */
  @Patch('/goals-note')
  async updateGoalsNote(
    @Request() req,
    @Body() dto: ProfileGoalsNoteDto,
  ): Promise<BaseResponse> {
    const userUuid = req.user.uuid;
    return this.profilesService.updateGoalsNote(userUuid, dto.goals_note);
  }

  /**
   * 사용자의 활동 반경을 업데이트합니다.
   * @param req 인증된 사용자 요청 객체
   * @param dto 활동 반경 정보
   * @returns 활동 반경 업데이트 결과
   */
  @Patch('/activity-radius')
  async updateActivityRadius(
    @Request() req,
    @Body() dto: ProfileActivityRadiusDto,
  ): Promise<BaseResponse> {
    const userUuid = req.user.uuid;
    return this.profilesService.updateActivityRadius(
      userUuid,
      dto.activity_radius_km,
    );
  }

  /**
   * 사용자의 연락 방법을 업데이트합니다.
   * @param req 인증된 사용자 요청 객체
   * @param dto 연락 방법 정보
   * @returns 연락 방법 업데이트 결과
   */
  @Patch('/contact-info')
  async updateContactInfo(
    @Request() req,
    @Body() dto: ProfileContactInfoDto,
  ): Promise<BaseResponse> {
    const userUuid = req.user.uuid;
    return this.profilesService.updateContactInfo(userUuid, dto.contact_info);
  }

  /**
   * 사용자의 지역 정보를 업데이트합니다.
   * @param req 인증된 사용자 요청 객체
   * @param dto 지역 ID 목록
   * @returns 지역 정보 업데이트 결과
   */
  @Patch('/regions')
  async updateRegions(
    @Request() req,
    @Body() dto: ProfileRegionsDto,
  ): Promise<BaseResponse> {
    const userUuid = req.user.uuid;
    return this.profilesService.updateRegions(userUuid, dto.region_ids);
  }
}
