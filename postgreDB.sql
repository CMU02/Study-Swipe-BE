CREATE EXTENSION IF NOT EXISTS vector;

CREATE TABLE IF NOT EXISTS canonical_tags (
  id        TEXT PRIMARY KEY,
  ext_code  TEXT,
  source    TEXT,
  name_ko   TEXT NOT NULL,
  name_en   TEXT,
  "desc"    TEXT,
  embed     vector(1536)
);

CREATE TABLE IF NOT EXISTS tag_synonyms (
  raw        TEXT PRIMARY KEY,
  canon_id   TEXT NOT NULL REFERENCES canonical_tags(id) ON DELETE CASCADE,
  confidence REAL NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_canonical_tags_embed
  ON canonical_tags USING ivfflat (embed vector_cosine_ops) WITH (lists = 100);

INSERT INTO canonical_tags (id, ext_code, source, name_ko, name_en, "desc", embed) VALUES
('ESCO:it.frontend_developer','ESCO:it.frontend_developer','ESCO','프론트엔드','Frontend','웹/앱의 클라이언트 UI 개발',NULL),
('ESCO:it.backend_developer', 'ESCO:it.backend_developer', 'ESCO','백엔드','Backend','서버/비즈니스 로직/API/DB',NULL),
('ESCO:it.fullstack',         'ESCO:it.fullstack',         'ESCO','풀스택','Full-Stack','프론트+백엔드 전반',NULL),
('ESCO:it.devops',            'ESCO:it.devops',            'ESCO','데브옵스','DevOps','CI/CD·인프라·관측성',NULL),
('ESCO:it.database',          'ESCO:it.database',          'ESCO','데이터베이스','Database','데이터 모델링·성능·운영',NULL),
('ESCO:it.mobile',            'ESCO:it.mobile',            'ESCO','모바일','Mobile','iOS/Android 클라이언트',NULL),
('ESCO:it.ml',                'ESCO:it.ml',                'ESCO','인공지능','AI/ML','ML 모델·서빙·실험',NULL),
('ESCO:it.security',          'ESCO:it.security',          'ESCO','보안','Security','취약점·대응·모니터링',NULL),
('ESCO:it.qa',                'ESCO:it.qa',                'ESCO','QA','QA','테스트 전략·자동화',NULL),
('INTERNAL:cloud',            'INTERNAL:cloud',            'INTERNAL','클라우드','Cloud','클라우드 설계·운영',NULL)
ON CONFLICT (id) DO NOTHING;

SELECT id, name_ko, embed IS NOT NULL AS embedded
FROM canonical_tags
ORDER BY id;


SELECT COUNT(*) AS total,
       COUNT(embed) FILTER (WHERE embed IS NOT NULL) AS embedded
FROM canonical_tags;