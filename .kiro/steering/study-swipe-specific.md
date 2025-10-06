---
inclusion: always
---

# Study Swipe 프로젝트 특화 규칙

## 프로젝트 개요

### 🎯 **프로젝트 목표**

Study Swipe는 스와이프 기반 학습 매칭 플랫폼으로, 사용자들이 효율적으로 스터디 파트너를 찾을 수 있도록 돕는 NestJS 기반 백엔드 애플리케이션입니다.

### 📋 **핵심 기능**

- 사용자 인증 및 프로필 관리
- 스와이프 기반 매칭 시스템
- AI 기반 추천 시스템
- 이메일 알림 시스템
- 스터디 그룹 관리

## 도메인별 구현 규칙

### 1️⃣ 사용자 관리 (User Domain)

- **Primary Key**: `uuid` 타입 사용 (보안 강화)
- **인증**: JWT 기반 토큰 인증
- **비밀번호**: bcrypt 해싱 (최소 12 rounds)
- **이메일 인증**: 교육기관 이메일 검증 로직 포함

### 2️⃣ 프로필 관리 (Profile Domain)

- **관계 설정**: User와 1:1 관계
- **필수 필드**: `display_name`, `gender` (기본 정보)
- **선택 필드**: 나머지 모든 프로필 정보는 nullable
- **업데이트 패턴**: Upsert 방식으로 구현

### 3️⃣ 매칭 시스템 (Matching Domain)

- **스와이프 액션**: Like, Dislike, Skip 추적
- **매칭 로직**: 상호 Like 시 매칭 성사
- **추천 알고리즘**: AI 기반 사용자 선호도 분석

### 4️⃣ 알림 시스템 (Notification Domain)

- **이메일 발송**: Nodemailer 사용
- **템플릿 관리**: HTML/텍스트 이중 지원
- **발송 로그**: 성공/실패 추적

## 엔티티 설계 원칙

### 1️⃣ 공통 Audit 필드

모든 엔티티에 다음 필드를 포함합니다:

```typescript
@CreateDateColumn({ name: 'created_at' })
createdAt: Date;

@UpdateDateColumn({ name: 'updated_at' })
updatedAt: Date;

@DeleteDateColumn({ name: 'deleted_at' })
deletedAt?: Date;
```

### 2️⃣ 관계 설정 패턴

- **1:1 관계**: 소유하는 쪽에 `@JoinColumn()` 설정
- **N:1 관계**: Many 쪽에 `@JoinColumn()` 설정
- **M:N 관계**: `@JoinTable()` 사용하여 중간 테이블 명시

### 3️⃣ 컬럼 명명 규칙

- **데이터베이스**: `snake_case` (예: `user_id`, `created_at`)
- **TypeScript**: `camelCase` (예: `userId`, `createdAt`)
- **명시적 매핑**: `@Column({ name: 'snake_case_name' })` 사용

## API 설계 원칙

### 1️⃣ 응답 형식 표준화

```typescript
interface BaseResponse {
  status_code: number;
  message: string;
  option?: {
    data?: any;
    pagination?: PaginationInfo;
  };
}
```

### 2️⃣ HTTP 상태 코드 규칙

- **200**: 성공적인 조회/수정
- **201**: 성공적인 생성
- **204**: 성공적인 삭제 (응답 본문 없음)
- **400**: 잘못된 요청/검증 실패
- **401**: 인증 실패
- **403**: 권한 부족
- **404**: 리소스 없음
- **409**: 중복 데이터/충돌

### 3️⃣ 에러 메시지 규칙

- 한글로 사용자 친화적인 메시지 제공
- 구체적이고 실행 가능한 안내 포함
- 보안에 민감한 정보는 노출하지 않음

## 보안 구현 규칙

### 1️⃣ 인증 및 인가

- 모든 보호된 엔드포인트에 `@UseGuards(AuthGuard)` 적용
- JWT 페이로드에는 최소한의 정보만 포함 (`uuid`, `userId`)
- 토큰 만료 시간: Access Token 3시간, Refresh Token 7일

### 2️⃣ 데이터 검증

- 모든 DTO에 `class-validator` 데코레이터 적용
- 입력 데이터 길이 제한 설정
- 특수 문자 및 SQL 인젝션 방지

### 3️⃣ 환경 변수 관리

```
JWT_SECRET=강력한_랜덤_문자열
JWT_REFRESH_SECRET=다른_강력한_랜덤_문자열
DB_PASSWORD=데이터베이스_비밀번호
OPENAI_API_KEY=OpenAI_API_키
SMTP_PASSWORD=이메일_서비스_비밀번호
```

## 성능 최적화 규칙

### 1️⃣ 데이터베이스 쿼리 최적화

- N+1 문제 방지를 위한 적절한 `relations` 사용
- 페이지네이션 구현 (기본 limit: 20)
- 인덱스 활용을 위한 쿼리 최적화

### 2️⃣ 캐싱 전략

- 자주 조회되는 정적 데이터 캐싱
- Redis 활용 (필요시 도입)
- API 응답 캐싱 고려

### 3️⃣ 리소스 관리

- 데이터베이스 연결 풀 적절히 설정
- 메모리 누수 방지
- 불필요한 의존성 제거

## 테스트 전략

### 1️⃣ 단위 테스트 (Unit Test)

- 모든 서비스 메서드에 대한 테스트
- Mock 객체 활용하여 의존성 격리
- 엣지 케이스 포함한 테스트 케이스 작성

### 2️⃣ 통합 테스트 (Integration Test)

- 컨트롤러-서비스 간 연동 테스트
- 데이터베이스 연동 테스트
- 외부 API 연동 테스트

### 3️⃣ E2E 테스트

- 전체 사용자 플로우 테스트
- 인증부터 매칭까지 전 과정 검증
- 실제 사용 시나리오 기반 테스트

## 배포 및 운영

### 1️⃣ 환경 분리

- **Development**: 로컬 개발 환경
- **Staging**: 테스트 환경
- **Production**: 운영 환경

### 2️⃣ 로깅 전략

- 구조화된 로그 형식 사용
- 에러 로그와 액세스 로그 분리
- 민감한 정보 로그 제외

### 3️⃣ 모니터링

- API 응답 시간 모니터링
- 데이터베이스 성능 모니터링
- 에러율 및 사용자 활동 추적

## 특별 고려사항

### 1️⃣ AI 통합

- OpenAI API 호출 시 에러 처리 강화
- API 사용량 모니터링 및 제한
- 응답 데이터 검증 및 후처리

### 2️⃣ 이메일 서비스

- 발송 실패 시 재시도 로직
- 스팸 방지를 위한 발송 제한
- 템플릿 관리 및 다국어 지원 준비

### 3️⃣ 매칭 알고리즘

- 사용자 선호도 학습 및 개선
- 매칭 품질 메트릭 수집
- A/B 테스트를 위한 구조 준비

## 금지사항

- 사용자 개인정보를 로그에 기록 금지
- 하드코딩된 매칭 로직 사용 금지
- 테스트 데이터를 프로덕션에 사용 금지
- 인증 없이 민감한 API 노출 금지
