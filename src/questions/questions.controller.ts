import { BadRequestException, Body, Controller, Post } from '@nestjs/common';
import { QuestionsService } from './questions.service';
import { TagResolverService } from '../tags/tags_resolver.service';

const normalizeKey = (s: string) =>
  s.normalize('NFKC').trim().toLowerCase().replace(/[\s\-\_\/]/g, '');

// GPT 관련은 웬만해서는 ai 로 통일

@Controller('ai')
export class QuestionsController {
  constructor(
    private readonly qs: QuestionsService,
    private readonly tags: TagResolverService,
  ) {}

  @Post('make-questions')
  async makeQuestions(@Body() body: { tags?: string[] }) {

    // 입력 검증
    const raw = (body?.tags ?? []).map((s) => String(s).trim()).filter(Boolean);

    // 태그 0개 방지
    if (raw.length === 0)
      throw new BadRequestException('tags 배열을 1~5개로 보내주세요.');

    // 태그 5개 초과 방지
    if (raw.length > 5)
      throw new BadRequestException('tags는 최대 5개까지만 허용됩니다.');

    // 태그 표준화/매핑 (하드 동의어 + 임베딩 검색 + 캐시)
    const resolved = await this.tags.resolveManyDetailed(raw);

    // 중복 그룹 감지 (canonId 기준, 실패건은 canonical 정규화 기준)
    type Group = { canonical: string; raws: string[] };
    const groups = new Map<string, Group>();

    for (const m of resolved.mappings) {
      const key = m.canonId ? `canon:${m.canonId}` : `raw:${normalizeKey(m.canonical)}`;
      const g = groups.get(key) ?? { canonical: m.canonical, raws: [] };
      g.raws.push(m.raw);
      groups.set(key, g);
    }

    const duplicates = Array.from(groups.values()).filter((g) => g.raws.length > 1);
    if (duplicates.length > 0) {
      throw new BadRequestException({
        message: '중복된 태그가 있습니다. 제거해주세요.',
        duplicates: duplicates.map((d) => ({ canonical: d.canonical, raws: d.raws })),
      });
    }

    // 3) 중복 없음 → 디듑된(중복 제거된) 표준 태그로 질문 생성 (최대 5개 유지)
    const canonicalTags = resolved.uniqueCanonical.slice(0, 5);
    return this.qs.makeQuestions(canonicalTags);
  }
}
