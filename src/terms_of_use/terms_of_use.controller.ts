import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { TermsOfUseService } from './terms_of_use.service';
import { CreateTermsOfUseDto } from './dto/create_Temrs_of_use.dto';
import { BaseResponse } from 'src/base_response';

/**
 * 약관 동의 관련 API를 제공하는 컨트롤러
 */
@Controller('terms-of-use')
export class TermsOfUseController {
  constructor(private readonly termsOfUseService: TermsOfUseService) {}

  /**
   * 약관 동의 내역을 생성하거나 업데이트합니다.
   * @param createTermsDto 약관 동의 정보
   * @returns 처리 결과
   */
  @Post('/agree')
  agreeToTerms(
    @Body() createTermsDto: CreateTermsOfUseDto,
  ): Promise<BaseResponse> {
    return this.termsOfUseService.createOrUpdateTerms(createTermsDto);
  }

  /**
   * 사용자의 약관 동의 내역을 조회합니다.
   * @param user_id 사용자 ID
   * @returns 약관 동의 내역
   */
  @Get('/:user_id')
  getTerms(@Param('user_id') user_id: string): Promise<BaseResponse> {
    return this.termsOfUseService.getTerms(user_id);
  }
}
