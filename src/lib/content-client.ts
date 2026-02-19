// 클라이언트 사이드용 함수들 (JSON 데이터 사용)
import { Content, ContentType, ContentIndex } from '@/types/content';

interface ContentData {
  index: ContentIndex;
  tags: string[];
}

let cachedData: ContentData | null = null;

async function loadContentData(): Promise<ContentData> {
  if (cachedData) {
    return cachedData;
  }

  try {
    // 빌드 시 생성된 JSON 파일 사용
    const response = await fetch('/content-data.json');
    if (!response.ok) {
      throw new Error('Failed to load content data');
    }
    cachedData = await response.json() as ContentData;
    return cachedData;
  } catch (error) {
    console.error('Failed to load content data:', error);
    return { index: {}, tags: [] };
  }
}

export async function getAllContentTypes(): Promise<ContentType[]> {
  return ['diary', 'essay', 'art', 'music', 'article', 'news'];
}

export async function getAllContent(): Promise<ContentIndex> {
  const data = await loadContentData();
  return data.index || {};
}

export async function getAllTags(): Promise<string[]> {
  const data = await loadContentData();
  return data.tags || [];
}

export async function getContentByTag(tag: string): Promise<Content[]> {
  const index = await getAllContent();
  const allContent = Object.values(index).flatMap((typeContent: any) =>
    Object.values(typeContent) as Content[]
  ) as Content[];

  return allContent.filter((content: Content) =>
    Array.isArray(content.frontMatter.tags) &&
    content.frontMatter.tags.includes(tag)
  );
}
