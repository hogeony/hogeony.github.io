# 로컬에서 빌드 결과 확인하기

## 방법 1: 정적 파일 서버 (권장)

정적 export 모드에서는 `next start`가 작동하지 않습니다. `serve` 패키지를 사용하세요:

```bash
npm run preview
```

또는

```bash
npm run dev:build
```

또는

```bash
npm run serve
```

브라우저에서 표시된 주소(보통 http://localhost:3000)를 열어 확인하세요.

## 방법 2: 정적 파일 서버 (정적 export 사용 시)

정적 export를 사용하는 경우 (`output: 'export'`), `out` 폴더가 생성됩니다.

### serve 패키지 사용 (권장)

```bash
npm run serve
```

또는 직접:

```bash
npx serve out
```

### Python 사용

```bash
cd out
python -m http.server 8000
```

브라우저에서 [http://localhost:8000](http://localhost:8000)을 열어 확인하세요.

### Node.js http-server 사용

```bash
npx http-server out -p 8000
```

## 방법 3: 개발 모드 (빌드 없이)

빌드 없이 바로 개발 서버 실행:

```bash
npm run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000)을 열어 확인하세요.

## 스크립트 요약

- `npm run dev` - 개발 모드 (빌드 없이, 핫 리로드)
- `npm run build` - 프로덕션 빌드만 수행
- `npm run preview` - 빌드 후 프로덕션 서버 실행
- `npm run dev:build` - 빌드 후 프로덕션 서버 실행 (preview와 동일)
- `npm run serve` - 정적 파일 서버 실행 (out 폴더)

## 참고

- 정적 export를 사용하는 경우 (`next.config.js`의 `output: 'export'`), `out` 폴더가 생성됩니다.
- 프로덕션 서버를 사용하는 경우, API Routes도 사용할 수 있습니다.
- 정적 파일 서버를 사용하는 경우, API Routes는 사용할 수 없습니다.
