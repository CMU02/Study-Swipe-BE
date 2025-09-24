import { BadRequestException, Body, Controller, Post } from '@nestjs/common';
import { CanonicalTagsService } from './canonical_tags.service';

@Controller('tags')
export class CanonicalTagsController {
  constructor(private canonicalTagService: CanonicalTagsService) {}

  /**
   * 사용법
   * POST /tags/resolve
   * Body: { "tags": ["FrontEnd","프론트","FE","백엔드"] }
   * 응답: { uniqueCanonical: [...], mappings: [...] }
   */
  @Post('resolve')
  async resolve(@Body() body: { tags: string[] }) {
    const raw = body.tags.map((tag) => tag.trim()).filter(Boolean);

    if (!raw.length) {
      throw new BadRequestException(400, 'tags 배열을 1개 이상 보내주세요.');
    }
    if (raw.length > 20) {
      throw new BadRequestException(
        400,
        '한 번에 최대 20개까지 보낼 수 있습니다.',
      );
    }

    return this.canonicalTagService.resolveManyDetailed(raw);
  }
}
