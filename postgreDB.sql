-- 최소 스키마: uuid / value(name) / metatag(source, tag)

-- 0) 확장
CREATE EXTENSION IF NOT EXISTS vector;
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 1) 표준 태그 (UUID PK, 이름은 value 하나만 사용)
CREATE TABLE IF NOT EXISTS canonical_tags (
  uid        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  value      TEXT NOT NULL,          -- 표시/기준 이름 (예: '프론트엔드', '백엔드', 'React', 'NestJS' ...)
  "desc"     TEXT,
  embed      vector(1536),
  ext_code   TEXT,                   -- 외부 표준 코드(예: ESCO 코드 등)
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2) 메타태그 (source, tag)
CREATE TABLE IF NOT EXISTS canonical_tag_meta (
  canon_uid  UUID NOT NULL REFERENCES canonical_tags(uid) ON DELETE CASCADE,
  source     TEXT NOT NULL,          -- 예: 'ESCO', 'INTERNAL'
  tag        TEXT NOT NULL,          -- 예: 'frontend','backend','framework','cloud',...
  PRIMARY KEY (canon_uid, source, tag)
);

-- 3) 동의어 캐시 (정규화 원문 -> 표준 uid)
CREATE TABLE IF NOT EXISTS tag_synonyms (
  raw        TEXT PRIMARY KEY,    -- 정규화 키
  canon_uid  UUID NOT NULL REFERENCES canonical_tags(uid) ON DELETE CASCADE,
  confidence REAL NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 인덱스
CREATE INDEX IF NOT EXISTS idx_canonical_tags_embed
  ON canonical_tags USING ivfflat (embed vector_cosine_ops) WITH (lists = 100);
CREATE INDEX IF NOT EXISTS idx_canonical_tag_meta_source_tag
  ON canonical_tag_meta (source, tag);

-- 시드 10개  샘플 및 메타태그 부착

-- 프론트엔드 (ESCO, frontend)
WITH ins AS (
  INSERT INTO canonical_tags (value, "desc", ext_code)
  SELECT '프론트엔드','웹/앱의 클라이언트 UI 개발','ESCO:it.frontend'
  WHERE NOT EXISTS (
    SELECT 1 FROM canonical_tags WHERE value='프론트엔드' AND COALESCE(ext_code,'')='ESCO:it.frontend'
  )
  RETURNING uid
),
pick AS (
  SELECT uid FROM ins
  UNION ALL
  SELECT uid FROM canonical_tags WHERE value='프론트엔드' AND COALESCE(ext_code,'')='ESCO:it.frontend'
  LIMIT 1
)
INSERT INTO canonical_tag_meta (canon_uid, source, tag)
SELECT uid,'ESCO','frontend' FROM pick
ON CONFLICT DO NOTHING;

-- 백엔드 (ESCO, backend)
WITH ins AS (
  INSERT INTO canonical_tags (value, "desc", ext_code)
  SELECT '백엔드','서버/비즈니스 로직/API/DB','ESCO:it.backend'
  WHERE NOT EXISTS (
    SELECT 1 FROM canonical_tags WHERE value='백엔드' AND COALESCE(ext_code,'')='ESCO:it.backend'
  )
  RETURNING uid
),
pick AS (
  SELECT uid FROM ins
  UNION ALL
  SELECT uid FROM canonical_tags WHERE value='백엔드' AND COALESCE(ext_code,'')='ESCO:it.backend_developer'
  LIMIT 1
)
INSERT INTO canonical_tag_meta (canon_uid, source, tag)
SELECT uid,'ESCO','backend' FROM pick
ON CONFLICT DO NOTHING;

-- 풀스택 (ESCO, fullstack)
WITH ins AS (
  INSERT INTO canonical_tags (value, "desc", ext_code)
  SELECT '풀스택','프론트+백엔드 전반','ESCO:it.fullstack'
  WHERE NOT EXISTS (
    SELECT 1 FROM canonical_tags WHERE value='풀스택' AND COALESCE(ext_code,'')='ESCO:it.fullstack'
  )
  RETURNING uid
),
pick AS (
  SELECT uid FROM ins
  UNION ALL
  SELECT uid FROM canonical_tags WHERE value='풀스택' AND COALESCE(ext_code,'')='ESCO:it.fullstack'
  LIMIT 1
)
INSERT INTO canonical_tag_meta (canon_uid, source, tag)
SELECT uid,'ESCO','fullstack' FROM pick
ON CONFLICT DO NOTHING;

-- 데브옵스 (ESCO, devops)
WITH ins AS (
  INSERT INTO canonical_tags (value, "desc", ext_code)
  SELECT '데브옵스','CI/CD·인프라·관측성','ESCO:it.devops'
  WHERE NOT EXISTS (
    SELECT 1 FROM canonical_tags WHERE value='데브옵스' AND COALESCE(ext_code,'')='ESCO:it.devops'
  )
  RETURNING uid
),
pick AS (
  SELECT uid FROM ins
  UNION ALL
  SELECT uid FROM canonical_tags WHERE value='데브옵스' AND COALESCE(ext_code,'')='ESCO:it.devops'
  LIMIT 1
)
INSERT INTO canonical_tag_meta (canon_uid, source, tag)
SELECT uid,'ESCO','devops' FROM pick
ON CONFLICT DO NOTHING;

-- 데이터베이스 (ESCO, database)
WITH ins AS (
  INSERT INTO canonical_tags (value, "desc", ext_code)
  SELECT '데이터베이스','데이터 모델링·성능·운영','ESCO:it.database'
  WHERE NOT EXISTS (
    SELECT 1 FROM canonical_tags WHERE value='데이터베이스' AND COALESCE(ext_code,'')='ESCO:it.database'
  )
  RETURNING uid
),
pick AS (
  SELECT uid FROM ins
  UNION ALL
  SELECT uid FROM canonical_tags WHERE value='데이터베이스' AND COALESCE(ext_code,'')='ESCO:it.database'
  LIMIT 1
)
INSERT INTO canonical_tag_meta (canon_uid, source, tag)
SELECT uid,'ESCO','database' FROM pick
ON CONFLICT DO NOTHING;

-- 모바일 (ESCO, mobile)
WITH ins AS (
  INSERT INTO canonical_tags (value, "desc", ext_code)
  SELECT '모바일','iOS/Android 클라이언트','ESCO:it.mobile'
  WHERE NOT EXISTS (
    SELECT 1 FROM canonical_tags WHERE value='모바일' AND COALESCE(ext_code,'')='ESCO:it.mobile'
  )
  RETURNING uid
),
pick AS (
  SELECT uid FROM ins
  UNION ALL
  SELECT uid FROM canonical_tags WHERE value='모바일' AND COALESCE(ext_code,'')='ESCO:it.mobile'
  LIMIT 1
)
INSERT INTO canonical_tag_meta (canon_uid, source, tag)
SELECT uid,'ESCO','mobile' FROM pick
ON CONFLICT DO NOTHING;

-- 인공지능 (ESCO, ai-ml)
WITH ins AS (
  INSERT INTO canonical_tags (value, "desc", ext_code)
  SELECT '인공지능','ML 모델·서빙·실험','ESCO:it.ml'
  WHERE NOT EXISTS (
    SELECT 1 FROM canonical_tags WHERE value='인공지능' AND COALESCE(ext_code,'')='ESCO:it.ml'
  )
  RETURNING uid
),
pick AS (
  SELECT uid FROM ins
  UNION ALL
  SELECT uid FROM canonical_tags WHERE value='인공지능' AND COALESCE(ext_code,'')='ESCO:it.ml'
  LIMIT 1
)
INSERT INTO canonical_tag_meta (canon_uid, source, tag)
SELECT uid,'ESCO','ai-ml' FROM pick
ON CONFLICT DO NOTHING;

-- 보안 (ESCO, security)
WITH ins AS (
  INSERT INTO canonical_tags (value, "desc", ext_code)
  SELECT '보안','취약점·대응·모니터링','ESCO:it.security'
  WHERE NOT EXISTS (
    SELECT 1 FROM canonical_tags WHERE value='보안' AND COALESCE(ext_code,'')='ESCO:it.security'
  )
  RETURNING uid
),
pick AS (
  SELECT uid FROM ins
  UNION ALL
  SELECT uid FROM canonical_tags WHERE value='보안' AND COALESCE(ext_code,'')='ESCO:it.security'
  LIMIT 1
)
INSERT INTO canonical_tag_meta (canon_uid, source, tag)
SELECT uid,'ESCO','security' FROM pick
ON CONFLICT DO NOTHING;

-- QA (ESCO, qa)
WITH ins AS (
  INSERT INTO canonical_tags (value, "desc", ext_code)
  SELECT 'QA','테스트 전략·자동화','ESCO:it.qa'
  WHERE NOT EXISTS (
    SELECT 1 FROM canonical_tags WHERE value='QA' AND COALESCE(ext_code,'')='ESCO:it.qa'
  )
  RETURNING uid
),
pick AS (
  SELECT uid FROM ins
  UNION ALL
  SELECT uid FROM canonical_tags WHERE value='QA' AND COALESCE(ext_code,'')='ESCO:it.qa'
  LIMIT 1
)
INSERT INTO canonical_tag_meta (canon_uid, source, tag)
SELECT uid,'ESCO','qa' FROM pick
ON CONFLICT DO NOTHING;

-- 클라우드 (ESCO, cloud), CLOUD는 ESCO 에 없어서 내부 직무인 INTERNAL이 원래 맞긴함.
WITH ins AS (
  INSERT INTO canonical_tags (value, "desc", ext_code)
  SELECT '클라우드','클라우드 설계·운영','ESCO:it.cloud'
  WHERE NOT EXISTS (
    SELECT 1 FROM canonical_tags WHERE value='클라우드' AND COALESCE(ext_code,'')='ESCO:it.cloud'
  )
  RETURNING uid
),
pick AS (
  SELECT uid FROM ins
  UNION ALL
  SELECT uid FROM canonical_tags WHERE value='클라우드' AND COALESCE(ext_code,'')='ESCO:it.cloud'
  LIMIT 1
)
INSERT INTO canonical_tag_meta (canon_uid, source, tag)
SELECT uid,'ESCO','it.cloud' FROM pick
ON CONFLICT DO NOTHING;


-- 검증용 쿼리문

-- 표준 태그 + 메타태그 확인
SELECT ct.uid, ct.value, ct.ext_code, m.source, m.tag
FROM canonical_tags ct
LEFT JOIN canonical_tag_meta m ON m.canon_uid = ct.uid
ORDER BY ct.value, m.source, m.tag;

-- 임베딩 유무 카운트
SELECT COUNT(*) AS total,
       COUNT(embed) FILTER (WHERE embed IS NOT NULL) AS embedded
FROM canonical_tags;

-- 메타태그로 탐색 예: ESCO-frontend
SELECT ct.uid, ct.value
FROM canonical_tags ct
JOIN canonical_tag_meta m ON m.canon_uid = ct.uid
WHERE m.source='ESCO' AND m.tag='frontend'
ORDER BY ct.value;
