import { Controller, Get, UseGuards } from '@nestjs/common';
import { AuthGuard } from 'src/auth/authGuard';
import { BaseResponse } from 'src/base_response';
import { MeetingTypesService } from './meeting_types.service';

/**
 * 모임 유형 관련 HTTP 엔드포인트를 처리하는 컨트롤러
 * 모임 유형 목록 조회 등의 API를 제공합니다.
 */
@UseGuards(AuthGuard)
@Controller('meeting-types')
export class MeetingTypesController {
  constructor(private readonly meetingTypesService: MeetingTypesService) {}

  /**
   * 모든 모임 유형 목록을 조회합니다.
   * @returns 전체 모임 유형 목록
   */
  @Get()
  async getAllMeetingTypes(): Promise<BaseResponse> {
    const meetingTypes = await this.meetingTypesService.findAllMeetingTypes();

    return {
      status_code: 200,
      message: '모임 유형 목록 조회 성공',
      option: {
        meta_data: { meetingTypes },
      },
    };
  }
}
