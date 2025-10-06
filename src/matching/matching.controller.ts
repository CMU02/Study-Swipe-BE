import {
  Controller,
  Get,
  Query,
  Request,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import { MatchingService } from './matching.service';
import { AuthGuard } from 'src/auth/authGuard';
import { FindMatchesByTagDto } from './dto/find-matches-by-tag.dto';
import { BaseResponse } from 'src/base_response';

/**
 * 매칭 시스템 컨트롤러
 * 공부 태그 기반 사용자 매칭 API를 제공합니다.
 */
@Controller('matching')
@UseGuards(AuthGuard)
export class MatchingController {
  constructor(private readonly matchingService: MatchingService) {}

  /**
   * 공부 태그 기반 매칭 사용자 목록 조회
   * GET /matching/by-tag
   *
   * @param req 요청 객체 (JWT에서 사용자 정보 추출)
   * @param dto 검색 조건 (tag_name, page, limit)
   * @returns 매칭된 사용자 목록
   *
   * @example
   * // 특정 태그로 검색
   * GET /matching/by-tag?tag_name=백엔드&page=1&limit=20
   *
   * // 전체 사용자 대상 매칭
   * GET /matching/by-tag?page=1&limit=20
   */
  @Get('by-tag')
  async findMatchesByTag(
    @Request() req,
    @Query(ValidationPipe) dto: FindMatchesByTagDto,
  ): Promise<any> {
    try {
      const userUuid = req.user.uuid;
      const result = await this.matchingService.findMatchesByTag(userUuid, dto);

      return {
        status_code: 200,
        message: dto.tag_name
          ? `'${dto.tag_name}' 태그를 가진 사용자 매칭 결과입니다.`
          : '전체 사용자 매칭 결과입니다.',
        option: {
          data: result.matches,
          pagination: result.pagination,
        },
      };
    } catch (error) {
      throw error;
    }
  }
}
