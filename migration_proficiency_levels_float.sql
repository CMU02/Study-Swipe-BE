-- ProficiencyLevels 테이블의 min_score, max_score 컬럼을 float 타입으로 변경
-- 기존 데이터가 있는 경우 실행

ALTER TABLE proficiency_levels 
ALTER COLUMN min_score TYPE REAL,
ALTER COLUMN max_score TYPE REAL;

-- 기본 데이터 삽입 (예시)
-- 기존 데이터가 없는 경우에만 실행
INSERT INTO proficiency_levels (proficiency_levels_id, level_name, min_score, max_score) VALUES
(1, '초급', 1.0, 2.0),
(2, '중급', 2.01, 3.66),
(3, '상급', 3.67, 5.0)
ON CONFLICT (proficiency_levels_id) DO NOTHING;

-- 또는 wavg 점수 기준으로 설정하는 경우
-- INSERT INTO proficiency_levels (proficiency_levels_id, level_name, min_score, max_score) VALUES
-- (1, '초급', 1.0, 2.0),
-- (2, '중급', 2.01, 3.66),
-- (3, '상급', 3.67, 5.0)
-- ON CONFLICT (proficiency_levels_id) DO NOTHING;