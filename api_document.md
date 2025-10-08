# Study Swipe API 문서

Study Swipe 백엔드 API 엔드포인트 문서입니다.

## 📋 목차

- [인증 (Authentication)](#인증-authentication)
- [약관 동의 (Terms of Use)](#약관-동의-terms-of-use)
- [대학교 (Universities)](#대학교-universities)
- [프로필 (Profiles)](#프로필-profiles)
- [AI 설문조사 (AI Questions)](#ai-설문조사-ai-questions)
- [매칭 시스템 (Matching)](#매칭-시스템-matching)
- [시드 데이터 (Seeds)](#시드-데이터-seeds)

## 🔐 인증 방식

대부분의 API는 JWT 토큰 기반 인증이 필요합니다.

```http
Authorization: Bearer <JWT_TOKEN>
```

---

## 인증 (Authentication)

### 1. 회원가입

새로운 사용자를 등록합니다.

```http
POST /auth/register
Content-Type: application/json
```

**Request Body:**

```json
{
  "user_id": "testuser",
  "user_pwd": "testing123"
}
```

**Response:**

```json
{
  "status_code": 201,
  "message": "아이디가 성공적으로 등록되었습니다. 이메일 인증을 진행해주세요."
}
```

---

### 2. 이메일 인증 코드 발송

이메일 인증 코드를 발송합니다.

```http
POST /auth/send-verification-code
Content-Type: application/json
```

**Request Body:**

```json
{
  "user_id": "test1369",
  "user_email": "testing@naver.com"
}
```

**Response:**

```json
{
  "status_code": 200,
  "message": "인증코드가 이메일로 발송되었습니다."
}
```

---

### 3. 이메일 인증 코드 확인

이메일 인증 코드를 확인하고 인증을 완료합니다.

```http
POST /auth/confirm-verification-code
Content-Type: application/json
```

**Request Body:**

```json
{
  "user_id": "test1369",
  "user_email": "hyeonjun1968@naver.com",
  "verify_code": "244482"
}
```

**Response:**

```json
{
  "status_code": 200,
  "message": "인증이 완료되었습니다. 회원가입을 환영합니다!",
  "option": {
    "data": {
      "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
    }
  }
}
```

---

### 4. 로그인

사용자 로그인을 처리합니다. (브루트 포스 방지: 1분간 5회 제한)

```http
POST /auth/signin
Content-Type: application/json
```

**Request Body:**

```json
{
  "user_id": "test1369",
  "user_pwd": "testing1369"
}
```

**Response:**

```json
{
  "status_code": 200,
  "message": "로그인에 성공했습니다.",
  "option": {
    "data": {
      "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
    }
  }
}
```

---

## 약관 동의 (Terms of Use)

### 1. 약관 동의

사용자의 약관 동의 정보를 등록합니다.

```http
POST /terms-of-use/agree
Content-Type: application/json
```

**Request Body:**

```json
{
  "user_id": "test1369",
  "is_over_18": true,
  "terms_of_service": true,
  "collection_usage_personal_informaiton": true,
  "third_party_sharing": true
}
```

**Response Body:**

```json
{
  "status_code": 200,
  "message": "약관 동의를 완료했습니다."
}
```

**필드 설명:**

| 필드                                  | 타입    | 필수 | 설명                       |
| ------------------------------------- | ------- | ---- | -------------------------- |
| user_id                               | string  | 필수 | 사용자 아이디              |
| is_over_18                            | boolean | 필수 | 만 18세 이상 여부          |
| terms_of_service                      | boolean | 필수 | 서비스 이용약관 동의       |
| collection_usage_personal_informaiton | boolean | 필수 | 개인정보 수집 및 이용 동의 |
| third_party_sharing                   | boolean | 필수 | 제3자 정보 제공 동의       |
| user_alarm_advertisement              | boolean | 선택 | 광고성 알림 수신 동의      |

**주의사항:**

- 필수 항목(`terms_of_service`, `collection_usage_personal_informaiton`, `third_party_sharing`)은 모두 `true`여야 합니다.
- `is_over_18`이 `false`인 경우 회원가입이 제한될 수 있습니다.

---

## 대학교 (Universities)

### 1. 대학교 정보 업데이트

사용자의 대학교 정보를 업데이트합니다. 대학교가 존재하지 않으면 자동으로 생성됩니다.

```http
PUT /universities/add
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json
```

**Request Body:**

```json
{
  "universityName": "서울대학교"
}
```

**Response:**

```json
{
  "status_code": 200,
  "message": "대학교 정보가 성공적으로 업데이트되었습니다.",
  "option": {
    "meta_data": {
      "user_uuid": "f706d372-f100-458f-ad47-df7a87a678bb",
      "university": {
        "id": "0b05cac2-9a36-412b-ae73-414706309bc7",
        "name": "서울대학교"
      }
    }
  }
}
```

**특징:**

- 대학교 이름으로 자동으로 ID 생성 (공백 제거 후 소문자 변환)
- 존재하지 않는 대학교는 자동으로 생성
- 사용자와 대학교 정보 연결

**예시:**

```bash
# 서울대학교 설정
PUT /universities/add
{
  "universityName": "서울대학교"
}

# 연세대학교 설정
PUT /universities/add
{
  "universityName": "연세대학교"
}

# 고려대학교 설정
PUT /universities/add
{
  "universityName": "고려대학교"
}
```

---

## 프로필 (Profiles)

모든 프로필 API는 JWT 인증이 필요합니다.

### 1. 내 프로필 조회

현재 사용자의 프로필 정보를 조회합니다.

```http
GET /profiles/my-profile
Authorization: Bearer <JWT_TOKEN>
```

**Response:**

```json
{
  "status_code": 200,
  "message": "프로필 조회 성공",
  "option": {
    "meta_data": {
      "profile": {
        "id": 1,
        "display_name": "스터디 마스터",
        "image": "testImage.png",
        "birth_date": "2001-12-07",
        "age": 20,
        "gender": "남성",
        "bio_note": "Hello This Service Study Swipe",
        "goals_note": "토익 900점 달성하기",
        "activity_radius_km": 10,
        "preferred_member_count": {
          "id": 1,
          "min_member_count": 3,
          "max_member_count": 6,
          "createdAt": "2025-10-06T10:43:56.294Z",
          "updatedAt": "2025-10-06T10:43:56.294Z"
        },
        "contact_info": "카카오톡: study_buddy",
        "smoking_status": {
          "id": "2",
          "name": "비흡연"
        },
        "social_pref": {
          "id": 1,
          "name": "네"
        },
        "participation_info": {
          "id": 1,
          "period": 2,
          "period_length": "단기",
          "start_time": "18:00",
          "end_time": "21:00",
          "createdAt": "2025-10-06T10:45:28.548Z",
          "updatedAt": "2025-10-06T10:45:28.548Z",
          "deletedAt": null
        },
        "region": {
          "id": "1100000000",
          "city_first": "서울특별시",
          "city_second": null,
          "lat": "48.03000000",
          "lng": "48.85000000"
        },
        "meeting_type": {
          "id": 1,
          "name": "온라인"
        },
        "major": {
          "id": 1,
          "name": "응용SW전공"
        },
        "collab_style": {
          "id": 1,
          "name": "멘토",
          "description": "가르쳐주고 싶음"
        },
        "createdAt": "2025-10-06T10:42:49.236Z",
        "updatedAt": "2025-10-06T10:45:23.030Z",
        "deletedAt": null
      }
    }
  }
}
```

---

### 2. 프로필 생성

새로운 프로필을 생성합니다.

```http
POST /profiles/create-profile
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json
```

**Request Body:**

```json
{
  "display_name": "김철수",
  "gender": "남성",
  "birth_date": "2000-01-01",
  "bio_note": "백엔드 개발자를 꿈꾸는 학생입니다.",
  "age": 21,
  "image": "testing.png"
}
```

> ⚠️ **이미지는 아직 S3 연결되지 않음**

---

### 3. 프로필 수정

기존 프로필을 수정합니다.

```http
POST /profiles/update-profile
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json
```

**Request Body:**

```json
{
  "display_name": "스터디 마스터",
  "bio_note": "Hello This Service Study Swipe",
  "image": "testImage.png",
  "birth_date": "2001-12-07",
  "age": "20",
  "gender": "남성"
}
```

---

### 4. 흡연 상태 업데이트

```http
POST /profiles/smoking-status
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json
```

**Request Body:**

```json
{
  "smoking_status_name": "비흡연"
}
```

---

### 5. 사교모임 선호도 업데이트

```http
POST /profiles/social-pref
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json
```

**Request Body:**

```json
{
  "social_pref_name": "네"
}
```

---

### 6. 선호 인원 수 업데이트

```http
POST /profiles/preferred-member-count
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json
```

**Request Body:**

```json
{
  "min_member_count": 3,
  "max_member_count": 5
}
```

---

### 7. 학습 정보 업데이트

```http
POST /profiles/study-info
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json
```

**Request Body:**

```json
{
  "goals_note": "스프링 부트 마스터하기",
  "activity_radius_km": 10,
  "contact_info": "kakao_testuser"
}
```

---

### 8. 학습 목표 업데이트

```http
POST /profiles/goals-note
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json
```

**Request Body:**

```json
{
  "goals_note": "스프링 부트 마스터하기"
}
```

---

### 9. 활동 반경 업데이트

```http
POST /profiles/activity-radius
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json
```

**Request Body:**

```json
{
  "activity_radius_km": 15
}
```

---

### 10. 연락 방법 업데이트

```http
POST /profiles/contact-info
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json
```

**Request Body:**

```json
{
  "contact_info": "kakao_testuser"
}
```

---

### 11. 지역 정보 업데이트

```http
POST /profiles/region
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json
```

**Request Body:**

```json
{
  "region_ids": "1120062000"
}
```

### 11-1. 지역정보 ID 찾기

#### 전체지역 조회

```http
GET /regions
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json
```

**Request Body:**

```json
{
  "status_code": 200,
  "message": "지역 목록 조회 성공",
  "option": {
    "meta_data": {
      "regions": [
        {
          "id": "1100000000",
          "city_first": "서울특별시",
          "city_second": null,
          "lat": "48.85000000",
          "lng": "48.03000000"
        },
        {
          "id": "1111000000",
          "city_first": "서울특별시",
          "city_second": "종로구",
          "lat": "13.36000000",
          "lng": "53.91000000"
        }
        // ...
      ]
    }
  }
}
```

### 시/도 목록 조회

```http
GET /regions/cities
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json
```

**Request Body:**

```json
{
  "status_code": 200,
  "message": "시/도 목록 조회 성공",
  "option": {
    "meta_data": {
      "cities": [
        "경기도",
        "이어도",
        "경상남도",
        "경상북도",
        "전라남도",
        "충청남도",
        "충청북도",
        "광주광역시",
        "대구광역시",
        "대전광역시",
        "부산광역시",
        "서울특별시",
        "울산광역시",
        "인천광역시",
        "강원특별자치도",
        "세종특별자치시",
        "전북특별자치도",
        "제주특별자치도"
      ]
    }
  }
}
```

### 특정 시/도의 지역 조회

```http
GET /regions/city/서울특별시
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json
```

**Request Body:**

```json
{
  "status_code": 200,
  "message": "서울특별시 지역 목록 조회 성공",
  "option": {
    "meta_data": {
      "regions": [
        {
          "id": "1114057000",
          "city_first": "서울특별시",
          "city_second": "중구",
          "lat": "26.47000000",
          "lng": "51.76000000"
        },
        {
          "id": "1114058000",
          "city_first": "서울특별시",
          "city_second": "중구",
          "lat": "32.82000000",
          "lng": "35.76000000"
        }
        // ...
      ]
    }
  }
}
```

---

### 12. 모임 유형 업데이트

```http
POST /profiles/meeting-type
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json
```

**Request Body:**

```json
{
  "meeting_type_id": 1
}
```

**모임 유형 옵션:**

- 1: 온라인
- 2: 오프라인
- 3: 혼합

---

### 13. 협업 성향 업데이트

```http
POST /profiles/collab-style
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json
```

**Request Body:**

```json
{
  "collab_style_id": 2
}
```

**협업 성향 옵션:**

- 1: 멘토 (가르쳐주고 싶음)
- 2: 피어 (같이 성장)
- 3: 러너 (배우고 싶음)

---

### 14. 전공 업데이트

```http
POST /profiles/major
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json
```

**Request Body:**

```json
{
  "major_name": "컴퓨터공학"
}
```

---

### 15. 참여 정보 업데이트

```http
POST /profiles/participation-info
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json
```

**Request Body:**

```json
{
  "period": 3,
  "period_length": "중기",
  "start_time": "09:00",
  "end_time": "18:00"
}
```

**기간 길이 옵션:**

- `단기`: 1-2개월
- `중기`: 3-5개월
- `장기`: 6개월 이상

---

### 16. 공부 태그 생성/업데이트

```http
POST /profiles/study-tags
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json
```

**Request Body:**

```json
{
  "study_tags": [
    {
      "tag_name": "백엔드",
      "priority": 1
    },
    {
      "tag_name": "Java",
      "priority": 2
    },
    {
      "tag_name": "Spring",
      "priority": 3
    }
  ]
}
```

**제약사항:**

- 최대 5개까지 설정 가능
- priority는 1~5 사이의 값 (중복 불가)

---

## AI 설문조사 (AI Questions)

### 1. AI 질문 생성

공부 태그 기반으로 AI가 설문 질문을 생성합니다.

```http
POST /ai/make-questions
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json
```

**Request Body:**

```json
{
  "tags": ["백엔드", "프론트엔드", "데이터분석"]
}
```

**제약사항:**

- 최소 1개, 최대 5개의 태그

**Response:**

```json
{
  "questions": [
    {
      "no": 1,
      "tag": "백엔드",
      "level": "기초",
      "question": "RESTful API의 기본 개념을 설명할 수 있나요?"
    },
    {
      "no": 2,
      "tag": "백엔드",
      "level": "경험",
      "question": "데이터베이스 인덱스를 활용한 쿼리 최적화 경험이 있나요?"
    },
    {
      "no": 3,
      "tag": "백엔드",
      "level": "응용",
      "question": "마이크로서비스 아키텍처를 설계하고 구현해본 적이 있나요?"
    }
  ]
}
```

---

### 2. 설문조사 완료

설문조사를 완료하고 결과를 DB에 저장합니다.

```http
POST /ai/complete-survey
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json
```

**Request Body:**

```json
{
  "answers": [
    {
      "tag": "백엔드",
      "questions": [
        { "no": 1, "level": "기초", "value": 4 },
        { "no": 2, "level": "경험", "value": 3 },
        { "no": 3, "level": "응용", "value": 5 }
      ]
    }
  ]
}
```

**Response:**

```json
{
  "message": "설문조사가 완료되었습니다.",
  "scoreResult": {
    "perTag": [
      {
        "tag": "Figma",
        "count": 3,
        "sum": 8,
        "wavg": 2.83,
        "grade": "중급",
        "details": [
          {
            "no": 10,
            "level": "기초",
            "value": 1
          },
          {
            "no": 11,
            "level": "경험",
            "value": 3
          },
          {
            "no": 12,
            "level": "응용",
            "value": 4
          }
        ]
      }
      // ...
    ],
    "overall": {
      "count": 15,
      "avg5": 3.53,
      "wavg": 3.58,
      "sumAvg": 10.6,
      "overallGrade": "중급"
    }
  },
  "updatedTags": [
    {
      "id": "7126b093-c273-4311-9042-b31616ae7dbd",
      "tag_name": "Figma",
      "proficiency_score": 8,
      "proficiency_avg_score": 2.83,
      "proficiency_level": "중급",
      "is_survey_completed": true
    }
    // ...
  ]
}
```

---

## 매칭 시스템 (Matching)

### 1. 공부 태그 기반 매칭

특정 공부 태그를 가진 사용자 또는 전체 사용자를 매칭합니다.

```http
GET /matching/by-tag
Authorization: Bearer <JWT_TOKEN>
```

**Query Parameters:**

| 파라미터 | 타입   | 필수 | 기본값 | 설명                       |
| -------- | ------ | ---- | ------ | -------------------------- |
| tag_name | string | 선택 | -      | 검색할 공부 태그 이름      |
| page     | number | 선택 | 1      | 페이지 번호                |
| limit    | number | 선택 | 20     | 페이지당 결과 수 (최대 50) |

**예시 요청:**

```bash
# 특정 태그로 검색
GET /matching/by-tag?tag_name=백엔드&page=1&limit=20

# 전체 사용자 대상 매칭
GET /matching/by-tag?page=1&limit=20
```

**Response:**

```json
{
  "status_code": 200,
  "message": "'백엔드' 태그를 가진 사용자 매칭 결과입니다.",
  "option": {
    "data": [
      {
        "profile_id": 12,
        "user_uuid": "da8230f1-0cef-4fa8-9ba9-2638f4924e38",
        "display_name": "오준석",
        "image": null,
        "goals_note": "해킹 방어 기술 익히기",
        "university_name": "연세대학교",
        "major_name": null,
        "region": null,
        "start_time": "09:00",
        "end_time": "18:00",
        "period": 6,
        "period_length": "장기",
        "age": 25,
        "gender": "남성",
        "collab_style_name": null,
        "collab_style_description": null,
        "meeting_type_name": null,
        "smoking_status": null,
        "preferred_member_count": null,
        "study_tags": [
          {
            "tag_name": "보안",
            "priority": 1,
            "proficiency_level": "중급"
          },
          {
            "tag_name": "네트워크",
            "priority": 2,
            "proficiency_level": "중급"
          },
          {
            "tag_name": "해킹",
            "priority": 3,
            "proficiency_level": "초급"
          }
        ],
        "match_score": 0.74
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

**매칭 점수 계산:**

- 생활 패턴 점수 (40%): 참여 시간대 및 기간 기반
- 공부 태그 점수 (60%): 태그별 숙련도 가중치 점수 기반
- 최종 점수: 0~1 범위 (높을수록 매칭도 높음)

---

## 시드 데이터 (Seeds)

개발 환경에서만 사용하는 테스트 데이터 생성 API입니다.

### 1. 테스트 사용자 생성

12명의 테스트 사용자를 생성합니다.

```http
POST /seeds/test-users
```

**Response:**

```json
{
  "status_code": 201,
  "message": "테스트 사용자 12명이 성공적으로 생성되었습니다."
}
```

**생성되는 사용자:**

- testuser01 ~ testuser12
- 비밀번호: `Test1234!` (공통)

---

### 2. 테스트 사용자 삭제

모든 테스트 사용자를 삭제합니다.

```http
DELETE /seeds/test-users
```

**Response:**

```json
{
  "status_code": 200,
  "message": "테스트 사용자가 성공적으로 삭제되었습니다."
}
```

---

## 📊 응답 코드

### 성공 응답

| 코드 | 설명                       |
| ---- | -------------------------- |
| 200  | 성공 (조회, 수정)          |
| 201  | 생성 성공                  |
| 204  | 삭제 성공 (응답 본문 없음) |

### 에러 응답

| 코드 | 설명                        |
| ---- | --------------------------- |
| 400  | 잘못된 요청 / 검증 실패     |
| 401  | 인증 실패 (토큰 없음/만료)  |
| 403  | 권한 부족                   |
| 404  | 리소스 없음                 |
| 409  | 중복 데이터 / 충돌          |
| 429  | 요청 제한 초과 (Rate Limit) |
| 500  | 서버 내부 오류              |

---

## 🔒 보안

### JWT 토큰

- **Access Token**: 3시간 유효
- **Refresh Token**: 7일 유효
- 헤더 형식: `Authorization: Bearer <token>`

### Rate Limiting

- 로그인: 1분간 5회 제한
- 기타 API: 1분간 10회 제한

### 비밀번호 정책

- 최소 8자 이상
- 영문 대소문자, 숫자, 특수문자 포함 권장

---

## 📝 참고사항

### 페이지네이션

대부분의 목록 조회 API는 페이지네이션을 지원합니다.

```json
{
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "total_pages": 5
  }
}
```

### 에러 응답 형식

```json
{
  "status_code": 400,
  "message": "에러 메시지",
  "error": "상세 에러 정보"
}
```

### 날짜/시간 형식

- **날짜**: `YYYY-MM-DD` (예: 2025-01-01)
- **시간**: `HH:MM` (예: 09:00, 14:30)
- **타임스탬프**: ISO 8601 형식

---

## 🚀 시작하기

### 1. 회원가입 및 로그인

```bash
# 1. 회원가입
POST /auth/register

# 2. 약관 동의
POST /terms-of-use/agree

# 3. 이메일 인증 코드 발송
POST /auth/send-verification-code

# 4. 이메일 인증 코드 확인 (JWT 토큰 발급)
POST /auth/confirm-verification-code

# 5. 로그인 (이후 사용)
POST /auth/signin
```

### 2. 기본 정보 설정

```bash
# 1. 대학교 설정
PUT /universities/add
```

### 3. 프로필 설정

```bash
# 1. 프로필 생성
POST /profiles/create-profile

# 2. 공부 태그 설정
POST /profiles/study-tags

# 3. 참여 정보 설정
POST /profiles/participation-info

# 4. 기타 프로필 정보 설정
POST /profiles/region
POST /profiles/major
POST /profiles/collab-style
POST /profiles/meeting-type
POST /profiles/smoking-status
POST /profiles/social-pref
POST /profiles/preferred-member-count
...
```

### 4. AI 설문조사

```bash
# 1. AI 질문 생성
POST /ai/make-questions

# 2. 설문 응답 및 완료
POST /ai/complete-survey
```

### 5. 매칭

```bash
# 특정 태그로 매칭
GET /matching/by-tag?tag_name=백엔드

# 전체 사용자 매칭
GET /matching/by-tag
```

---

**버전**: 1.0.0  
**최종 업데이트**: 2025-10-05
