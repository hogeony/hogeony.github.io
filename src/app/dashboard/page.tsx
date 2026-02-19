import { getAllContentTypes, getContentByType, getAllTags } from '@/lib/content-server';
import { ContentType } from '@/types/content';
import Link from 'next/link';
import { safeFormatDate } from '@/lib/date-utils';
import { format, subDays } from 'date-fns';
import { ko } from 'date-fns/locale';
import { isValidDate } from '@/lib/date-utils';

const typeLabels: Record<ContentType, string> = {
  diary: '일기',
  essay: '에세이',
  art: '미술',
  music: '음악',
  article: '글',
  news: '뉴스',
};

export default function DashboardPage() {
  const types = getAllContentTypes();
  const allTags = getAllTags();

  // 타입별 통계
  const typeStats = types.map((type) => {
    const contents = getContentByType(type);
    return {
      type,
      label: typeLabels[type],
      count: contents.length,
    };
  });

  // 최근 7일간 추가된 콘텐츠
  const sevenDaysAgo = subDays(new Date(), 7);
  const recentContents = types
    .flatMap((type) => {
      const contents = getContentByType(type);
      return contents
        .filter((content) => {
          if (!isValidDate(content.frontMatter.date)) {
            return false;
          }
          const contentDate = new Date(content.frontMatter.date);
          return contentDate >= sevenDaysAgo;
        })
        .map((content) => ({
          ...content,
          type,
        }));
    })
    .sort((a, b) => {
      const dateA = new Date(a.frontMatter.date).getTime();
      const dateB = new Date(b.frontMatter.date).getTime();
      return dateB - dateA;
    })
    .slice(0, 10);

  // 태그별 통계 (상위 10개)
  const tagStats = allTags
    .map((tag) => {
      const contents = getContentByType('diary')
        .concat(getContentByType('essay'))
        .concat(getContentByType('art'))
        .concat(getContentByType('music'))
        .concat(getContentByType('article'))
        .concat(getContentByType('news'))
        .filter((content) =>
          content.frontMatter.tags?.includes(tag)
        );
      return {
        tag,
        count: contents.length,
      };
    })
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  const totalContent = typeStats.reduce((sum, stat) => sum + stat.count, 0);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">대시보드</h1>
        <p className="text-gray-600 dark:text-gray-400">
          전체 통계 및 최근 활동
        </p>
      </div>

      {/* 전체 통계 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
          <h3 className="text-sm text-gray-600 dark:text-gray-400 mb-1">
            전체 콘텐츠
          </h3>
          <p className="text-3xl font-bold">{totalContent}</p>
        </div>
        {typeStats.map((stat) => (
          <Link
            key={stat.type}
            href={`/${stat.type}`}
            className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow"
          >
            <h3 className="text-sm text-gray-600 dark:text-gray-400 mb-1">
              {stat.label}
            </h3>
            <p className="text-3xl font-bold">{stat.count}</p>
          </Link>
        ))}
      </div>

      {/* 타입별 상세 통계 */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">타입별 통계</h2>
        <div className="space-y-3">
          {typeStats.map((stat) => {
            const percentage =
              totalContent > 0 ? (stat.count / totalContent) * 100 : 0;
            return (
              <div key={stat.type}>
                <div className="flex justify-between mb-1">
                  <span className="font-medium">{stat.label}</span>
                  <span className="text-gray-600 dark:text-gray-400">
                    {stat.count} ({percentage.toFixed(1)}%)
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-primary-600 h-2 rounded-full transition-all"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 인기 태그 */}
      {tagStats.length > 0 && (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">인기 태그</h2>
          <div className="flex flex-wrap gap-3">
            {tagStats.map((stat) => (
              <Link
                key={stat.tag}
                href={`/tags/${encodeURIComponent(stat.tag)}`}
                className="px-4 py-2 bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300 rounded-full hover:bg-primary-200 dark:hover:bg-primary-800 transition-colors"
              >
                #{stat.tag} ({stat.count})
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* 최근 콘텐츠 */}
      {recentContents.length > 0 && (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">최근 7일간 추가</h2>
          <div className="space-y-3">
            {recentContents.map((content) => (
              <Link
                key={`${content.type}-${content.slug}`}
                href={`/content/${content.type}/${encodeURIComponent(content.slug)}`}
                className="block p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-sm text-primary-600 font-medium">
                      {typeLabels[content.type]}
                    </span>
                    <h3 className="font-semibold mt-1">
                      {content.frontMatter.title}
                    </h3>
                  </div>
                  <span className="text-sm text-gray-500">
                    {safeFormatDate(content.frontMatter.date, 'MM/dd')}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
