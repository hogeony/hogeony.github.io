# 디지털 자산 관리 플랫폼

개인 디지털 자산을 체계적으로 관리하고, LLM을 활용한 자동화된 메타데이터 생성 및 통찰 도출 플랫폼

## 기능

- 📝 **다양한 콘텐츠 타입**: 일기, 에세이, 미술, 음악, 글, 뉴스
- 🤖 **LLM 자동화**: 메타데이터 및 TLDR 자동 생성
- 🔍 **강력한 검색**: 내용 기반 검색 및 다중 태그 필터링
- 🎵 **미디어 플레이어**: 음악 재생 및 액자 모드 갤러리
- 📊 **통찰 대시보드**: 태그 클라우드, 타임라인, 통계

## 시작하기

### 설치

```bash
npm install
```

### 개발 서버 실행

```bash
npm run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000)을 열어 확인하세요.

### 빌드

```bash
npm run build
```

### GitHub Pages 배포

```bash
npm run export
```

생성된 `out` 폴더를 GitHub Pages에 배포하세요.

## 프로젝트 구조

```
content/          # 콘텐츠 MD 파일들
src/
  app/           # Next.js App Router
  components/    # React 컴포넌트
  lib/           # 유틸리티 함수
  types/         # TypeScript 타입
```

## 콘텐츠 추가

`content/` 폴더의 해당 타입 폴더에 MD 파일을 추가하세요.

예시: `content/diary/2024-01-15-my-diary.md`

## 환경 변수

`.env.local` 파일을 생성하고 OpenAI API 키를 추가하세요:

```
OPENAI_API_KEY=your_api_key_here
```

## 라이선스

MIT
