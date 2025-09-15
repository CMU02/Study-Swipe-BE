/**
 * 하드 동의어/프레임워크 → ESCO 표준(한국어 라벨) 매핑
 * - 서비스 코드와 동일한 정규화 규칙을 이 파일에서도 사용합니다.
 * - 표준 라벨(name_ko)이 canonical_tags에 "정확히" 있어야 매핑이 동작합니다.
 *   예: '프론트엔드','백엔드','풀스택','데브옵스','데이터베이스','모바일','인공지능','보안','QA','클라우드'
 */

export const normalizeKey = (s: string) =>
  s.normalize('NFKC').trim().toLowerCase().replace(/[\s\-\_\/]/g, '');

/** ESCO 표준(한국어) 라벨 모음 - 오타 방지를 위해 상수로 사용 */
export const CANON_LABELS = {
  FRONTEND: '프론트엔드',
  BACKEND: '백엔드',
  FULLSTACK: '풀스택',
  DEVOPS: '데브옵스',
  DATABASE: '데이터베이스',
  MOBILE: '모바일',
  AI: '인공지능',
  SECURITY: '보안',
  QA: 'QA',
  CLOUD: '클라우드',
} as const;

/**
 * 표준(한국어 라벨) → 동의어/프레임워크/도구 목록
 * - "명확한 귀속"만 넣는 것이 중요합니다. (오매핑 위험 줄이기)
 * - 필요 시 팀 정책에 맞춰 추가/삭제하세요.
 */
const HARD_GROUPS: Record<string, string[]> = {
  // 프론트엔드
  [CANON_LABELS.FRONTEND]: [
    '프론트', '프엔', 'fe', "프론트엔드",
    'frontend', 'front-end', 'front end', 'front',
    'ui개발', '웹클라이언트', 'webfront', 'web-frontend', '웹프론트',

    // 프론트엔드 주요 프레임워크/도구
    'react', 'reactjs', 'react.js', '리액트',
    'vue', 'vuejs', 'vue.js',
    'angular', 'svelte', 'solidjs', 'solid.js',
    'vite',
    'typescript', '타입스크립트', '타입'
  ],

  // 백엔드
  [CANON_LABELS.BACKEND]: [
    '백', 'be', "백엔드",
    'backend', 'back-end', 'back end', 'server', '서버', '서버개발', 'api개발',

    // 백엔드 프레임워크
    'nest', 'nestjs', '네스트',
    'express', 'koa', 'fastify',
    'spring', 'springboot', 'spring-boot', '스프링', '스프링부트',
    'django', 'flask', 'fastapi',
    'rails', 'ruby on rails', 'laravel',
    'asp.net', 'dotnet', '.net', '.net core',
  ],

  // 풀스택
  [CANON_LABELS.FULLSTACK]: [
    'fullstack', 'full-stack', 'full stack', 'fs', '풀스', '풀스택',

    // 프론트+백 모두 다루는 프레임워크
    'next', 'nextjs', 'next.js',
    'nuxt', 'nuxtjs', 'nuxt.js',
    'remix',
    'astro',
  ],

  // 데브옵스
  [CANON_LABELS.DEVOPS]: [
    'devops', 'dev-ops', 'infra', '인프라', 'platform', '플랫폼',
    'sre', 'ops', 'cicd', 'ci/cd', 'ci', 'cd',
    'k8s', 'kubernetes', 'docker',
    'helm', 'argo', 'argo-cd', 'argocd',
    'jenkins', 'github actions', 'gitlab ci',
    'prometheus', 'grafana', 'loki', 'efk', 'elk',
    'terraform', 'ansible', 'packer',
  ],

  // 데이터베이스
  [CANON_LABELS.DATABASE]: [
    'db', 'database', 'data-base', 'rdbms', 'sql', '디비', '데이터베이스', '데이터베이스관리', 'dba', 
    'postgres', 'postgresql', 'mysql', 'mariadb', 'oracle',
    'sqlserver', 'ms-sql', 'mssql', 'sqlite',
    'mongodb', 'redis', 'cassandra', 'dynamodb',
    'elasticsearch',
  ],

  // 모바일
  [CANON_LABELS.MOBILE]: [
    'mobile', '모바일앱', '앱개발',
    'ios', 'android',
    'reactnative', 'react native', 'rn',
    'flutter',
    'swift', 'objective-c', 'objc',
    'kotlin', 'java android', 'jetpack compose',
  ],

  // 인공지능
  [CANON_LABELS.AI]: [
    'ai', 'ml', '머신러닝', '딥러닝',
    'machinelearning', 'machine learning',
    'deeplearning', 'deep learning', 'dl',
    'pytorch', '파이토치',
    'tensorflow', 'scikit-learn', 'sklearn',
    'transformers', 
    'langchain', '랭체인',
  ],

  // 보안
  [CANON_LABELS.SECURITY]: [
    'security', 'sec', 'infosec', 'appsec', 'secops', '시큐리티', '보안',
    'owasp', 'pentest', 'penetration testing',
    'siem', 'soar',
  ],

  // QA / 테스트
  [CANON_LABELS.QA]: [
    'qa', 'qe', 'qualityassurance', 'quality assurance',
    'test', 'testing', '테스트', '테스팅', '품질보증',
    'jest', 'vitest', 'mocha', 'junit',
    'cypress', 'playwright', 'selenium',
  ],

  // 클라우드
  [CANON_LABELS.CLOUD]: [
    'cloud', '클라우드', '클라우드아키텍처', 'cloudarch', 'cloud-arch',
    'aws', 'gcp', 'azure',
    'ec2', 's3', 'rds', 'lambda', 'eks', 'gke', 'aks',
    'iam',
  ],
};

/** (정규화된 원문 key) → (표준 한국어 라벨) */
const HARD_SYNONYM_MAP: Record<string, string> = (() => {
  const m: Record<string, string> = {};
  for (const [canonKo, arr] of Object.entries(HARD_GROUPS)) {
    for (const raw of arr) {
      m[normalizeKey(raw)] = canonKo;
    }
  }
  return m;
})();

/**
 * 하드 매핑 조회 함수
 * - raw 문자열을 받아 정규화 후, 표준 한국어 라벨을 반환 (없으면 null)
 */
export function resolveHardCanonicalKo(raw: string): string | null {
  const key = normalizeKey(raw);
  return HARD_SYNONYM_MAP[key] ?? null;
}

/** 하드 그룹 전체를 외부 참고용 */
export function getHardGroups() {
  return HARD_GROUPS;
}
