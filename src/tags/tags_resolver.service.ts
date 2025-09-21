import { Injectable } from '@nestjs/common';
import OpenAI from 'openai';
import {
  resolveHardCanonicalKo,
  normalizeKey as hardNormalize,
} from './hardmap';

/**
 * TODO: 프로젝트에 맞게 수정 필요
 */

// === 임베딩/임계치 ===
// OpenAI 임베딩 모델명 (기본: text-embedding-3-small, 1536차원)
const EMB_MODEL =
  process.env.OPENAI_EMBEDDING_MODEL || 'text-embedding-3-small';
// cosine similarity 임계치 (0~1). 이 값 이상이면 "같은 표준 태그"로 판단
const THRESHOLD = Number(process.env.SIM_THRESHOLD || 0.83);

// JS number[] → pgvector 리터럴 "[...]"
function toVectorLiteral(vec: number[]): string {
  return `[${vec.join(',')}]`;
}

// 매핑 상세 타입
export type TagResolution = {
  raw: string;
  key: string;
  canonId: string | null; // 표준 ID (실제는 canonical_tags.uid)
  canonical: string; // 표준 명 (canonical_tags.value)
  confidence: number; // similarity
};

@Injectable()
export class TagResolverService {
  private openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

  /** 서비스 내부 정규화 (hardmap의 규칙과 동일하게 유지) */
  private toKey(s: string) {
    return hardNormalize(s);
  }

  /** 임베딩 배치 호출 */
  private async embedBatch(texts: string[]) {
    const r = await this.openai.embeddings.create({
      model: EMB_MODEL,
      input: texts,
    });
    return r.data.map((d) => d.embedding as unknown as number[]);
  }

  /**
   * canonical_tags.embed 가 NULL인 항목들 지연 임베딩
   * - 새 스키마 컬럼: uid, value, desc
   * - 임베딩 입력: value + desc(있으면)
   */
  private async ensureCanonEmbeddings(batch = 50) {
    const { rows } = await this.pool.query(
      `SELECT uid,
              COALESCE(value,'') AS value,
              COALESCE("desc",'') AS desc
         FROM canonical_tags
        WHERE embed IS NULL
        LIMIT $1`,
      [batch],
    );
    if (!rows.length) return;

    const inputs = rows.map((r: any) =>
      [r.value, r.desc].filter(Boolean).join(' / '),
    );
    const embeds = await this.embedBatch(inputs);

    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');
      for (let i = 0; i < rows.length; i++) {
        await client.query(
          `UPDATE canonical_tags SET embed = $1::vector WHERE uid = $2`,
          [toVectorLiteral(embeds[i]), rows[i].uid],
        );
      }
      await client.query('COMMIT');
    } catch (e) {
      await client.query('ROLLBACK');
      throw e;
    } finally {
      client.release();
    }
  }

  /**
   * 단일 태그 매핑 순서
   * 1) 하드매핑(있으면 즉시 확정 + 캐시 적재)
   * 2) 캐시(tag_synonyms) 조회
   * 3) 지연 임베딩 보장
   * 4) 임베딩 Top-1 검색
   * 5) 임계치 판단(캐시 적재)
   */
  private async resolveOne(raw: string): Promise<TagResolution> {
    const key = this.toKey(raw);

    // 1) 하드 매핑 (hardmap이 반환한 표준 라벨은 canonical_tags.value와 일치해야 함)
    const hardCanonValue = resolveHardCanonicalKo(raw);
    if (hardCanonValue) {
      const c0 = await this.pool.query(
        `SELECT uid FROM canonical_tags WHERE value = $1 LIMIT 1`,
        [hardCanonValue],
      );
      if (c0.rowCount) {
        const canonUid = c0.rows[0].uid as string;
        await this.pool.query(
          `INSERT INTO tag_synonyms (raw, canon_uid, confidence)
           VALUES ($1, $2, $3)
           ON CONFLICT (raw) DO NOTHING`,
          [key, canonUid, 0.99],
        );
        return {
          raw,
          key,
          canonId: canonUid,
          canonical: hardCanonValue,
          confidence: 0.99,
        };
      }
      // 표준 라벨이 DB에 없으면 임베딩 경로로 진행
    }

    // 2) 캐시 조회(tag_synonyms.raw = key)
    const c1 = await this.pool.query(
      `SELECT s.canon_uid, s.confidence, c.value
         FROM tag_synonyms s
         JOIN canonical_tags c ON c.uid = s.canon_uid
        WHERE s.raw = $1`,
      [key],
    );
    if (c1.rowCount) {
      const row = c1.rows[0];
      return {
        raw,
        key,
        canonId: row.canon_uid,
        canonical: row.value,
        confidence: Number(row.confidence),
      };
    }

    // 3) 지연 임베딩
    await this.ensureCanonEmbeddings(50);

    // 4) 임베딩 Top-1
    const [qvec] = await this.embedBatch([raw]);
    const c2 = await this.pool.query(
      `SELECT uid, value, 1 - (embed <=> $1::vector) AS sim
         FROM canonical_tags
        WHERE embed IS NOT NULL
        ORDER BY embed <=> $1::vector
        LIMIT 1`,
      [toVectorLiteral(qvec)],
    );
    if (!c2.rowCount) {
      return { raw, key, canonId: null, canonical: raw, confidence: 0 };
    }

    const best = c2.rows[0];
    const sim = Number(best.sim);

    if (sim >= THRESHOLD) {
      // 5) 캐시 적재
      await this.pool.query(
        `INSERT INTO tag_synonyms (raw, canon_uid, confidence)
         VALUES ($1, $2, $3)
         ON CONFLICT (raw) DO NOTHING`,
        [key, best.uid, sim],
      );
      return {
        raw,
        key,
        canonId: best.uid,
        canonical: best.value,
        confidence: sim,
      };
    }

    // 임계치 미만 → 원문 유지(또는 '기타' 정책)
    return { raw, key, canonId: null, canonical: raw, confidence: sim };
  }

  /** 여러 개 입력 → 디듑(중복 제거) 포함 결과 */
  async resolveManyDetailed(rawTags: string[]) {
    const results: TagResolution[] = [];
    for (const t of rawTags) results.push(await this.resolveOne(t));

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
