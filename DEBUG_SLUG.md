# Slug 디버깅 가이드

## 문제
한글과 언더스코어가 포함된 파일명(`2025_그런일은_웬디.md`)에서 404 에러 발생

## 해결 방법

### 1. generateStaticParams() 수정
- 원본 slug를 반환 (인코딩하지 않음)
- Next.js가 자동으로 URL 인코딩 처리

### 2. 링크 생성 시
- `encodeURIComponent(content.slug)` 사용하여 URL 인코딩

### 3. 페이지에서 받은 params
- Next.js 14에서는 자동으로 디코딩됨
- 안전을 위해 디코딩 시도 후 실패하면 원본 사용

## 테스트 방법

1. 빌드:
```bash
npm run build
```

2. 생성된 파일 확인:
```bash
# out 폴더에서 확인
dir out\content\music
```

3. 서버 실행:
```bash
npm run serve
```

4. 브라우저에서 확인:
- http://localhost:3000/music/
- 노래 클릭하여 상세 페이지 확인

## 예상되는 파일 구조

```
out/
  content/
    music/
      2025_그런일은_웬디/
        index.html
      2025_성인식_박지윤/
        index.html
```

## 문제가 계속되면

1. 브라우저 개발자 도구에서 실제 요청 URL 확인
2. `out` 폴더의 실제 파일 구조 확인
3. 콘솔에서 에러 메시지 확인
