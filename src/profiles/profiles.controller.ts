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
import { ProfileBasicDto } from './dto/profile_basic.dto';
import { ProfilesService } from './profiles.service';
import { ProfileSmokingStatusDto } from './dto/profile_smoking_status.dto';

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
    @Body() dto: ProfileSmokingStatusDto,
  ): Promise<BaseResponse> {
    const userUuid = req.user.uuid;
    return this.profilesService.updateSmokingStatus(
      userUuid,
      dto.smoking_status_name,
    );
  }
}
