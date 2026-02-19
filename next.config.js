/** @type {import('next').NextConfig} */
const nextConfig = {
  // 개발 모드에서는 export 비활성화 (실시간 반영)
  // 프로덕션 빌드에서만 export 활성화
  ...(process.env.NODE_ENV === 'production' && { output: 'export' }),
  images: {
    unoptimized: true, // GitHub Pages는 이미지 최적화 미지원
  },
  trailingSlash: true,
  // GitHub Pages는 루트가 아닌 서브디렉토리에서 실행될 수 있으므로 basePath 설정
  // basePath: process.env.NODE_ENV === 'production' ? '/hogeony.github.io' : '',
  // assetPrefix: process.env.NODE_ENV === 'production' ? '/hogeony.github.io' : '',
  // API Routes는 정적 export 시 사용 불가
  // 빌드 시점에 JSON 파일 생성하여 사용
  // API Routes 폴더를 빌드에서 제외
  pageExtensions: ['ts', 'tsx', 'js', 'jsx', 'md', 'mdx'],
  // 파일명에 특수문자가 포함된 경우를 위한 설정
  generateBuildId: async () => {
    return 'build-' + Date.now();
  },
  // 개발 모드에서 파일 변경 감지 개선
  webpack: (config, { dev, isServer }) => {
    if (dev && !isServer) {
      // 클라이언트 사이드에서 파일 변경 감지
      config.watchOptions = {
        ...config.watchOptions,
        ignored: ['**/node_modules/**', '**/.git/**'],
        poll: 1000, // 1초마다 파일 변경 확인
      };
    }
    return config;
  },
}

module.exports = nextConfig
