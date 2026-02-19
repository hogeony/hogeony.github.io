# 설정 가이드

## 초기 설정

### 1. 의존성 설치

```bash
npm install
```

### 2. 환경 변수 설정

`.env.local` 파일을 생성하고 OpenAI API 키를 추가하세요:

```
OPENAI_API_KEY=your_openai_api_key_here
```

### 3. 개발 서버 실행

```bash
npm run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000)을 열어 확인하세요.

## 콘텐츠 추가 방법

### MD 파일 생성

각 타입 폴더(`content/diary`, `content/essay` 등)에 MD 파일을 생성하세요.

파일명 형식: `YYYY-MM-DD-slug.md`

예시: `content/diary/2024-01-15-my-diary.md`

### Front Matter 형식

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
    thumbnail: 썸네일 (선택)
tldr: 요약 (LLM이 자동 생성)
meta:
  generated: 2024-01-15T10:30:00Z
  llm_model: gpt-4
  sentiment: positive | neutral | negative
  keywords: [키워드1, 키워드2]
---

본문 내용...
```

## LLM 통합 (선택사항)

LLM을 사용하여 자동으로 메타데이터를 생성하려면:

1. OpenAI API 키 설정
2. 콘텐츠 추가 후 API 엔드포인트 호출
3. 생성된 메타데이터를 MD 파일에 추가

## GitHub Pages 배포

### 정적 Export

```bash
npm run export
```

`out` 폴더가 생성됩니다. 이 폴더의 내용을 GitHub Pages에 배포하세요.

### GitHub Actions 사용 (권장)

`.github/workflows/deploy.yml` 파일을 생성하여 자동 배포를 설정할 수 있습니다.

## 다음 단계

1. 샘플 콘텐츠 추가
2. 검색 기능 테스트
3. 미디어 플레이어 테스트
4. LLM 통합 테스트
