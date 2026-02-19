# 배포 가이드

## GitHub Pages 배포

### 방법 1: 정적 Export (권장)

1. **빌드 및 Export**
   ```bash
   npm run build
   npm run export
   ```

2. **GitHub Pages 설정**
   - GitHub 저장소의 Settings > Pages로 이동
   - Source를 "Deploy from a branch"로 설정
   - Branch를 `gh-pages`로 설정
   - Folder를 `/ (root)`로 설정

3. **gh-pages 브랜치에 배포**
   ```bash
   git checkout --orphan gh-pages
   git rm -rf .
   cp -r out/* .
   git add .
   git commit -m "Deploy to GitHub Pages"
   git push origin gh-pages
   ```

### 방법 2: GitHub Actions 자동 배포

`.github/workflows/deploy.yml` 파일을 생성:

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Build
        run: npm run build
      
      - name: Export
        run: npm run export
      
      - name: Deploy to GitHub Pages
        uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./out
```

## Vercel 배포 (API Routes 사용 시)

1. **Vercel 계정 생성**
   - [vercel.com](https://vercel.com)에서 계정 생성

2. **프로젝트 Import**
   - GitHub 저장소를 Vercel에 연결
   - 자동으로 배포됨

3. **환경 변수 설정**
   - Vercel 대시보드에서 환경 변수 추가
   - `OPENAI_API_KEY` 설정

## 로컬 개발

```bash
npm install
npm run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000)을 열어 확인하세요.

## 주의사항

- GitHub Pages는 정적 사이트만 지원하므로 API Routes는 사용할 수 없습니다.
- LLM 기능을 사용하려면 Vercel이나 다른 서버리스 플랫폼을 사용해야 합니다.
- 정적 Export 시 `next.config.js`의 `output: 'export'` 설정이 필요합니다.
