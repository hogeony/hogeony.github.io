import { getAllContentTypes, getContentByType } from '@/lib/content-server';
import { ContentType } from '@/types/content';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { safeFormatDate } from '@/lib/date-utils';

const typeLabels: Record<ContentType, string> = {
  diary: '일기',
  essay: '에세이',
  art: '미술',
  music: '음악',
  article: '글',
  news: '뉴스',
};

export function generateStaticParams() {
  // music은 별도의 페이지가 있으므로 제외
  return getAllContentTypes()
    .filter((type) => type !== 'music')
    .map((type) => ({
      type: type,
    }));
}

export default function TypePage({
  params,
}: {
  params: { type: string };
}) {
  const type = params.type as ContentType;
  
  // music은 별도의 페이지가 있으므로 404 반환
  if (type === 'music' || !getAllContentTypes().includes(type)) {
    notFound();
  }

  const contents = getContentByType(type);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">{typeLabels[type]}</h1>
        <p className="text-gray-600 dark:text-gray-400">
          총 {contents.length}개의 항목
        </p>
      </div>

      {contents.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500">아직 콘텐츠가 없습니다.</p>
          <p className="text-sm text-gray-400 mt-2">
            {`content/${type}/`} 폴더에 MD 파일을 추가하세요.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {contents.map((content) => (
            <Link
              key={content.slug}
              href={`/content/${type}/${encodeURIComponent(content.slug)}`}
              className="block p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-shadow"
            >
              <h2 className="text-xl font-semibold mb-2">
                {content.frontMatter.title}
              </h2>
              <p className="text-sm text-gray-500 mb-3">
                {safeFormatDate(content.frontMatter.date, 'yyyy년 MM월 dd일')}
              </p>
              {content.frontMatter.tldr && (
                <p className="text-gray-600 dark:text-gray-400 text-sm line-clamp-3">
                  {content.frontMatter.tldr}
                </p>
              )}
              {content.frontMatter.tags && content.frontMatter.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-4">
                  {content.frontMatter.tags.slice(0, 5).map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-1 bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300 rounded text-xs"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
