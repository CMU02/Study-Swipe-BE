import { Injectable } from '@nestjs/common';
import { Pool } from 'pg';
import OpenAI from 'openai';

/**
 * 임베딩 모델과 유사도 임계치
 * - EMB_MODEL: OpenAI 임베딩 모델명 (기본: text-embedding-3-small, 1536차원)
 * - THRESHOLD: cosine similarity 임계치 (0~1). 이 값 이상이면 "같은 표준 태그"로 판단.
 */
const EMB_MODEL = process.env.OPENAI_EMBEDDING_MODEL || 'text-embedding-3-small';
const THRESHOLD = Number(process.env.SIM_THRESHOLD || 0.83);

/**
 * ⚠️ pgvector는 Postgres의 일반 array 타입이 아님.
 * JS 배열을 그대로 넣으면 {"...","..."} 형태의 Postgres array문자열이 되어 오류가 나므로,
 * pgvector가 이해하는 리터럴 포맷인 "[...]" 문자열로 변환해야 함.
 * 아래 유틸이 그 역할을 수행하며, SQL 파라미터 바인딩 시 $1::vector 로 캐스팅한다.
 */
function toVectorLiteral(vec: number[]): string {
  return `[${vec.join(',')}]`;
}

/**
 * API 응답에서 매핑 상세를 볼 수 있도록 하는 타입
 * - raw: 사용자가 보낸 원문 태그
 * - key: 정규화 키 (NFKC + trim + 소문자 + 공백/기호 제거) → 캐시/중복 판정용
 * - canonId: 표준 태그 id (null이면 매핑 실패)
 * - canonical: 표준 태그 이름(한국어 표시명). 실패 시 원문 그대로.
 * - confidence: cosine similarity (0~1)
 */
export type TagResolution = {
  raw: string;
  key: string;
  canonId: string | null;
  canonical: string;
  confidence: number;
};

@Injectable()
export class TagResolverService {
  /**
   * Postgres 커넥션 풀
   * - .env 값으로 도커/로컬 등 다양한 환경을 쉽게 전환
   * - max: 동시 커넥션을 과도하게 늘리면 컨테이너/DB에 부담 → 5~10 적당
   */
  private pool = new Pool({
    host: process.env.PG_HOST,
    port: Number(process.env.PG_PORT || 5432),
    database: process.env.PG_DB,
    user: process.env.PG_USER,
    password: process.env.PG_PASSWORD,
    max: 5,
  });

  /**
   * OpenAI SDK
   * - embeddings.create 로 텍스트를 벡터화
   */
  private openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

  /**
   * 원문을 캐시/중복 판정에 쓰기 좋은 '정규화 키'로 변환
   * - 한/영/기호/공백 차이를 줄여 똑같은 의미의 입력을 동일 키로 묶음
   *   예) 'Front-End' / 'front end' / '프론트 ' → 동일 키
   */
  private toKey(s: string) {
    return s.normalize('NFKC').trim().toLowerCase().replace(/[\s\-\_\/]/g, '');
  }

  /**
   * 임베딩 배치 호출
   * - 여러 텍스트를 한 번에 모델에 던져 호출 비용/지연 감소
   * - 반환: number[] (길이 1536) 배열의 배열
   */
  private async embedBatch(texts: string[]) {
    const r = await this.openai.embeddings.create({ model: EMB_MODEL, input: texts });
    return r.data.map(d => d.embedding as unknown as number[]);
  }

  /**
   * [지연 임베딩] canonical_tags.embed 가 NULL 인 레코드들만 모아서
   * OpenAI 임베딩을 생성한 뒤, DB에 UPDATE로 채워 넣는다.
   *
   * 왜 필요한가?
   * - 초기에는 '표준 태그 문자열만' 미리 넣어두고 embed는 비워둠(NULL).
   * - 실제 검색이 발생할 때(처음)만 임베딩을 계산해 저장 → 사전 배치 작업 없이 곧바로 운영 가능.
   *
   * 주의:
   * - UPDATE 시 $1 을 ::vector 로 캐스팅해야 함 (pgvector 전용 포맷 필요)
   * - 트랜잭션으로 묶어 부분 실패 시 롤백
   * - 대량이면 batch 파라미터를 조절하거나 여러 번 호출
   */
  private async ensureCanonEmbeddings(batch = 50) {
    // 아직 임베딩이 없는 표준 태그들을 소량 조회
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

    // 한국어/영문명/설명을 합쳐 임베딩 입력 텍스트로 사용 (언어 혼용 대비)
    const inputs = rows.map((r: any) => [r.name_ko, r.name_en, r.desc].filter(Boolean).join(' / '));

    // OpenAI에 배치 임베딩 요청
    const embeds = await this.embedBatch(inputs);

    // 트랜잭션으로 임베딩 업데이트
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');
      for (let i = 0; i < rows.length; i++) {
        await client.query(
          // ⚠️ 반드시 $1::vector 로 캐스팅 (toVectorLiteral 로 "[...]" 문자열 전달)
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
   * 원문 태그 1개를 표준 태그로 매핑
   * 단계:
   * 1) 동의어 캐시(tag_synonyms)에서 즉시 조회 (있으면 바로 리턴 → 초고속)
   * 2) 표준 태그 임베딩이 비어 있으면 ensureCanonEmbeddings 로 채움 (지연 임베딩)
   * 3) 원문 태그를 임베딩 → pgvector로 Top-1 검색 (코사인 거리 <=>)
   * 4) 유사도(sim = 1 - cosine_distance) >= THRESHOLD 면 매핑 성공
   *    - 캐시(tag_synonyms)에 upsert (다음부터 임베딩/검색 없이 바로 조회)
   *    - 매핑 정보 반환
   * 5) 임계치 미만이면 매핑 실패로 처리 (원문 그대로 반환 or '기타'로 대체 가능)
   */
  private async resolveOne(raw: string): Promise<TagResolution> {
    const key = this.toKey(raw);

    // 1) 캐시 조회 (원문 정규화 키로 빠른 매칭)
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

    // 2) 표준 태그 임베딩이 비어 있으면 먼저 채움(최초 몇 번만 수행됨)
    await this.ensureCanonEmbeddings(50);

    // 3) 쿼리 임베딩 생성 → 코사인 거리(<=>) 기반 Top-1 검색
    const [qvec] = await this.embedBatch([raw]);
    const c2 = await this.pool.query(
      /**
       * pgvector 연산자:
       * - <=> : cosine distance (0 = 완전 동일, 2 = 반대 방향)
       * similarity 계산은 1 - distance 로 환산
       *
       * 주의: $1 은 JS 배열이 아니라 "[...]" 문자열이어야 하므로
       *       toVectorLiteral 로 변환하고 ::vector 캐스팅 필수
       */
      `SELECT id, name_ko, 1 - (embed <=> $1::vector) AS sim
         FROM canonical_tags
        WHERE embed IS NOT NULL
        ORDER BY embed <=> $1::vector
        LIMIT 1`,
      [toVectorLiteral(qvec)],
    );
    if (!c2.rowCount) {
      // 표준 태그 테이블이 비어있는 등 예외 상황
      return { raw, key, canonId: null, canonical: raw, confidence: 0 };
    }

    const best = c2.rows[0];
    const sim = Number(best.sim);

    if (sim >= THRESHOLD) {
      // 4) 매핑 성공 → 동의어 캐시에 저장(중복 INSERT 방지 ON CONFLICT)
      await this.pool.query(
        `INSERT INTO tag_synonyms (raw, canon_id, confidence)
         VALUES ($1, $2, $3)
         ON CONFLICT (raw) DO NOTHING`,
        [key, best.id, sim],
      );
      return { raw, key, canonId: best.id, canonical: best.name_ko, confidence: sim };
    }

    // 5) 임계치 미만 → 매핑 실패. 원문을 그대로 사용(또는 '기타'로 통일하는 정책도 가능)
    return { raw, key, canonId: null, canonical: raw, confidence: sim };
  }

  /**
   * 원문 태그 여러 개 처리
   * - 각 태그를 resolveOne으로 매핑하고
   * - "같은 표준 태그로 매핑된 항목"은 한 번만 쓰기 위해 디듑(dedup)
   *
   * 디듑 규칙:
   * - 매핑 성공( canonId 존재 ) → canonId 기준으로 중복 제거
   * - 매핑 실패( canonId 없음 ) → canonical(=원문) 정규화 키 기준으로 중복 제거
   *
   * 반환:
   * - uniqueCanonical: 디듑된 표준 태그(또는 원문) 목록 → 실제 다운스트림(문항 생성 등)에서 사용
   * - mappings: 각 원문에 대한 상세 매핑 결과 → 디버깅/로그/관리자 검수에 유용
   */
  async resolveManyDetailed(rawTags: string[]) {
    const results: TagResolution[] = [];
    for (const t of rawTags) results.push(await this.resolveOne(t));

    const seen = new Set<string>();
    const uniqueCanonical: string[] = [];

    for (const r of results) {
      // 성공 시 canonId로, 실패 시 canonical(원문) 정규화 키로 고유성 판단
      const k = r.canonId ? `canon:${r.canonId}` : `raw:${this.toKey(r.canonical)}`;
      if (seen.has(k)) continue;
      seen.add(k);
      uniqueCanonical.push(r.canonical);
    }

    return { uniqueCanonical, mappings: results };
  }
}
