import { getContentByType } from '@/lib/content-server';
import ArtFrame from '@/components/media/ArtFrame';
import Link from 'next/link';
import { safeFormatDate } from '@/lib/date-utils';

export default function ArtPage() {
  const contents = getContentByType('art');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">미술</h1>
        <p className="text-gray-600 dark:text-gray-400">
          총 {contents.length}개의 작품
        </p>
      </div>

      {contents.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500">아직 작품이 없습니다.</p>
          <p className="text-sm text-gray-400 mt-2">
            content/art/ 폴더에 MD 파일을 추가하세요.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {contents.map((content) => {
            const imageMedia = content.frontMatter.media?.find(
              (m) => m.type === 'image'
            );
            return (
              <div
                key={content.slug}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
              >
                {imageMedia && (
                  <Link href={`/content/art/${encodeURIComponent(content.slug)}`}>
                    <ArtFrame media={imageMedia} />
                  </Link>
                )}
                <div className="p-6">
                  <Link
                    href={`/content/art/${encodeURIComponent(content.slug)}`}
                    className="block"
                  >
                    <h2 className="text-xl font-semibold mb-2 hover:text-primary-600">
                      {content.frontMatter.title}
                    </h2>
                  </Link>
                  {content.frontMatter.tags && content.frontMatter.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-3">
                      {content.frontMatter.tags.map((tag) => (
                        <Link
                          key={tag}
                          href={`/tags/${encodeURIComponent(tag)}`}
                          className="px-2 py-1 bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300 rounded text-xs hover:bg-primary-200"
                        >
                          {tag}
                        </Link>
                      ))}
                    </div>
                  )}
                  <p className="text-sm text-gray-500 mt-3">
                    {safeFormatDate(content.frontMatter.date, 'yyyy-MM-dd')}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
