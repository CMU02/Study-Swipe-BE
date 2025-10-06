<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456
[circleci-url]: https://circleci.com/gh/nestjs/nest

  <p align="center">A progressive <a href="http://nodejs.org" target="_blank">Node.js</a> framework for building efficient and scalable server-side applications.</p>
    <p align="center">
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/v/@nestjs/core.svg" alt="NPM Version" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="Package License" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/dm/@nestjs/common.svg" alt="NPM Downloads" /></a>
<a href="https://circleci.com/gh/nestjs/nest" target="_blank"><img src="https://img.shields.io/circleci/build/github/nestjs/nest/master" alt="CircleCI" /></a>
<a href="https://discord.gg/G7Qnnhy" target="_blank"><img src="https://img.shields.io/badge/discord-online-brightgreen.svg" alt="Discord"/></a>
<a href="https://opencollective.com/nest#backer" target="_blank"><img src="https://opencollective.com/nest/backers/badge.svg" alt="Backers on Open Collective" /></a>
<a href="https://opencollective.com/nest#sponsor" target="_blank"><img src="https://opencollective.com/nest/sponsors/badge.svg" alt="Sponsors on Open Collective" /></a>
  <a href="https://paypal.me/kamilmysliwiec" target="_blank"><img src="https://img.shields.io/badge/Donate-PayPal-ff3f59.svg" alt="Donate us"/></a>
    <a href="https://opencollective.com/nest#sponsor"  target="_blank"><img src="https://img.shields.io/badge/Support%20us-Open%20Collective-41B883.svg" alt="Support us"></a>
  <a href="https://twitter.com/nestframework" target="_blank"><img src="https://img.shields.io/twitter/follow/nestframework.svg?style=social&label=Follow" alt="Follow us on Twitter"></a>
</p>
  <!--[![Backers on Open Collective](https://opencollective.com/nest/backers/badge.svg)](https://opencollective.com/nest#backer)
  [![Sponsors on Open Collective](https://opencollective.com/nest/sponsors/badge.svg)](https://opencollective.com/nest#sponsor)-->

# Study Swipe

[![CI](https://github.com/your-username/study-swipe/actions/workflows/ci.yml/badge.svg)](https://github.com/your-username/study-swipe/actions/workflows/ci.yml)

스와이프 기반 스터디 매칭 플랫폼 백엔드 API

## Description

Study Swipe는 NestJS 기반의 스터디 매칭 플랫폼입니다. AI 기반 설문조사와 가중치 점수 시스템을 통해 최적의 스터디 파트너를 찾아줍니다.

## 📚 Documentation

- [API 문서](./api_document.md) - 전체 API 엔드포인트 문서
- [에러 코드 문서](./api_code.md) - API 에러 코드 및 해결 방법
- [CI/CD 설정 가이드](./.github/CI_SETUP.md) - GitHub Actions CI/CD 설정

## 🚀 Quick Start

### 1. 환경 설정

```bash
# .env 파일 생성
cp .env.example .env

# 환경변수 수정 (필수!)
vim .env
```

**필수 환경변수:**

- `DB_*`: PostgreSQL 데이터베이스 설정
- `JWT_SECRET`, `JWT_REFRESH_SECRET`: JWT 토큰 시크릿 키
- `OPENAI_API_KEY`: OpenAI API 키 (AI 설문조사용)
- `AWS_*`, `SES_*`: AWS SES 이메일 설정 (선택)

### 2. 의존성 설치

```bash
$ npm install
```

### 3. 데이터베이스 설정

```bash
# PostgreSQL 실행 확인
pg_isready

# 데이터베이스 생성
createdb study_swipe
```

### 4. 애플리케이션 실행

```bash
# development
$ npm run start

# watch mode (권장)
$ npm run start:dev

# production mode
$ npm run start:prod
```

서버가 실행되면 `http://localhost:3000`에서 접속 가능합니다.

## 🧪 Testing

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov

# watch mode
$ npm run test:watch
```

## 🔧 Development

```bash
# lint
$ npm run lint

# format
$ npm run format

# build
$ npm run build
```

## 🎯 Features

- **인증 시스템**: JWT 기반 회원가입/로그인, 이메일 인증
- **프로필 관리**: 상세한 사용자 프로필 및 학습 선호도 설정
- **AI 설문조사**: OpenAI 기반 맞춤형 설문 생성 및 점수 계산
- **매칭 시스템**: 가중치 점수 기반 최적의 스터디 파트너 추천
- **공부 태그**: 최대 5개의 공부 태그 및 숙련도 관리

## 🏗️ Tech Stack

- **Framework**: NestJS
- **Language**: TypeScript
- **Database**: PostgreSQL
- **ORM**: TypeORM
- **Authentication**: JWT
- **AI**: OpenAI API
- **Email**: AWS SES / Nodemailer
- **Testing**: Jest

## 📦 Project Structure

```
src/
├── auth/              # 인증 모듈
├── profiles/          # 프로필 관리
├── matching/          # 매칭 시스템
├── questions/         # AI 설문조사
├── study_tags/        # 공부 태그 관리
├── universities/      # 대학교 정보
├── database/seeds/    # 테스트 데이터
└── ...
```

## 🔐 Environment Variables

프로젝트 실행에 필요한 환경변수는 `.env.example`을 참고하세요.

```bash
# Database
DB_HOST=localhost
DB_PORT=5432
DB_PASSWORD=your_password
DB_USERNAME=postgres
DB_DATABASE=study_swipe

# JWT
JWT_SECRET=your_jwt_secret
JWT_REFRESH_SECRET=your_jwt_refresh_secret

# OpenAI
OPENAI_API_KEY=your_openai_key

# AWS SES (선택)
AWS_REGION=ap-northeast-2
SES_ACCESS_KEY=your_access_key
SES_SECRET_ACCESS_KEY=your_secret_key
```

## 🚢 Deployment

### GitHub Actions CI/CD

이 프로젝트는 GitHub Actions를 사용한 자동화된 CI/CD 파이프라인을 제공합니다.

**CI 워크플로우**:

- Lint 검사
- 테스트 실행
- 빌드 검증
- 보안 감사

자세한 설정 방법은 [CI/CD 설정 가이드](./.github/CI_SETUP.md)를 참고하세요.

## Resources

Check out a few resources that may come in handy when working with NestJS:

- Visit the [NestJS Documentation](https://docs.nestjs.com) to learn more about the framework.
- For questions and support, please visit our [Discord channel](https://discord.gg/G7Qnnhy).
- To dive deeper and get more hands-on experience, check out our official video [courses](https://courses.nestjs.com/).
- Deploy your application to AWS with the help of [NestJS Mau](https://mau.nestjs.com) in just a few clicks.
- Visualize your application graph and interact with the NestJS application in real-time using [NestJS Devtools](https://devtools.nestjs.com).
- Need help with your project (part-time to full-time)? Check out our official [enterprise support](https://enterprise.nestjs.com).
- To stay in the loop and get updates, follow us on [X](https://x.com/nestframework) and [LinkedIn](https://linkedin.com/company/nestjs).
- Looking for a job, or have a job to offer? Check out our official [Jobs board](https://jobs.nestjs.com).

## Support

Nest is an MIT-licensed open source project. It can grow thanks to the sponsors and support by the amazing backers. If you'd like to join them, please [read more here](https://docs.nestjs.com/support).

## Stay in touch

- Author - [Kamil Myśliwiec](https://twitter.com/kammysliwiec)
- Website - [https://nestjs.com](https://nestjs.com/)
- Twitter - [@nestframework](https://twitter.com/nestframework)

## How to Use (사용 방식)

- 질문 생성
  방식 - POST
  http://localhost:3000/ai/make-questions

  ## [SAMPLE]

  ```
  {
    "tags": ["BackEnd", "FrontEnd"]
  }
  ```

  ## [ANSWER]

  ```
  {
    "items": [
        {
            "tag": "백엔드",
            "questions": [
                {
                    "level": "기초",
                    "text": "백엔드 개발의 기본 개념을 이해하고 있습니까?"
                },
                {
                    "level": "경험",
                    "text": "RESTful API를 설계하고 구현한 경험이 있습니까?"
                },
                {
                    "level": "응용",
                    "text": "대규모 트래픽을 처리하는 백엔드 시스템을 최적화한 경험이 있습니까?"
                }
            ]
        },
        {
            "tag": "프론트엔드",
            "questions": [
                {
                    "level": "기초",
                    "text": "HTML, CSS, JavaScript의 기본 구조와 사용법을 알고 있습니까?"
                },
                {
                    "level": "경험",
                    "text": "React나 Vue.js 같은 프론트엔드 프레임워크를 사용해 본 경험이 있습니까?"
                },
                {
                    "level": "응용",
                    "text": "복잡한 프론트엔드 애플리케이션의 성능을 최적화한 경험이 있습니까?"
                  }
              ]
          }
      ]
  }
  ```

- 태그 중복 검출
  방식 - POST
  http://localhost:3000/tags/resolve

  ## [SAMPLE]

  ```
  {
    "tags": ["BackEnd", "FrontEnd"]
  }
  ```

  ## [ANSWER]

  ```
  {
    "uniqueCanonical": [
        "백엔드",
        "프론트엔드"
    ],
    "mappings": [
        {
            "raw": "스프링 부트",
            "key": "스프링부트",
            "canonId": "ESCO:it.backend_developer",
            "canonical": "백엔드",
            "confidence": 0.99
        },
        {
            "raw": "백엔드",
            "key": "백엔드",
            "canonId": "ESCO:it.backend_developer",
            "canonical": "백엔드",
            "confidence": 0.99
        },
        {
            "raw": "프론트-엔드",
            "key": "프론트엔드",
            "canonId": "ESCO:it.frontend_developer",
            "canonical": "프론트엔드",
            "confidence": 0.99
          }
      ]
  }

  ```

- 점수 산출 Ver.2
  방식 - POST
  http://localhost:3000/ai/score

  ## [SAMPLE]

  ```
    {
    "answers": [
        {
        "tag": "백엔드",
        "questions": [
            { "no": 1, "level": "기초", "value": 4 },
            { "no": 2, "level": "경험", "value": 3 },
            { "no": 3, "level": "응용", "value": 5 }
        ]
        },
        {
        "tag": "프론트엔드",
        "questions": [
            { "no": 4, "level": "기초", "value": 2 },
            { "no": 5, "level": "경험", "value": 3 },
            { "no": 6, "level": "응용", "value": 4 }
        ]
        }
    ]
    }
  ```

  ## [ANSWER]
  - tag : 사용자가 넣은 태그
  - count : 문항 개수
  - sum : 각 문항 점수의 총합
  - wavg(가중치 평균) : (기초 _ 1.0 + 경험 _ 1.2 + 응용 \* 1.4) / (1.0 + 1.2 + 1.4)
  - grade : 사용자의 등급 (초급, 중급, 상급)
  - details : 문제에 대한 정보
  - overall : 사용자에 대한 전반적인 점수 평가 (차후 코사인 정렬과 동일 점수대로 매칭)
  - overallGrade : 사용자의 전체적인 등급

  ```
  {
    "perTag": [
        {
            "tag": "백엔드",
            "count": 3,
            "sum": 12,
            "wavg": 4.06,
            "grade": "상급",
            "details": [
                {
                    "no": 1,
                    "level": "기초",
                    "value": 4
                },
                {
                    "no": 2,
                    "level": "경험",
                    "value": 3
                },
                {
                    "no": 3,
                    "level": "응용",
                    "value": 5
                }
            ]
        },
        {
            "tag": "프론트엔드",
            "count": 3,
            "sum": 9,
            "wavg": 3.11,
            "grade": "중급",
            "details": [
                {
                    "no": 4,
                    "level": "기초",
                    "value": 2
                },
                {
                    "no": 5,
                    "level": "경험",
                    "value": 3
                },
                {
                    "no": 6,
                    "level": "응용",
                    "value": 4
                }
            ]
        }
    ],
    "overall": {
        "count": 6,
        "avg5": 3.5,
        "wavg": 3.58,
        "sumAvg": 10.5,
        "overallGrade": "중급"
    }
  }
  ```

## License

Nest is [MIT licensed](https://github.com/nestjs/nest/blob/master/LICENSE).
