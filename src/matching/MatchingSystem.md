# 매칭 시스템 (Matching System)

공부 태그 기반 사용자 매칭 및 추천 시스템입니다.

## 📋 주요 기능

### 1. 공부 태그 기반 매칭

- 특정 공부 태그를 가진 사용자 검색
- 전체 사용자 대상 매칭 (태그 미선택 시)
- 가중치 점수 기반 정렬

### 2. 매칭 점수 계산

- **생활 패턴 점수** (40%): 참여 시간대 및 기간 기반
- **공부 태그 점수** (60%): 태그별 숙련도 가중치 점수 기반
- 최종 점수: 0~1 범위로 정규화

### 3. 성능 최적화

- QueryBuilder를 사용한 효율적인 데이터 조회
- 필요한 관계만 선택적으로 로드
- 페이지네이션 지원

## 🚀 API 사용법

### 공부 태그 기반 매칭 조회

```http
GET /matching/by-tag
Authorization: Bearer <JWT_TOKEN>
```

#### Query Parameters

| 파라미터 | 타입   | 필수 | 기본값 | 설명                       |
| -------- | ------ | ---- | ------ | -------------------------- |
| tag_name | string | 선택 | -      | 검색할 공부 태그 이름      |
| page     | number | 선택 | 1      | 페이지 번호                |
| limit    | number | 선택 | 20     | 페이지당 결과 수 (최대 50) |

#### 예시 요청

```bash
# 특정 태그로 검색
curl -X GET "http://localhost:3000/matching/by-tag?tag_name=백엔드&page=1&limit=20" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# 전체 사용자 대상 매칭
curl -X GET "http://localhost:3000/matching/by-tag?page=1&limit=20" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

#### 응답 예시

```json
{
  "status_code": 200,
  "message": "'백엔드' 태그를 가진 사용자 매칭 결과입니다.",
  "option": {
    "data": [
      {
        "profile_id": 1,
        "user_uuid": "550e8400-e29b-41d4-a716-446655440000",
        "display_name": "김철수",
        "image": "https://example.com/profile.jpg",
        "goals_note": "스프링 부트 마스터하기",
        "university_name": "서울대학교",
        "major_name": "컴퓨터공학",
        "region": "서울특별시 강남구",
        "start_time": "09:00",
        "end_time": "18:00",
        "period": 3,
        "period_length": "중기",
        "age": 23,
        "gender": "남성",
        "collab_style_name": "피어",
        "collab_style_description": "같이 성장",
        "meeting_type_name": "혼합",
        "smoking_status": "비흡연",
        "preferred_member_count": "3-5명",
        "study_tags": [
          {
            "tag_name": "백엔드",
            "priority": 1,
            "proficiency_level": "중급"
          },
          {
            "tag_name": "Java",
            "priority": 2,
            "proficiency_level": "초급"
          },
          {
            "tag_name": "Spring",
            "priority": 3,
            "proficiency_level": "초급"
          }
        ],
        "match_score": 0.78
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 45,
      "total_pages": 3
    }
  }
}
```

## 📊 매칭 점수 계산 로직

### 1. 생활 패턴 점수 (Lifestyle Score)

```typescript
// src/matching/utils/calculate-match-score.ts
calculateLifestyleScore(participationInfo);
```

- **시간대 점수**: 가능한 시간 (0~13시간 기준)
- **기간 점수**: 참여 기간 (단기/중기/장기)
- **가중치**: 시간 50%, 기간 50%

### 2. 공부 태그 점수 (Study Score)

#### 태그 선택 시

```typescript
// 특정 태그의 proficiency_weight_avg_score 사용
normalizeTagScore(tag.proficiency_weight_avg_score);
```

#### 태그 미선택 시

```typescript
// 사용자 전체 weight_avg_score 사용
normalizeUserScore(user.weight_avg_score);
```

### 3. 최종 매칭 점수

```typescript
finalScore = lifestyleScore * 0.4 + studyScore * 0.6;
```

- 생활 패턴: 40%
- 공부 태그: 60%
- 결과: 0~1 범위 (높을수록 매칭도 높음)

## 🔧 유틸리티 함수

### calculate-match-score.ts

```typescript
// 생활 패턴 점수 계산
calculateLifestyleScore(participationInfo): number

// 태그 점수 정규화 (1~5 → 0~1)
normalizeTagScore(tagWeightScore): number

// 사용자 점수 정규화 (1~5 → 0~1)
normalizeUserScore(userWeightScore): number

// 최종 매칭 점수 계산
calculateFinalMatchScore(lifestyleScore, studyScore, weights): number
```

### format-match-result.ts

```typescript
// 단일 프로필 포맷팅
formatMatchResult(profile, matchScore): MatchResultDto

// 여러 프로필 포맷팅
formatMatchResults(profiles, matchScores): MatchResultDto[]
```

## 🎯 매칭 알고리즘 흐름

```
1. 사용자 인증 확인 (JWT)
   ↓
2. 매칭 대상 조회
   - 태그 선택: 해당 태그를 가진 사용자
   - 태그 미선택: 전체 사용자
   ↓
3. 각 사용자의 매칭 점수 계산
   - 생활 패턴 점수 (40%)
   - 공부 태그 점수 (60%)
   ↓
4. 매칭 점수 기준 정렬 (내림차순)
   ↓
5. 페이지네이션 적용
   ↓
6. 결과 포맷팅 및 반환
```

## 📈 성능 최적화 전략

### 1. 데이터베이스 쿼리 최적화

```typescript
// QueryBuilder 사용
this.profilesRepository
  .createQueryBuilder('profile')
  .leftJoinAndSelect('profile.user', 'user')
  .leftJoinAndSelect('profile.study_tags', 'study_tags');
// ... 필요한 관계만 선택적으로 로드
```

### 2. 페이지네이션

```typescript
.skip((page - 1) * limit)
.take(limit)
```

### 3. 인덱스 활용

- `study_tags.tag_name`: 태그 검색 최적화
- `profiles.deleted_at`: Soft delete 필터링
- `study_tags.profiles_id`: 관계 조인 최적화

## 🧪 테스트 시나리오

### 1. 특정 태그로 매칭

```bash
GET /matching/by-tag?tag_name=백엔드
```

**예상 결과**: 백엔드 태그를 가진 사용자들이 매칭 점수 순으로 정렬

### 2. 전체 사용자 매칭

```bash
GET /matching/by-tag
```

**예상 결과**: 모든 사용자가 전체 가중치 점수 기준으로 정렬

### 3. 페이지네이션

```bash
GET /matching/by-tag?page=2&limit=10
```

**예상 결과**: 11~20번째 결과 반환

## 🔍 디버깅 팁

### 매칭 점수가 0인 경우

1. `participation_info`가 null인지 확인
2. `proficiency_weight_avg_score`가 설정되어 있는지 확인
3. `weight_avg_score`가 null이 아닌지 확인

### 검색 결과가 없는 경우

1. 태그 이름 철자 확인 (대소문자 구분)
2. 해당 태그를 가진 사용자가 실제로 존재하는지 확인
3. Soft delete된 프로필은 제외됨

### 성능 이슈

1. 페이지당 결과 수를 줄이기 (limit 조정)
2. 불필요한 관계 로드 제거
3. 데이터베이스 인덱스 확인

## 📝 향후 개선 사항

- [ ] 캐싱 시스템 도입 (Redis)
- [ ] 실시간 매칭 알림
- [ ] 머신러닝 기반 추천 시스템
- [ ] 지역 기반 거리 계산
- [ ] 사용자 선호도 학습
- [ ] A/B 테스트 프레임워크
