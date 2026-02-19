import { getAllTags, getContentByTag } from '@/lib/content-server';
import Link from 'next/link';
import { Content } from '@/types/content';

const typeLabels: Record<string, string> = {
  diary: '일기',
  essay: '에세이',
  art: '미술',
  music: '음악',
  article: '글',
  news: '뉴스',
};

export default function TagsPage() {
  const tags = getAllTags();

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">태그</h1>

      {tags.length === 0 ? (
        <p className="text-gray-500">태그가 없습니다.</p>
      ) : (
        <div className="space-y-6">
          {tags.map((tag) => {
            const contents = getContentByTag(tag);
            return (
              <div key={tag} className="border-b border-gray-200 dark:border-gray-700 pb-6">
                <Link
                  href={`/tags/${encodeURIComponent(tag)}`}
                  className="text-2xl font-semibold text-primary-600 hover:text-primary-800"
                >
                  #{tag}
                </Link>
                <p className="text-gray-600 dark:text-gray-400 mt-1 mb-4">
                  {contents.length}개의 항목
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {contents.slice(0, 6).map((content) => (
                    <Link
                      key={`${content.type}-${content.slug}`}
                      href={`/content/${content.type}/${encodeURIComponent(content.slug)}`}
                      className="block p-4 bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-shadow"
                    >
                      <span className="text-sm text-primary-600 font-medium">
                        {typeLabels[content.type]}
                      </span>
                      <h3 className="text-lg font-semibold mt-1">
                        {content.frontMatter.title}
                      </h3>
                    </Link>
                  ))}
                </div>
                {contents.length > 6 && (
                  <Link
                    href={`/tags/${encodeURIComponent(tag)}`}
                    className="text-primary-600 hover:text-primary-800 text-sm mt-4 inline-block"
                  >
                    더보기 ({contents.length - 6}개)
                  </Link>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
