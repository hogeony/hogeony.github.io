import { getAllContentTypes, getContentByType } from '@/lib/content-server';
import { ContentType } from '@/types/content';
import Link from 'next/link';
import { safeFormatDate } from '@/lib/date-utils';

export default function HomePage() {
  const types = getAllContentTypes();
  
  const recentContent = types
    .flatMap((type) => {
      const contents = getContentByType(type);
      return contents.slice(0, 5).map((content) => ({
        ...content,
        type,
      }));
    })
    .sort((a, b) => {
      const dateA = a.frontMatter.date ? new Date(a.frontMatter.date).getTime() : 0;
      const dateB = b.frontMatter.date ? new Date(b.frontMatter.date).getTime() : 0;
      return dateB - dateA;
    })
    .slice(0, 10);

  const typeLabels: Record<ContentType, string> = {
    diary: '일기',
    essay: '에세이',
    art: '미술',
    music: '음악',
    article: '글',
    news: '뉴스',
  };

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">디지털 자산 관리 플랫폼</h1>
        <p className="text-gray-600 dark:text-gray-400">
          개인 콘텐츠를 체계적으로 관리하고 통찰을 도출합니다
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {types.map((type) => {
          const contents = getContentByType(type);
          return (
            <Link
              key={type}
              href={`/${type}`}
              className="block p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-shadow"
            >
              <h2 className="text-2xl font-semibold mb-2">{typeLabels[type]}</h2>
              <p className="text-gray-600 dark:text-gray-400">
                {contents.length}개의 항목
              </p>
            </Link>
          );
        })}
      </div>

      <div>
        <h2 className="text-2xl font-semibold mb-4">최근 콘텐츠</h2>
        <div className="space-y-4">
          {recentContent.map((item) => (
            <Link
              key={`${item.type}-${item.slug}`}
              href={`/content/${item.type}/${encodeURIComponent(item.slug)}`}
              className="block p-4 bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-shadow"
            >
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-sm text-primary-600 font-medium">
                    {typeLabels[item.type]}
                  </span>
                  <h3 className="text-lg font-semibold mt-1">
                    {item.frontMatter.title}
                  </h3>
                  {item.frontMatter.tldr && (
                    <p className="text-gray-600 dark:text-gray-400 text-sm mt-2 line-clamp-2">
                      {item.frontMatter.tldr}
                    </p>
                  )}
                </div>
                <span className="text-sm text-gray-500 ml-4">
                  {safeFormatDate(item.frontMatter.date, 'yyyy-MM-dd')}
                </span>
              </div>
              {item.frontMatter.tags && item.frontMatter.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {item.frontMatter.tags.slice(0, 3).map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-xs"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
