import { getAllContentTypes, getContentBySlug, getContentByType } from '@/lib/content-server';
import { ContentType } from '@/types/content';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { safeFormatDate } from '@/lib/date-utils';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { remark } from 'remark';
import html from 'remark-html';
import MediaPlayer from '@/components/media/MediaPlayer';

const typeLabels: Record<ContentType, string> = {
  diary: '일기',
  essay: '에세이',
  art: '미술',
  music: '음악',
  article: '글',
  news: '뉴스',
};

export function generateStaticParams() {
  const params: { type: string; slug: string }[] = [];
  
  getAllContentTypes().forEach((type) => {
    const contents = getContentByType(type);
    contents.forEach((content) => {
      // template 파일은 제외
      if (content.slug === 'template' || content.slug.includes('template')) {
        return;
      }
      // generateStaticParams에서는 원본 slug를 반환
      // Next.js가 자동으로 URL 인코딩 처리함
      params.push({
        type: type,
        slug: content.slug, // 원본 slug 사용 (Next.js가 자동 인코딩)
      });
    });
  });
  
  return params;
}

export default async function ContentPage({
  params,
}: {
  params: Promise<{ type: string; slug: string }>;
}) {
  const resolvedParams = await params;
  const type = resolvedParams.type as ContentType;
  // Next.js 16에서는 params가 Promise로 변경됨
  // 하지만 공백이 포함된 경우 추가 처리 필요
  let slug = resolvedParams.slug;
  
  // 디버깅을 위한 로그 (개발 환경에서만)
  if (process.env.NODE_ENV === 'development') {
    console.log('ContentPage - Original slug:', resolvedParams.slug);
  }
  
  try {
    // 여러 번 인코딩된 경우를 대비해 반복 디코딩
    let decoded = resolvedParams.slug;
    let prevDecoded = '';
    let iterations = 0;
    while (decoded !== prevDecoded && iterations < 10) {
      prevDecoded = decoded;
      try {
        decoded = decodeURIComponent(decoded);
        iterations++;
      } catch {
        break;
      }
    }
    slug = decoded;
    
    if (process.env.NODE_ENV === 'development') {
      console.log('ContentPage - Decoded slug:', slug);
    }
  } catch (e) {
    // 디코딩 실패 시 원본 사용
    slug = resolvedParams.slug;
  }

  if (!getAllContentTypes().includes(type)) {
    notFound();
  }

  // template 파일은 접근 불가
  if (slug === 'template' || slug.includes('template')) {
    notFound();
  }

  const content = getContentBySlug(type, slug);

  if (!content) {
    notFound();
  }

  const processedContent = await remark().use(html).process(content.content);
  const htmlContent = processedContent.toString();

  return (
    <article className="max-w-4xl mx-auto">
      <div className="mb-6">
        <Link
          href={`/${type}`}
          className="text-primary-600 hover:text-primary-800 text-sm"
        >
          ← {typeLabels[type]} 목록으로
        </Link>
      </div>

      <header className="mb-8">
        <h1 className="text-4xl font-bold mb-4">{content.frontMatter.title}</h1>
        <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
          <span>
            {safeFormatDate(content.frontMatter.date, 'yyyy년 MM월 dd일')}
          </span>
          {content.frontMatter.source && (
            <a
              href={content.frontMatter.source}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary-600 hover:underline"
            >
              원본 보기
            </a>
          )}
        </div>
        {content.frontMatter.tags && content.frontMatter.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-4">
            {content.frontMatter.tags.map((tag) => (
              <Link
                key={tag}
                href={`/tags/${encodeURIComponent(tag)}`}
                className="px-3 py-1 bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300 rounded-full text-sm hover:bg-primary-200 dark:hover:bg-primary-800"
              >
                {tag}
              </Link>
            ))}
          </div>
        )}
      </header>

      {content.frontMatter.tldr && (
        <div className="bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500 p-4 mb-8">
          <h2 className="font-semibold mb-2">요약</h2>
          <p className="text-gray-700 dark:text-gray-300">{content.frontMatter.tldr}</p>
        </div>
      )}

      {content.frontMatter.media && content.frontMatter.media.length > 0 && (
        <div className="mb-8">
          {content.frontMatter.media.map((media, index) => (
            <MediaPlayer key={index} media={media} />
          ))}
        </div>
      )}

      <div
        className="prose dark:prose-invert max-w-none"
        dangerouslySetInnerHTML={{ __html: htmlContent }}
      />

      {content.frontMatter.meta && (
        <footer className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-700">
          <div className="text-sm text-gray-600 dark:text-gray-400">
            {content.frontMatter.meta.generated && 
             content.frontMatter.meta.generated !== '' &&
             !isNaN(new Date(content.frontMatter.meta.generated).getTime()) && (
              <p>
                메타데이터 생성일:{' '}
                {safeFormatDate(content.frontMatter.meta.generated, 'yyyy-MM-dd HH:mm')}
              </p>
            )}
            {content.frontMatter.meta.llm_model && (
              <p>LLM 모델: {content.frontMatter.meta.llm_model}</p>
            )}
            {content.frontMatter.meta.sentiment && (
              <p>감정 분석: {content.frontMatter.meta.sentiment}</p>
            )}
            {content.frontMatter.meta.keywords &&
              content.frontMatter.meta.keywords.length > 0 && (
                <div className="mt-2">
                  <p>키워드:</p>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {content.frontMatter.meta.keywords.map((keyword) => (
                      <span
                        key={keyword}
                        className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-xs"
                      >
                        {keyword}
                      </span>
                    ))}
                  </div>
                </div>
              )}
          </div>
        </footer>
      )}
    </article>
  );
}
