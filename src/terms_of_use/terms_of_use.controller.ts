import { Body, Controller, Post } from '@nestjs/common';
import { TermsOfUseService } from './terms_of_use.service';
import { CreateTermsOfUseDto } from './dto/create_Temrs_of_use.dto';
import { BaseResponse } from 'src/base_response';

@Controller('terms-of-use')
export class TermsOfUseController {
  constructor(private readonly temrsOfUserService: TermsOfUseService) {}

  @Post('/agree')
  agreeToTerms(
    @Body() createTemrsDto: CreateTermsOfUseDto,
  ): Promise<BaseResponse> {
    return this.temrsOfUserService.createTerms(createTemrsDto);
  }
}
