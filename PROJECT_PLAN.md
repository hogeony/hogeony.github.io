# 디지털 자산 관리 플랫폼 - 프로젝트 계획

## 목표
개인 디지털 자산을 체계적으로 관리하고, LLM을 활용한 자동화된 메타데이터 생성 및 통찰 도출

## 핵심 기능

### 1. 콘텐츠 타입
- 일기 (diary)
- 에세이 (essay)
- 미술 (art)
- 음악 (music)
- 글 (article)
- 뉴스 (news)

### 2. 자동화 기능
- LLM을 통한 메타데이터 자동 생성
- TLDR(요약) 자동 생성
- 태그 자동 추출

### 3. 검색 및 필터링
- 내용 기반 검색
- 다중 태그 필터링
- 날짜 범위 필터링
- 타입별 그룹화

### 4. 미디어 플레이어
- 음악: YouTube 플레이어 + 플레이리스트
- 미술/영상: 액자 모드 (갤러리 뷰)

### 5. 통찰 및 분석
- 태그 클라우드
- 타임라인 뷰
- 통계 대시보드
- 보고서 생성

## 기술 스택

### 프론트엔드
- **Next.js 14** (App Router)
- **React 18**
- **TypeScript**
- **Tailwind CSS**
- **Framer Motion** (애니메이션)

### 백엔드/API
- **Next.js API Routes**
- **OpenAI API** (LLM 통합)
- **Markdown 파싱**: `gray-matter`, `remark`

### 검색
- **Lunr.js** (클라이언트 사이드 검색)
- 또는 **Algolia** (서버 사이드)

### 데이터 저장
- **MD 파일** (Git 기반)
- **JSON 인덱스 파일** (빠른 검색용)

### 배포
- **GitHub Pages** (정적 export)
- 또는 **Vercel** (API Routes 지원)

## 프로젝트 구조

```
digital-assets/
├── content/                    # 콘텐츠 MD 파일들
│   ├── diary/                 # 일기
│   ├── essay/                  # 에세이
│   ├── art/                    # 미술
│   ├── music/                  # 음악
│   ├── article/                # 글
│   └── news/                   # 뉴스
├── public/                     # 정적 파일
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── (main)/            # 메인 레이아웃
│   │   │   ├── page.tsx       # 홈 (대시보드)
│   │   │   ├── search/        # 검색 페이지
│   │   │   ├── tags/          # 태그 페이지
│   │   │   └── [type]/        # 타입별 목록
│   │   ├── content/           # 콘텐츠 상세
│   │   │   └── [type]/
│   │   │       └── [slug]/
│   │   └── api/               # API Routes
│   │       ├── llm/          # LLM 통합
│   │       ├── search/       # 검색 API
│   │       └── content/      # 콘텐츠 API
│   ├── components/            # React 컴포넌트
│   │   ├── media/            # 미디어 플레이어
│   │   │   ├── MusicPlayer.tsx
│   │   │   ├── ArtFrame.tsx
│   │   │   └── VideoFrame.tsx
│   │   ├── search/           # 검색 컴포넌트
│   │   ├── filters/           # 필터 컴포넌트
│   │   └── dashboard/        # 대시보드 컴포넌트
│   ├── lib/                   # 유틸리티
│   │   ├── content.ts        # 콘텐츠 로더
│   │   ├── search.ts         # 검색 로직
│   │   ├── llm.ts            # LLM 통합
│   │   └── tags.ts           # 태그 처리
│   └── types/                 # TypeScript 타입
├── scripts/                    # 빌드 스크립트
│   ├── generate-index.ts      # 검색 인덱스 생성
│   └── process-content.ts     # 콘텐츠 처리
└── data/                      # 생성된 데이터
    ├── index.json            # 콘텐츠 인덱스
    └── search-index.json     # 검색 인덱스
```

## MD 파일 형식

```markdown
---
type: diary | essay | art | music | article | news
title: 제목
date: 2024-01-15
tags: [태그1, 태그2, 태그3]
source: 원본 링크 (선택)
media:
  - type: youtube | image | video
    url: 미디어 URL
    thumbnail: 썸네일 (선택)
tldr: LLM이 생성한 요약
meta:
  generated: 2024-01-15T10:30:00Z
  llm_model: gpt-4
  sentiment: positive | neutral | negative
  keywords: [키워드1, 키워드2]
---

본문 내용...
```

## 구현 단계

### Phase 1: 기본 구조
1. Next.js 프로젝트 초기화
2. 기본 레이아웃 및 라우팅
3. MD 파일 파싱 및 표시

### Phase 2: 콘텐츠 관리
1. 콘텐츠 타입별 페이지
2. MD 파일 템플릿 생성
3. 콘텐츠 상세 페이지

### Phase 3: LLM 통합
1. OpenAI API 연동
2. 메타데이터 자동 생성
3. TLDR 생성

### Phase 4: 검색 및 필터링
1. 검색 기능 구현
2. 태그 필터링
3. 다중 필터 조합

### Phase 5: 미디어 플레이어
1. 음악 플레이어
2. 액자 모드 (갤러리)
3. 플레이리스트 기능

### Phase 6: 대시보드 및 분석
1. 통계 대시보드
2. 태그 클라우드
3. 타임라인 뷰
4. 보고서 생성
