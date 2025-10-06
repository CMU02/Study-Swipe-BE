import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { AuthGuard } from 'src/auth/authGuard';
import { BaseResponse } from 'src/base_response';
import { RegionsService } from './regions.service';

/**
 * 지역 정보 관련 HTTP 엔드포인트를 처리하는 컨트롤러
 * 지역 목록 조회 등의 API를 제공합니다.
 */
@UseGuards(AuthGuard)
@Controller('regions')
export class RegionsController {
  constructor(private readonly regionsService: RegionsService) {}

  /**
   * 모든 지역 목록을 조회합니다.
   * @returns 전체 지역 목록
   */
  @Get()
  async getAllRegions(): Promise<BaseResponse> {
    const regions = await this.regionsService.findAllRegions();

    return {
      status_code: 200,
      message: '지역 목록 조회 성공',
      option: {
        meta_data: { regions },
      },
    };
  }

  /**
   * 시/도 목록을 조회합니다.
   * @returns 시/도 목록
   */
  @Get('/cities')
  async getAllCities(): Promise<BaseResponse> {
    const cities = await this.regionsService.findAllCityFirst();

    return {
      status_code: 200,
      message: '시/도 목록 조회 성공',
      option: {
        meta_data: { cities },
      },
    };
  }

  /**
   * 특정 시/도의 지역 목록을 조회합니다.
   * @param cityFirst 시/도 이름
   * @returns 해당 시/도의 지역 목록
   */
  @Get('/city/:cityFirst')
  async getRegionsByCity(
    @Param('cityFirst') cityFirst: string,
  ): Promise<BaseResponse> {
    const regions = await this.regionsService.findRegionsByCityFirst(
      decodeURIComponent(cityFirst),
    );

    return {
      status_code: 200,
      message: `${cityFirst} 지역 목록 조회 성공`,
      option: {
        meta_data: { regions },
      },
    };
  }
}
