---
inclusion: always
---

# 기술 스택 - "이 도구들을 사용하세요"

## 백엔드 기술 스택

### 1️⃣ 핵심 프레임워크

- **NestJS**: Progressive Node.js 프레임워크 (메인 백엔드 프레임워크)
- **Node.js**: 런타임 환경
- **TypeScript**: 주 개발 언어 (엄격한 타입 검사 활성화)

### 2️⃣ 데이터베이스 및 ORM

- **PostgreSQL**: 메인 데이터베이스
- **TypeORM**: 데이터베이스 ORM
  - Entity auto-loading 활성화
  - 수동 마이그레이션 사용 (synchronize: false)
  - Soft delete 기본 사용

### 3️⃣ 인증 및 보안

- **JWT**: 토큰 기반 인증
- **bcrypt**: 비밀번호 해싱 (최소 12 rounds)
- **class-validator**: DTO 검증
- **class-transformer**: 데이터 변환

### 4️⃣ 외부 서비스 통합

- **OpenAI API**: AI 기능 통합
- **Nodemailer**: 이메일 발송 기능
- **RxJS**: 반응형 프로그래밍 지원

### 5️⃣ 개발 도구

- **ESLint**: 코드 린팅 (TypeScript 지원)
- **Prettier**: 코드 포맷팅 (single quotes, trailing commas)
- **Jest**: 테스팅 프레임워크 (unit & e2e 테스트)

## 프론트엔드 기술 스택 (향후 확장)

- **React**: UI 라이브러리
- **TypeScript**: 타입 안정성
- **Tailwind CSS**: 스타일링

## 개발 환경

- **Windows** and **MacOs**: 개발 환경
- **PowerShell/CMD**: 쉘 환경
- **Git**: 버전 관리

## 패키지 관리

- **npm**: 패키지 매니저
- **package.json**: 의존성 관리

## 환경 설정

- **.env**: 환경 변수 관리
- **CORS**: localhost:3000 프론트엔드 통합 설정

## 금지된 기술

- **다른 ORM 사용 금지** (TypeORM만 사용)
- **JavaScript 사용 금지** (TypeScript만 사용)
- **다른 데이터베이스 사용 금지** (PostgreSQL만 사용)
- **동기식 라이브러리 사용 금지** (비동기 패턴 준수)

## 버전 관리

- **Node.js**: LTS 버전 사용
- **TypeScript**: 최신 안정 버전
- **NestJS**: 최신 안정 버전
- **의존성 업데이트**: 정기적으로 보안 패치 적용

## 성능 최적화 도구

- **압축**: gzip 압축 활성화
- **캐싱**: Redis (필요시 추가)
- **로깅**: NestJS 내장 로거 사용
- **모니터링**: 성능 메트릭 수집 (필요시 추가)
