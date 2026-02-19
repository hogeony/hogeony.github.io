import { getContentByTag, getAllTags } from '@/lib/content-server';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { safeFormatDate } from '@/lib/date-utils';

const typeLabels: Record<string, string> = {
  diary: '일기',
  essay: '에세이',
  art: '미술',
  music: '음악',
  article: '글',
  news: '뉴스',
};

export function generateStaticParams() {
  const tags = getAllTags();
  return tags
    .filter((tag) => {
      // URL 경로로 사용할 수 없는 문자 제외 (슬래시 등)
      return !tag.includes('/') && !tag.includes('\\');
    })
    .map((tag) => ({
      // Next.js가 자동으로 URL 인코딩 처리하므로 원본 tag 사용
      tag: tag,
    }));
}

export default function TagPage({
  params,
}: {
  params: { tag: string };
}) {
  // Next.js 14에서는 params가 자동으로 디코딩됨
  // 하지만 안전을 위해 디코딩 시도
  let tag = params.tag;
  try {
    tag = decodeURIComponent(params.tag);
  } catch (e) {
    // 이미 디코딩된 경우 그대로 사용
    tag = params.tag;
  }
  
  const contents = getContentByTag(tag);

  if (contents.length === 0) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div>
        <Link href="/tags" className="text-primary-600 hover:text-primary-800 text-sm">
          ← 태그 목록으로
        </Link>
        <h1 className="text-3xl font-bold mt-4">#{tag}</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          {contents.length}개의 항목
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {contents.map((content) => (
          <Link
            key={`${content.type}-${content.slug}`}
            href={`/content/${content.type}/${encodeURIComponent(content.slug)}`}
            className="block p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-shadow"
          >
            <span className="text-sm text-primary-600 font-medium">
              {typeLabels[content.type]}
            </span>
            <h2 className="text-xl font-semibold mt-1 mb-2">
              {content.frontMatter.title}
            </h2>
            <p className="text-sm text-gray-500">
              {safeFormatDate(content.frontMatter.date, 'yyyy년 MM월 dd일')}
            </p>
            {content.frontMatter.tldr && (
              <p className="text-gray-600 dark:text-gray-400 text-sm mt-3 line-clamp-2">
                {content.frontMatter.tldr}
              </p>
            )}
          </Link>
        ))}
      </div>
    </div>
  );
}
