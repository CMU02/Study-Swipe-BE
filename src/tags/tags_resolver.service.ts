import { Injectable } from '@nestjs/common';
import { Pool } from 'pg';
import OpenAI from 'openai';
import { resolveHardCanonicalKo, normalizeKey as hardNormalize } from './hardmap';

// 임베딩 모델 및 임계치 관련

// OpenAI 임베딩 모델명 (기본: text-embedding-3-small, 1536차원)
const EMB_MODEL = process.env.OPENAI_EMBEDDING_MODEL || 'text-embedding-3-small';   

// THRESHOLD: cosine similarity 임계치 (0~1). 이 값 이상이면 "같은 표준 태그"로 판단
const THRESHOLD = Number(process.env.SIM_THRESHOLD || 0.83);    
/** JS number[] → pgvector 리터럴 "[...]" */
function toVectorLiteral(vec: number[]): string {
  return `[${vec.join(',')}]`;
}

// 매핑 상세 타입
export type TagResolution = {
  raw: string;
  key: string;
  canonId: string | null;   // 표준 ID
  canonical: string;    // 표준 명
  confidence: number;
};

@Injectable()
export class TagResolverService {
  private pool = new Pool({
    host: process.env.PG_HOST,
    port: Number(process.env.PG_PORT || 5432),
    database: process.env.PG_DB,
    user: process.env.PG_USER,
    password: process.env.PG_PASSWORD,
    max: 5,
  });

  private openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

  /** 서비스 내부 정규화 (hardmap의 규칙과 동일하게 유지) */
  private toKey(s: string) {
    return hardNormalize(s);
  }

  /** 임베딩 배치 호출 */
  private async embedBatch(texts: string[]) {
    const r = await this.openai.embeddings.create({ model: EMB_MODEL, input: texts });
    return r.data.map(d => d.embedding as unknown as number[]);
  }

  /** canonical_tags.embed == NULL → 지연 임베딩 */
  private async ensureCanonEmbeddings(batch = 50) {
    const { rows } = await this.pool.query(
      `SELECT id,
              COALESCE(name_ko,'') AS name_ko,
              COALESCE(name_en,'') AS name_en,
              COALESCE("desc",'')   AS desc
         FROM canonical_tags
        WHERE embed IS NULL
        LIMIT $1`,
      [batch],
    );
    if (!rows.length) return;

    const inputs = rows.map((r: any) => [r.name_ko, r.name_en, r.desc].filter(Boolean).join(' / '));
    const embeds = await this.embedBatch(inputs);

    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');
      for (let i = 0; i < rows.length; i++) {
        await client.query(
          `UPDATE canonical_tags SET embed = $1::vector WHERE id = $2`,
          [toVectorLiteral(embeds[i]), rows[i].id],
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
   * 1개 태그를 매핑시키는 순서
   *  1. 하드 매핑 (동의어/프레임워크) 우선 적용 + 캐시 적재
   *  2. 캐시 조회
   *  3. 지연 임베딩 보장
   *  4. 임베딩 Top-1
   *  5. 임계치 판단
   */

  private async resolveOne(raw: string): Promise<TagResolution> {
    const key = this.toKey(raw);

    // 1. 하드 매핑
    const hardCanonKo = resolveHardCanonicalKo(raw);

    if (hardCanonKo) {
      const c0 = await this.pool.query(
        `SELECT id FROM canonical_tags WHERE name_ko = $1 LIMIT 1`,
        [hardCanonKo],
      );
      if (c0.rowCount) {
        const canonId = c0.rows[0].id as string;
        await this.pool.query(
          `INSERT INTO tag_synonyms (raw, canon_id, confidence)
           VALUES ($1, $2, $3)
           ON CONFLICT (raw) DO NOTHING`,
          [key, canonId, 0.99],
        );
        return { raw, key, canonId, canonical: hardCanonKo, confidence: 0.99 };
      }
      // 표준 라벨이 DB에 없으면 임베딩 경로로 진행
    }

    // 2. 캐시 조회
    const c1 = await this.pool.query(
      `SELECT s.canon_id, s.confidence, c.name_ko
         FROM tag_synonyms s
         JOIN canonical_tags c ON c.id = s.canon_id
        WHERE s.raw = $1`,
      [key],
    );
    if (c1.rowCount) {
      const row = c1.rows[0];
      return { raw, key, canonId: row.canon_id, canonical: row.name_ko, confidence: Number(row.confidence) };
    }

    // 3. 지연 임베딩
    await this.ensureCanonEmbeddings(50);

    // 4. 임베딩 Top-1
    const [qvec] = await this.embedBatch([raw]);
    const c2 = await this.pool.query(
      `SELECT id, name_ko, 1 - (embed <=> $1::vector) AS sim
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
      await this.pool.query(
        `INSERT INTO tag_synonyms (raw, canon_id, confidence)
         VALUES ($1, $2, $3)
         ON CONFLICT (raw) DO NOTHING`,
        [key, best.id, sim],
      );
      return { raw, key, canonId: best.id, canonical: best.name_ko, confidence: sim };
    }

    return { raw, key, canonId: null, canonical: raw, confidence: sim };
  }

  /** 여러 개 입력 → 디듑(중복 제거) 포함 결과 */
  async resolveManyDetailed(rawTags: string[]) {
    const results: TagResolution[] = [];
    for (const t of rawTags) results.push(await this.resolveOne(t));

    const seen = new Set<string>();
    const uniqueCanonical: string[] = [];

    for (const r of results) {
      const k = r.canonId ? `canon:${r.canonId}` : `raw:${this.toKey(r.canonical)}`;
      if (seen.has(k)) continue;
      seen.add(k);
      uniqueCanonical.push(r.canonical);
    }

    return { uniqueCanonical, mappings: results };
  }
}
