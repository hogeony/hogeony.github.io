import fs from 'fs';
import path from 'path';
import { getAllContent } from '../src/lib/content';

const dataDirectory = path.join(process.cwd(), 'data');

// data 디렉토리가 없으면 생성
if (!fs.existsSync(dataDirectory)) {
  fs.mkdirSync(dataDirectory, { recursive: true });
}

// 콘텐츠 인덱스 생성
const index = getAllContent();
const indexPath = path.join(dataDirectory, 'index.json');
fs.writeFileSync(indexPath, JSON.stringify(index, null, 2));

console.log(`✅ Content index generated: ${indexPath}`);

// 검색 인덱스 생성 (간단한 버전)
const searchIndex = Object.values(index).flatMap((typeContent) =>
  Object.values(typeContent).map((content) => ({
    slug: content.slug,
    type: content.type,
    title: content.frontMatter.title,
    content: content.content.substring(0, 500), // 처음 500자만
    tags: content.frontMatter.tags || [],
    date: content.frontMatter.date,
  }))
);

const searchIndexPath = path.join(dataDirectory, 'search-index.json');
fs.writeFileSync(searchIndexPath, JSON.stringify(searchIndex, null, 2));

console.log(`✅ Search index generated: ${searchIndexPath}`);
console.log(`📊 Total items: ${searchIndex.length}`);
