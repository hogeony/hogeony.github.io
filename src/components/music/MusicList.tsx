'use client';

import { useState } from 'react';
import { Content } from '@/types/content';
import Link from 'next/link';
import { safeFormatDate } from '@/lib/date-utils';
import Image from 'next/image';

interface MusicListProps {
  contents: Content[];
  selectedSongs: Set<string>;
  onToggleSong: (content: Content) => void;
}

export default function MusicList({ contents, selectedSongs, onToggleSong }: MusicListProps) {
  const getYouTubeVideoId = (url: string) => {
    const match = url.match(
      /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/
    );
    return match ? match[1] : null;
  };

  const getYouTubeThumbnail = (url: string) => {
    const videoId = getYouTubeVideoId(url);
    if (!videoId) return null;
    return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {contents.map((content) => {
        const youtubeMedia = content.frontMatter.media?.find(
          (m) => m.type === 'youtube'
        );
        const isSelected = selectedSongs.has(`${content.type}-${content.slug}`);
        const thumbnailUrl = youtubeMedia ? getYouTubeThumbnail(youtubeMedia.url) : null;
        
        return (
          <div
            key={content.slug}
            className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm border-2 transition-all hover:shadow-md cursor-pointer ${
              isSelected
                ? 'border-primary-500 ring-2 ring-primary-200 bg-primary-50 dark:bg-primary-900/20'
                : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
            }`}
            onClick={() => onToggleSong(content)}
          >
            <div className="p-3">
              {/* 상단: 체크박스와 썸네일 */}
              <div className="flex items-start gap-3 mb-3">
                {/* 체크박스 - 왼쪽 상단 */}
                <div className="flex-shrink-0 flex items-center justify-center pt-1">
                  <label className="cursor-pointer flex items-center justify-center w-5 h-5">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => onToggleSong(content)}
                      className="w-5 h-5 text-primary-600 bg-white dark:bg-gray-800 border-2 border-gray-400 dark:border-gray-500 rounded focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 cursor-pointer appearance-none checked:bg-primary-600 checked:border-primary-600 relative z-10"
                      onClick={(e) => e.stopPropagation()}
                      style={{
                        backgroundImage: isSelected ? 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 20 20\' fill=\'white\'%3E%3Cpath fill-rule=\'evenodd\' d=\'M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z\' clip-rule=\'evenodd\'/%3E%3C/svg%3E")' : 'none',
                        backgroundSize: '14px 14px',
                        backgroundPosition: 'center',
                        backgroundRepeat: 'no-repeat',
                      }}
                    />
                  </label>
                </div>

                {/* 썸네일 */}
                {thumbnailUrl && (
                  <div className="flex-shrink-0 flex-grow">
                    <Link
                      href={`/content/music/${encodeURIComponent(content.slug)}`}
                      className="block"
                    >
                      <img
                        src={thumbnailUrl}
                        alt={content.frontMatter.title}
                        className="w-full h-24 object-cover rounded hover:opacity-80 transition-opacity"
                        loading="lazy"
                      />
                    </Link>
                  </div>
                )}
              </div>

              {/* 정보 */}
              <div className="min-w-0">
                <Link
                  href={`/content/music/${encodeURIComponent(content.slug)}`}
                  className="block"
                >
                  <h2 className="text-base font-semibold mb-1 hover:text-primary-600 truncate">
                    {content.frontMatter.title}
                  </h2>
                </Link>
                {content.frontMatter.singer && (
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2 truncate">
                    {content.frontMatter.singer}
                  </p>
                )}
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="text-xs text-gray-500">
                    {safeFormatDate(content.frontMatter.date, 'yyyy-MM-dd')}
                  </p>
                  {content.frontMatter.tags && content.frontMatter.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {content.frontMatter.tags.slice(0, 2).map((tag) => (
                        <Link
                          key={tag}
                          href={`/tags/${encodeURIComponent(tag)}`}
                          className="px-1.5 py-0.5 bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300 rounded text-xs hover:bg-primary-200"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {tag}
                        </Link>
                      ))}
                      {content.frontMatter.tags.length > 2 && (
                        <span className="text-xs text-gray-500">
                          +{content.frontMatter.tags.length - 2}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
