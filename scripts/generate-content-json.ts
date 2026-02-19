import fs from 'fs';
import path from 'path';
import { getAllContent, getAllTags } from '../src/lib/content-server';

const publicDirectory = path.join(process.cwd(), 'public');

// public 디렉토리가 없으면 생성
if (!fs.existsSync(publicDirectory)) {
  fs.mkdirSync(publicDirectory, { recursive: true });
}

// 콘텐츠 데이터 생성
const index = getAllContent();
const tags = getAllTags();

const contentData = {
  index,
  tags,
};

// JSON 파일로 저장
const jsonPath = path.join(publicDirectory, 'content-data.json');
fs.writeFileSync(jsonPath, JSON.stringify(contentData, null, 2));

console.log(`✅ Content data generated: ${jsonPath}`);
console.log(`📊 Total content items: ${Object.values(index).reduce((sum, typeContent) => sum + Object.keys(typeContent).length, 0)}`);
console.log(`🏷️  Total tags: ${tags.length}`);
