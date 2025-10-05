import {
  Controller,
  Put,
  Body,
  Request,
  UseGuards,
  UsePipes,
  ValidationPipe,
  Get,
} from '@nestjs/common';
import { UniversitiesService } from './universities.service';
import { UpdateUserUniversityDto } from './dto/update-user-university.dto';
import { AuthGuard } from 'src/auth/authGuard';
import { BaseResponse } from 'src/base_response';

@Controller('universities')
@UseGuards(AuthGuard)
export class UniversitiesController {
  constructor(private readonly universitiesService: UniversitiesService) {}

  /**
   * 사용자의 대학교 정보를 업데이트합니다.
   * @param updateUserUniversityDto 대학교 업데이트 DTO
   * @param req 요청 객체 (JWT에서 사용자 정보 추출)
   * @returns 업데이트 결과
   */
  @Put('add')
  @UsePipes(ValidationPipe)
  async updateUserUniversity(
    @Body() updateUserUniversityDto: UpdateUserUniversityDto,
    @Request() req,
  ): Promise<BaseResponse> {
    try {
      const updatedUser = await this.universitiesService.updateUserUniversity(
        req.user.uuid,
        updateUserUniversityDto.universityName,
      );

      return {
        status_code: 200,
        message: '대학교 정보가 성공적으로 업데이트되었습니다.',
        option: {
          meta_data: {
            user_uuid: updatedUser.uuid,
            university: {
              id: updatedUser.universities.id,
              name: updatedUser.universities.university_name,
            },
          },
        },
      };
    } catch (error) {
      throw error;
    }
  }
}
