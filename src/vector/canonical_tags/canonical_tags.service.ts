import {
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CanonicalTags } from './canonical_tags.entity';
import { IsNull, Repository } from 'typeorm';
import { VectorService } from '../vector.service';
import { normalizeKey, resolveHardCanonicalKo } from '../hardmap';
import { TagSynonymsService } from '../tag_synonyms/tag_synonyms.service';
import { TagSynonyms } from '../tag_synonyms/tag_synonyms.entity';

// 매핑 상세 타입
export type TagResolution = {
  raw: string;
  key: string;
  canonId: string | null; // 표준 ID (실제는 canonical_tags.uid)
  canonical: string; // 표준 명 (canonical_tags.value)
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
   * canonical_tags.embed 가 NULL인 항목들 지연 임베딩
   */
  async ensureCanonEmbeddings(batch = 50) {
    // 1. 임베딩이 없는 canonical_tags 가져오기
    const rows = await this.canonicalTagsRepository.find({
      where: { embed: IsNull() },
      take: batch,
    });

    if (!rows.length) return;

    // 2. 임베딩에 넣을 문자열 준비 (value + description)
    const texts = rows.map((row) =>
      [row.value, row.description].filter(Boolean).join(' / '),
    );

    // 3. OpenAI 임베딩 호출
    const embeds = await this.vectorService.invokeEmbeddingBatch(texts);

    // 갯수 불일치 방지
    if (embeds.length !== rows.length) {
      throw new InternalServerErrorException(
        `임베딩 카운트와 갯수가 일치하지 않습니다 : embeds=${embeds.length}, rows=${rows.length}`,
      );
    }

    // 4. 각 row에 해당 백터만 할당 (number[])
    rows.forEach((row, i) => {
      const vector = embeds[i];
      row.embed = Array.isArray(vector)
        ? vector
        : Array.from(vector as ArrayLike<number>);
    });

    // 5. 일괄 저장
    await this.canonicalTagsRepository.save(rows);
  }

  /**
   * 단일 태그 매핑 순서
   * 1) 하드매핑(있으면 즉시 확정 + 캐시 적재)
   * 2) 캐시(tag_synonyms) 조회
   * 3) 지연 임베딩 보장
   * 4) 임베딩 Top-1 검색
   * 5) 임계치 판단(캐시 적재)
   */
  async resolveOne(raw: string): Promise<TagResolution> {
    const key = this.toKey(raw);
    this.logger.log(`raw: {${raw}}, key: {${key}}`);

    // 1) 하드 매핑 (hardmap이 반환한 표준 라벨은 canonical_tags.value와 일치해야 함)
    const hardCanonValue = resolveHardCanonicalKo(raw);
    this.logger.log(`hardCanonValue: {${hardCanonValue}}`);
    if (hardCanonValue) {
      const canonicalTag = await this.canonicalTagsRepository.findOne({
        where: { value: hardCanonValue },
      });

      if (canonicalTag) {
        // 캐시에 저장 (중복 방지)
        await this.tagSynonymsRepository
          .createQueryBuilder()
          .insert()
          .into(TagSynonyms)
          .values({
            raw: key,
            canonical_tags: canonicalTag,
            confidence: 0.99,
          })
          .orIgnore()
          .execute();

        return {
          raw,
          key,
          canonId: canonicalTag.uid,
          canonical: hardCanonValue,
          confidence: 0.99,
        };
      }
      // 표준 라벨이 DB에 없으면 임베딩 경로로 진행
    }

    // 2) 캐시 조회(tag_synonyms.raw = key)
    const cachedSynonym = await this.tagSynonymsRepository.findOne({
      where: { raw: key },
      relations: ['canonical_tags'],
    });

    if (cachedSynonym) {
      return {
        raw,
        key,
        canonId: cachedSynonym.canonical_tags.uid,
        canonical: cachedSynonym.canonical_tags.value,
        confidence: cachedSynonym.confidence,
      };
    }

    // 3) 지연 임베딩 보장
    await this.ensureCanonEmbeddings(50);

    // 4) 임베딩 Top-1 검색
    const [qvec] = await this.vectorService.invokeEmbeddingBatch([raw]);

    // PostgreSQL의 cosine distance 연산자 <=> 사용
    // 1 - (embed <=> query_vector) = cosine similarity
    const result = await this.canonicalTagsRepository
      .createQueryBuilder('ct')
      .select(['ct.uid', 'ct.value'])
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
      // 5) 캐시 적재
      const canonicalTag = await this.canonicalTagsRepository.findOne({
        where: { uid: result.ct_uid },
      });

      if (canonicalTag) {
        await this.tagSynonymsRepository
          .createQueryBuilder()
          .insert()
          .into(TagSynonyms)
          .values({
            raw: key,
            canonical_tags: canonicalTag,
            confidence: similarity,
          })
          .orIgnore()
          .execute();
      }

      return {
        raw,
        key,
        canonId: result.ct_uid,
        canonical: result.ct_value,
        confidence: similarity,
      };
    }

    // 임계치 미만 → 원문 유지
    return { raw, key, canonId: null, canonical: raw, confidence: similarity };
  }

  /** 여러 개 입력 → 디듑(중복 제거) 포함 결과 */
  async resolveManyDetailed(rawTags: string[]) {
    const results: TagResolution[] = [];
    for (const t of rawTags) {
      results.push(await this.resolveOne(t));
    }

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
}
