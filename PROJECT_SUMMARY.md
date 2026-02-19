# 디지털 자산 관리 플랫폼 - 프로젝트 요약

## 🎯 프로젝트 개요

개인 디지털 자산(일기, 에세이, 미술, 음악, 글, 뉴스)을 체계적으로 관리하고, LLM을 활용한 자동화된 메타데이터 생성 및 통찰 도출 플랫폼입니다.

## ✨ 주요 기능

### 1. 콘텐츠 관리
- **6가지 콘텐츠 타입**: 일기, 에세이, 미술, 음악, 글, 뉴스
- **MD 파일 기반**: Git으로 버전 관리 가능
- **자동 인덱싱**: 콘텐츠 추가 시 자동으로 목록화

### 2. LLM 통합
- **자동 메타데이터 생성**: OpenAI API를 통한 TLDR, 태그, 감정 분석
- **키워드 추출**: 콘텐츠 분석을 통한 키워드 자동 생성
- **API 엔드포인트**: `/api/llm/generate-meta`

### 3. 검색 및 필터링
- **내용 기반 검색**: 제목, 본문, 태그 검색
- **다중 태그 필터링**: 여러 태그 동시 선택
- **타입별 필터링**: 콘텐츠 타입별 필터
- **실시간 검색**: 클라이언트 사이드 즉시 검색

### 4. 미디어 플레이어
- **음악 플레이어**: YouTube 통합 재생
- **액자 모드**: 이미지/비디오 갤러리 뷰
- **반응형 디자인**: 모바일/데스크톱 지원

### 5. 대시보드 및 통계
- **타입별 통계**: 콘텐츠 타입별 개수 및 비율
- **인기 태그**: 가장 많이 사용된 태그 표시
- **최근 활동**: 최근 7일간 추가된 콘텐츠

## 📁 프로젝트 구조

```
digital-assets-platform/
├── content/                    # 콘텐츠 MD 파일들
│   ├── diary/                 # 일기
│   ├── essay/                 # 에세이
│   ├── art/                   # 미술
│   ├── music/                 # 음악
│   ├── article/               # 글
│   └── news/                  # 뉴스
├── src/
│   ├── app/                   # Next.js App Router
│   │   ├── (main)/           # 메인 레이아웃
│   │   │   ├── page.tsx      # 홈
│   │   │   ├── dashboard/    # 대시보드
│   │   │   ├── [type]/       # 타입별 목록
│   │   │   ├── search/       # 검색
│   │   │   └── tags/         # 태그
│   │   ├── content/          # 콘텐츠 상세
│   │   └── api/              # API Routes
│   ├── components/           # React 컴포넌트
│   │   ├── media/           # 미디어 플레이어
│   │   └── layout/          # 레이아웃 컴포넌트
│   ├── lib/                  # 유틸리티
│   └── types/                # TypeScript 타입
└── scripts/                  # 빌드 스크립트
```

## 🚀 시작하기

### 1. 설치
```bash
npm install
```

### 2. 환경 변수 설정
`.env.local` 파일 생성:
```
OPENAI_API_KEY=your_api_key_here
```

### 3. 개발 서버 실행
```bash
npm run dev
```

### 4. 콘텐츠 추가
`content/[type]/YYYY-MM-DD-slug.md` 형식으로 파일 생성

예시: `content/diary/2024-01-15-my-diary.md`

## 📝 MD 파일 형식

```markdown
---
type: diary | essay | art | music | article | news
title: 제목
date: 2024-01-15
tags: [태그1, 태그2]
source: 원본 링크 (선택)
media:
  - type: youtube | image | video
    url: 미디어 URL
tldr: 요약 (LLM이 자동 생성)
meta:
  generated: 2024-01-15T10:30:00Z
  llm_model: gpt-4
  sentiment: positive | neutral | negative
  keywords: [키워드1, 키워드2]
---

본문 내용...
```

## 🔧 주요 스크립트

- `npm run dev` - 개발 서버 실행
- `npm run build` - 프로덕션 빌드
- `npm run export` - 정적 사이트 Export
- `npm run generate-index` - 검색 인덱스 생성
- `npm run process-content [type] [slug]` - LLM으로 메타데이터 생성

## 🌐 배포

### GitHub Pages
```bash
npm run export
# out 폴더를 gh-pages 브랜치에 배포
```

### Vercel (API Routes 사용 시)
- GitHub 저장소 연결
- 자동 배포

## 📊 기술 스택

- **프레임워크**: Next.js 14 (App Router)
- **언어**: TypeScript
- **스타일**: Tailwind CSS
- **마크다운**: remark
- **LLM**: OpenAI API
- **검색**: 클라이언트 사이드 검색

## 🎨 주요 페이지

1. **홈** (`/`) - 최근 콘텐츠 및 타입별 요약
2. **대시보드** (`/dashboard`) - 통계 및 분석
3. **타입별 목록** (`/[type]`) - 일기, 에세이, 미술 등
4. **콘텐츠 상세** (`/content/[type]/[slug]`) - 개별 콘텐츠 보기
5. **검색** (`/search`) - 통합 검색 및 필터링
6. **태그** (`/tags`) - 태그별 콘텐츠 모음

## 🔮 향후 계획

- [ ] 고급 검색 (Lunr.js 통합)
- [ ] 타임라인 뷰
- [ ] 보고서 생성 기능
- [ ] 다크 모드 지원 강화
- [ ] 이미지 최적화
- [ ] RSS 피드 생성
- [ ] 백업/복원 기능

## 📄 라이선스

MIT
