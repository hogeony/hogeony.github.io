import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import SlideViewer from '@/components/lecture/SlideViewer';

function getLectureBySlug(slug: string) {
  const lectureDirectory = path.join(process.cwd(), 'content', 'lecture');
  
  if (!fs.existsSync(lectureDirectory)) {
    return null;
  }

  const fileNames = fs.readdirSync(lectureDirectory);
  const matchingFile = fileNames.find((fileName) => {
    const fileSlug = fileName.replace(/\.md$/, '');
    return fileSlug === slug || decodeURIComponent(fileSlug) === slug;
  });

  if (!matchingFile) {
    return null;
  }

  const fullPath = path.join(lectureDirectory, matchingFile);
  const fileContents = fs.readFileSync(fullPath, 'utf8');
  const { data, content } = matter(fileContents);

  // frontmatter를 제거한 순수 콘텐츠
  const trimmedContent = content.trim();
  
  // 서버 측에서 슬라이드 개수 확인 (디버깅용)
  if (process.env.NODE_ENV === 'development') {
    const slideCount = trimmedContent.split(/\n---\n/).length;
    console.log(`[Server] 강의 "${data.title || slug}" 슬라이드 개수: ${slideCount}`);
  }

  return {
    slug,
    title: data.title || slug,
    date: data.date || new Date().toISOString(),
    tags: data.tags || [],
    description: data.description || '',
    content: trimmedContent, // 앞뒤 공백 제거
  };
}

export function generateStaticParams() {
  const lectureDirectory = path.join(process.cwd(), 'content', 'lecture');
  
  if (!fs.existsSync(lectureDirectory)) {
    return [];
  }

  const fileNames = fs.readdirSync(lectureDirectory);
  return fileNames
    .filter((name) => name.endsWith('.md'))
    .map((fileName) => ({
      slug: fileName.replace(/\.md$/, ''),
    }));
}

export default function LectureDetailPage({
  params,
}: {
  params: { slug: string };
}) {
  let slug = params.slug;
  
  try {
    slug = decodeURIComponent(params.slug);
  } catch {
    slug = params.slug;
  }

  const lecture = getLectureBySlug(slug);

  if (!lecture) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Link
          href="/lecture"
          className="text-primary-600 hover:text-primary-700 dark:text-primary-400 flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          인생학교로 돌아가기
        </Link>
      </div>

      <div className="text-center mb-6">
        <h1 className="text-3xl font-bold mb-2">{lecture.title}</h1>
        {lecture.description && (
          <p className="text-gray-600 dark:text-gray-400">{lecture.description}</p>
        )}
      </div>

      <SlideViewer content={lecture.content} />
    </div>
  );
}
