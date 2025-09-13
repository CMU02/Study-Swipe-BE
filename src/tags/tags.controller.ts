import { Body, Controller, Post, BadRequestException } from '@nestjs/common';
import { TagResolverService } from './tags_resolver.service';

@Controller('tags')
export class TagsController {
  constructor(private readonly tags: TagResolverService) {}

  /**
   * POST /tags/resolve
   * Body: { "tags": ["FrontEnd","프론트","FE","백엔드"] }
   * 응답: { uniqueCanonical: [...], mappings: [...] }
   */
  @Post('resolve')
  async resolve(@Body() body: { tags?: string[] }) {
    const raw = (body?.tags ?? []).map(s => String(s).trim()).filter(Boolean);
    if (!raw.length) throw new BadRequestException('tags 배열을 1개 이상 보내주세요.');
    if (raw.length > 20) throw new BadRequestException('한 번에 최대 20개까지 보낼 수 있습니다.');
    return this.tags.resolveManyDetailed(raw);
  }
}
