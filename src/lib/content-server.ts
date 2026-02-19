// 서버 사이드 전용 함수들 (fs 모듈 사용)
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { remark } from 'remark';
import html from 'remark-html';
import { Content, ContentType, ContentIndex } from '@/types/content';

const contentDirectory = path.join(process.cwd(), 'content');

export function getAllContentTypes(): ContentType[] {
  return ['diary', 'essay', 'art', 'music', 'article', 'news'];
}

export function getContentByType(type: ContentType): Content[] {
  const typeDirectory = path.join(contentDirectory, type);
  
  if (!fs.existsSync(typeDirectory)) {
    return [];
  }

  const fileNames = fs.readdirSync(typeDirectory);
  const allContent = fileNames
    .filter((name) => {
      // .md 파일만 선택하고, template 파일은 제외
      if (!name.endsWith('.md')) return false;
      const slug = name.replace(/\.md$/, '');
      // template 파일 제외
      if (slug === 'template' || slug.includes('template')) return false;
      return true;
    })
    .map((fileName) => {
      // 파일명을 그대로 slug로 사용 (공백, 특수문자 포함)
      const slug = fileName.replace(/\.md$/, '');
      return getContentBySlug(type, slug);
    })
    .filter((content): content is Content => content !== null)
    .sort((a, b) => {
      const dateA = new Date(a.frontMatter.date).getTime();
      const dateB = new Date(b.frontMatter.date).getTime();
      return dateB - dateA; // 최신순
    });

  return allContent;
}

export function getContentBySlug(type: ContentType, slug: string): Content | null {
  const typeDirectory = path.join(contentDirectory, type);
  
  if (!fs.existsSync(typeDirectory)) {
    return null;
  }

  // 디렉토리의 모든 파일을 확인하여 매칭 시도
  // (공백, 특수문자 등으로 인한 파일명 불일치 문제 해결)
  const fileNames = fs.readdirSync(typeDirectory);
  
  // slug 정규화: URL 인코딩된 문자들을 디코딩하고 공백 정규화
  let normalizedSlug = slug;
  try {
    // 이미 디코딩된 경우를 대비해 try-catch
    normalizedSlug = decodeURIComponent(slug);
  } catch {
    // 디코딩 실패 시 원본 사용
    normalizedSlug = slug;
  }
  
  // 디버깅을 위한 로그 (개발 환경에서만)
  if (process.env.NODE_ENV === 'development') {
    console.log(`getContentBySlug - type: ${type}, slug: ${slug}, normalized: ${normalizedSlug}`);
    console.log(`Available files: ${fileNames.filter(f => f.endsWith('.md')).join(', ')}`);
  }
  
  // 파일명에서 slug 추출하여 비교
  const matchingFile = fileNames.find((fileName) => {
    if (!fileName.endsWith('.md')) return false;
    const fileSlug = fileName.replace(/\.md$/, '');
    
    // 여러 방식으로 비교 시도
    // 1. 정확히 일치
    if (fileSlug === slug || fileSlug === normalizedSlug) {
      return true;
    }
    
    // 2. 공백 정규화 비교 (%20 -> 공백, + -> 공백)
    const slugWithSpaces = slug.replace(/%20/g, ' ').replace(/\+/g, ' ');
    const normalizedSlugWithSpaces = normalizedSlug.replace(/%20/g, ' ').replace(/\+/g, ' ');
    if (fileSlug === slugWithSpaces || fileSlug === normalizedSlugWithSpaces) {
      return true;
    }
    
    // 3. 양쪽 모두 공백을 제거하고 비교 (최후의 수단)
    const fileSlugNoSpaces = fileSlug.replace(/\s+/g, '');
    const slugNoSpaces = slug.replace(/\s+/g, '').replace(/%20/g, '').replace(/\+/g, '');
    const normalizedSlugNoSpaces = normalizedSlug.replace(/\s+/g, '').replace(/%20/g, '').replace(/\+/g, '');
    if (fileSlugNoSpaces === slugNoSpaces || fileSlugNoSpaces === normalizedSlugNoSpaces) {
      return true;
    }
    
    return false;
  });
  
  if (!matchingFile) {
    if (process.env.NODE_ENV === 'development') {
      console.error(`getContentBySlug - No matching file found for slug: ${slug}`);
    }
    return null;
  }

  const fullPath = path.join(typeDirectory, matchingFile);

  try {
    const fileContents = fs.readFileSync(fullPath, 'utf8');
    const { data, content } = matter(fileContents);
    
    // 실제 파일명에서 slug 추출
    const actualSlug = matchingFile.replace(/\.md$/, '');

    return {
      slug: actualSlug, // 실제 파일명 기반 slug 사용
      type,
      frontMatter: data as any,
      content,
    };
  } catch (error) {
    console.error(`Error reading content file ${fullPath}:`, error);
    return null;
  }
}

export async function getContentWithHtml(type: ContentType, slug: string): Promise<Content | null> {
  const content = getContentBySlug(type, slug);
  
  if (!content) {
    return null;
  }

  const processedContent = await remark().use(html).process(content.content);
  const htmlContent = processedContent.toString();

  return {
    ...content,
    html: htmlContent,
  };
}

export function getAllContent(): ContentIndex {
  const types = getAllContentTypes();
  const index: ContentIndex = {};

  types.forEach((type) => {
    index[type] = {};
    const contents = getContentByType(type);
    contents.forEach((content) => {
      index[type][content.slug] = content;
    });
  });

  return index;
}

export function getAllTags(): string[] {
  const allContent = Object.values(getAllContent()).flatMap((typeContent) =>
    Object.values(typeContent)
  );

  const tagSet = new Set<string>();
  allContent.forEach((content) => {
    if (Array.isArray(content.frontMatter.tags)) {
      content.frontMatter.tags.forEach((tag) => tagSet.add(tag));
    }
  });

  return Array.from(tagSet).sort();
}

export function getContentByTag(tag: string): Content[] {
  const allContent = Object.values(getAllContent()).flatMap((typeContent) =>
    Object.values(typeContent)
  );

  return allContent.filter((content) =>
    Array.isArray(content.frontMatter.tags) &&
    content.frontMatter.tags.includes(tag)
  );
}
