import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import { normalizeKey, resolveHardCanonicalKo } from '../hardmap';
import { TagSynonyms } from '../tag_synonyms/tag_synonyms.entity';
import { VectorService } from '../vector.service';
import { CanonicalTags } from './canonical_tags.entity';
import { CategorySystemPrompt } from './category_system_prompt';

// 매핑 상세 타입
export type TagResolution = {
  raw: string;
  key: string;
  canonId: string | null; // 표준 ID (실제는 canonical_tags.uid)
  canonical: string; // 표준 명 (canonical_tags.tag_name)
  confidence: number; // similarity
};

// cosine similarity 임계치 (0~1). 이 값 이상이면 "같은 표준 태그"로 판단
const THRESHOLD = 0.83;

@Injectable()
export class CanonicalTagsService {
  constructor(
    @InjectRepository(CanonicalTags)
    private canonicalTagsRepository: Repository<CanonicalTags>,
    @InjectRepository(TagSynonyms)
    private tagSynonymsRepository: Repository<TagSynonyms>,
    private vectorService: VectorService,
  ) {}

  private logger = new Logger(CanonicalTagsService.name);

  /** 서비스 내부 정규화 (hardmap의 규칙과 동일하게 유지) */
  private toKey(s: string): string {
    return normalizeKey(s);
  }

  /**
   * 새로운 canonical tag 생성 (임베딩 + 카테고리 분류 포함)
   */
  async insertCanonTagsEmbeddings(tag: string) {
    const embed = await this.vectorService.invokeEmbedding(tag);
    const categoryResponse = await this.vectorService.invokeChatModel(
      CategorySystemPrompt,
      tag,
    );

    // JSON 응답에서 category 값만 추출
    let categoryValue = tag; // 기본값으로 원본 태그 사용
    try {
      if (categoryResponse) {
        const parsed = JSON.parse(categoryResponse);
        categoryValue = parsed.category || tag;
      }
    } catch (error) {
      this.logger.warn(`JSON 파싱 실패: ${categoryResponse}, 원본 태그 사용`);
    }

    this.logger.log(`추출된 category 값: ${categoryValue}`);

    const newCanonicalTags = this.canonicalTagsRepository.create({
      tag_name: tag,
      embed: embed as number[],
      category: categoryValue,
    });

    await this.canonicalTagsRepository.save(newCanonicalTags);
  }

  /**
   * canonical_tags.embed 가 NULL인 항목들 지연 임베딩
   * 성능 최적화: 배치 처리 및 트랜잭션 사용
   */
  async ensureCanonEmbeddings(batch = 50) {
    // 1. 임베딩이 없는 canonical_tags 가져오기 (필요한 필드만 선택)
    const rows = await this.canonicalTagsRepository
      .createQueryBuilder('ct')
      .select(['ct.uid', 'ct.tag_name', 'ct.category'])
      .where('ct.embed IS NULL')
      .limit(batch)
      .getMany();

    if (!rows.length) return;

    // 2. 임베딩에 넣을 문자열 준비 (tag_name + category)
    const texts = rows.map((row) =>
      [row.tag_name, row.category].filter(Boolean).join(' / '),
    );

    // 3. OpenAI 임베딩 배치 호출
    const embeds = await this.vectorService.invokeEmbeddingBatch(texts);

    if (embeds.length !== rows.length) {
      throw new InternalServerErrorException(
        `임베딩 카운트와 갯수가 일치하지 않습니다 : embeds=${embeds.length}, rows=${rows.length}`,
      );
    }

    // 4. 트랜잭션으로 일괄 업데이트 (성능 최적화)
    await this.canonicalTagsRepository.manager.transaction(async (manager) => {
      const updatePromises = rows.map((row, i) => {
        const vector = Array.isArray(embeds[i])
          ? embeds[i]
          : Array.from(embeds[i] as ArrayLike<number>);

        return manager.update(CanonicalTags, row.uid, { embed: vector });
      });

      await Promise.all(updatePromises);
    });
  }

  /**
   * 비동기 동의어 저장 (성능 최적화용)
   */
  private async saveSynonymAsync(
    raw: string,
    canonicalTag: { uid: string; tag_name: string },
    confidence: number,
  ): Promise<void> {
    try {
      await this.tagSynonymsRepository
        .createQueryBuilder()
        .insert()
        .into(TagSynonyms)
        .values({
          raw,
          canonical_tags: { uid: canonicalTag.uid } as any,
          confidence,
        })
        .orIgnore()
        .execute();
    } catch (error) {
      this.logger.warn(
        `동의어 저장 실패: ${raw} -> ${canonicalTag.tag_name}`,
        error,
      );
    }
  }

  /**
   * 단일 태그 매핑 순서 (현재 구조에 맞게 수정 + 성능 최적화)
   * 1) 하드매핑(있으면 즉시 확정 + 캐시 적재)
   * 2) 캐시(tag_synonyms) 조회
   * 3) 지연 임베딩 보장
   * 4) 임베딩 Top-1 검색
   * 5) 임계치 판단(캐시 적재)
   */
  async resolveOne(raw: string): Promise<TagResolution> {
    const key = this.toKey(raw);
    this.logger.debug(`resolving tag - raw: ${raw}, key: ${key}`);

    // 1) 하드 매핑 확인
    const hardCanonValue = resolveHardCanonicalKo(raw);
    if (hardCanonValue) {
      const canonicalTag = await this.canonicalTagsRepository.findOne({
        where: { tag_name: hardCanonValue },
        select: ['uid', 'tag_name'], // 필요한 필드만 선택
      });

      if (canonicalTag) {
        // 비동기 캐시 저장 (응답 속도 향상)
        this.saveSynonymAsync(key, canonicalTag, 0.99);

        return {
          raw,
          key,
          canonId: canonicalTag.uid,
          canonical: canonicalTag.tag_name,
          confidence: 0.99,
        };
      }
    }

    // 2) 캐시 조회 (필요한 필드만 선택)
    const cachedSynonym = await this.tagSynonymsRepository.findOne({
      where: { raw: key },
      select: ['confidence'],
      relations: {
        canonical_tags: true,
      },
    });

    if (cachedSynonym) {
      return {
        raw,
        key,
        canonId: cachedSynonym.canonical_tags.uid,
        canonical: cachedSynonym.canonical_tags.tag_name,
        confidence: cachedSynonym.confidence,
      };
    }

    // 3) 지연 임베딩 보장
    await this.ensureCanonEmbeddings(50);

    // 4) 임베딩 검색 (단일 쿼리로 최적화)
    const [qvec] = await this.vectorService.invokeEmbeddingBatch([raw]);

    const result = await this.canonicalTagsRepository
      .createQueryBuilder('ct')
      .select(['ct.uid', 'ct.tag_name'])
      .addSelect('1 - (ct.embed <=> :queryVector)', 'similarity')
      .where('ct.embed IS NOT NULL')
      .setParameter('queryVector', `[${qvec.join(',')}]`)
      .orderBy('ct.embed <=> :queryVector', 'ASC')
      .limit(1)
      .getRawOne();

    if (!result) {
      return { raw, key, canonId: null, canonical: raw, confidence: 0 };
    }

    const similarity = Number(result.similarity);

    if (similarity >= THRESHOLD) {
      // 5) 비동기 캐시 적재 (응답 속도 향상)
      const canonicalTag = { uid: result.ct_uid, tag_name: result.ct_tag_name };
      this.saveSynonymAsync(key, canonicalTag, similarity);

      return {
        raw,
        key,
        canonId: result.ct_uid,
        canonical: result.ct_tag_name,
        confidence: similarity,
      };
    }

    // 임계치 미만 → 원문 유지
    return { raw, key, canonId: null, canonical: raw, confidence: similarity };
  }

  /**
   * 여러 개 입력 → 디듑(중복 제거) 포함 결과 (성능 최적화)
   * 병렬 처리로 성능 향상
   */
  async resolveManyDetailed(rawTags: string[]) {
    // 병렬 처리로 성능 향상
    const results = await Promise.all(
      rawTags.map((tag) => this.resolveOne(tag)),
    );

    const seen = new Set<string>();
    const uniqueCanonical: string[] = [];

    for (const r of results) {
      // 성공 시 uid 기준, 실패 시 canonical 정규화 키 기준으로 디듑
      const k = r.canonId
        ? `canon:${r.canonId}`
        : `raw:${this.toKey(r.canonical)}`;
      if (seen.has(k)) continue;
      seen.add(k);
      uniqueCanonical.push(r.canonical);
    }

    return { uniqueCanonical, mappings: results };
  }

  /**
   * 특정 태그명으로 canonical tag 조회
   */
  async findByTagName(tagName: string): Promise<CanonicalTags | null> {
    return this.canonicalTagsRepository.findOne({
      where: { tag_name: tagName },
    });
  }

  /**
   * 모든 canonical tags 조회 (페이지네이션)
   */
  async findAll(page = 1, limit = 20): Promise<CanonicalTags[]> {
    return this.canonicalTagsRepository.find({
      skip: (page - 1) * limit,
      take: limit,
      order: { created_at: 'DESC' },
    });
  }
}
