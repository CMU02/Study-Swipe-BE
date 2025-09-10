import { Controller, Get, UseGuards } from '@nestjs/common';
import { AuthGuard } from 'src/auth/authGuard';
import { BaseResponse } from 'src/base_response';
import { MajorService } from './major.service';

/**
 * 전공 관련 HTTP 엔드포인트를 처리하는 컨트롤러
 * 전공 목록 조회 등의 API를 제공합니다.
 * 사용자는 직접 전공명을 입력하여 저장하며, 이 API는 참고용 목록을 제공합니다.
 */
@UseGuards(AuthGuard)
@Controller('majors')
export class MajorController {
  constructor(private readonly majorService: MajorService) {}

  /**
   * 모든 전공 목록을 조회합니다.
   * 사용자가 입력한 전공들의 목록을 참고용으로 제공합니다.
   * @returns 전체 전공 목록
   */
  @Get()
  async getAllMajors(): Promise<BaseResponse> {
    const majors = await this.majorService.findAllMajors();

    return {
      status_code: 200,
      message: '전공 목록 조회 성공',
      option: {
        meta_data: { majors },
      },
    };
  }
}
