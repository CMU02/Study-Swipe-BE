import { Controller, Get, UseGuards } from '@nestjs/common';
import { AuthGuard } from 'src/auth/authGuard';
import { BaseResponse } from 'src/base_response';
import { CollabStyleService } from './collab_style.service';

/**
 * 협업 성향 관련 HTTP 엔드포인트를 처리하는 컨트롤러
 * 협업 성향 목록 조회 등의 API를 제공합니다.
 */
@UseGuards(AuthGuard)
@Controller('collab-styles')
export class CollabStyleController {
  constructor(private readonly collabStyleService: CollabStyleService) {}

  /**
   * 모든 협업 성향 목록을 조회합니다.
   * @returns 전체 협업 성향 목록
   */
  @Get()
  async getAllCollabStyles(): Promise<BaseResponse> {
    const collabStyles = await this.collabStyleService.findAllCollabStyles();

    return {
      status_code: 200,
      message: '협업 성향 목록 조회 성공',
      option: {
        meta_data: { collabStyles },
      },
    };
  }
}
