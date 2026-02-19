'use client';

import { useState, useMemo, useEffect } from 'react';
import { getAllContent, getAllTags } from '@/lib/content-client';
import { Content } from '@/types/content';
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

export default function SearchPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [allContent, setAllContent] = useState<Content[]>([]);
  const [allTags, setAllTags] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [index, tags] = await Promise.all([
          getAllContent(),
          getAllTags(),
        ]);
        const contents: Content[] = Object.values(index).flatMap((typeContent) =>
          Object.values(typeContent) as Content[]
        );
        setAllContent(contents);
        setAllTags(tags);
      } catch (error) {
        console.error('Failed to load content:', error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);


  const filteredContent = useMemo(() => {
    if (loading) return [];
    let filtered = allContent;

    // 검색어 필터링
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((content) => {
        const titleMatch = content.frontMatter.title
          .toLowerCase()
          .includes(query);
        const contentMatch = content.content.toLowerCase().includes(query);
        const tagMatch = content.frontMatter.tags?.some((tag) =>
          tag.toLowerCase().includes(query)
        );
        const tldrMatch = content.frontMatter.tldr
          ?.toLowerCase()
          .includes(query);

        return titleMatch || contentMatch || tagMatch || tldrMatch;
      });
    }

    // 타입 필터링
    if (selectedTypes.length > 0) {
      filtered = filtered.filter((content) =>
        selectedTypes.includes(content.type)
      );
    }

    // 태그 필터링
    if (selectedTags.length > 0) {
      filtered = filtered.filter((content) =>
        selectedTags.every((tag) =>
          content.frontMatter.tags?.includes(tag)
        )
      );
    }

    return filtered.sort((a, b) => {
      const dateA = new Date(a.frontMatter.date).getTime();
      const dateB = new Date(b.frontMatter.date).getTime();
      return dateB - dateA;
    });
  }, [searchQuery, selectedTypes, selectedTags, allContent, loading]);

  const toggleType = (type: string) => {
    setSelectedTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    );
  };

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">검색</h1>
        <p>로딩 중...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">검색</h1>

      {/* 검색 입력 */}
      <div>
        <input
          type="text"
          placeholder="제목, 내용, 태그로 검색..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
        />
      </div>

      {/* 타입 필터 */}
      <div>
        <h2 className="text-lg font-semibold mb-2">콘텐츠 타입</h2>
        <div className="flex flex-wrap gap-2">
          {Object.entries(typeLabels).map(([type, label]) => (
            <button
              key={type}
              onClick={() => toggleType(type)}
              className={`px-4 py-2 rounded-lg transition-colors ${
                selectedTypes.includes(type)
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* 태그 필터 */}
      {allTags.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold mb-2">태그</h2>
          <div className="flex flex-wrap gap-2">
            {allTags.map((tag) => (
              <button
                key={tag}
                onClick={() => toggleTag(tag)}
                className={`px-3 py-1 rounded-full text-sm transition-colors ${
                  selectedTags.includes(tag)
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600'
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 필터 초기화 */}
      {(selectedTypes.length > 0 || selectedTags.length > 0) && (
        <button
          onClick={() => {
            setSelectedTypes([]);
            setSelectedTags([]);
          }}
          className="text-primary-600 hover:text-primary-800"
        >
          필터 초기화
        </button>
      )}

      {/* 결과 */}
      <div>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          {filteredContent.length}개의 결과
        </p>
        <div className="space-y-4">
          {filteredContent.map((content) => (
            <Link
              key={`${content.type}-${content.slug}`}
              href={`/content/${content.type}/${encodeURIComponent(content.slug)}`}
              className="block p-4 bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-shadow"
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <span className="text-sm text-primary-600 font-medium">
                    {typeLabels[content.type]}
                  </span>
                  <h2 className="text-xl font-semibold mt-1">
                    {content.frontMatter.title}
                  </h2>
                  {content.frontMatter.tldr && (
                    <p className="text-gray-600 dark:text-gray-400 text-sm mt-2 line-clamp-2">
                      {content.frontMatter.tldr}
                    </p>
                  )}
                  {content.frontMatter.tags &&
                    content.frontMatter.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-3">
                        {content.frontMatter.tags.map((tag) => (
                          <span
                            key={tag}
                            className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-xs"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                </div>
                <span className="text-sm text-gray-500 ml-4">
                  {safeFormatDate(content.frontMatter.date, 'yyyy-MM-dd')}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
