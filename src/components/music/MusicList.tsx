'use client';

import { useState } from 'react';
import { Content } from '@/types/content';
import MusicPlayer from '@/components/media/MusicPlayer';
import Link from 'next/link';
import { safeFormatDate } from '@/lib/date-utils';

interface MusicListProps {
  contents: Content[];
  selectedSongs: Set<string>;
  onToggleSong: (content: Content) => void;
}

export default function MusicList({ contents, selectedSongs, onToggleSong }: MusicListProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {contents.map((content) => {
        const youtubeMedia = content.frontMatter.media?.find(
          (m) => m.type === 'youtube'
        );
        const isSelected = selectedSongs.has(`${content.type}-${content.slug}`);
        
        return (
          <div
            key={content.slug}
            className={`bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden border-2 transition-colors ${
              isSelected
                ? 'border-primary-500 ring-2 ring-primary-200'
                : 'border-transparent'
            }`}
          >
            <div className="relative">
              {youtubeMedia && (
                <div className="aspect-video">
                  <MusicPlayer media={youtubeMedia} />
                </div>
              )}
              <div className="absolute top-2 left-2 z-10">
                <label className="cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => onToggleSong(content)}
                    className="w-6 h-6 text-primary-600 bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 cursor-pointer appearance-none checked:bg-primary-600 checked:border-primary-600 relative"
                    onClick={(e) => e.stopPropagation()}
                    style={{
                      backgroundImage: isSelected ? 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 20 20\' fill=\'white\'%3E%3Cpath fill-rule=\'evenodd\' d=\'M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z\' clip-rule=\'evenodd\'/%3E%3C/svg%3E")' : 'none',
                      backgroundSize: 'contain',
                      backgroundPosition: 'center',
                      backgroundRepeat: 'no-repeat',
                    }}
                  />
                </label>
              </div>
            </div>
            <div className="p-6">
              <Link
                href={`/content/music/${encodeURIComponent(content.slug)}`}
                className="block"
              >
                <h2 className="text-xl font-semibold mb-2 hover:text-primary-600">
                  {content.frontMatter.title}
                </h2>
              </Link>
              {content.frontMatter.singer && (
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                  {content.frontMatter.singer}
                </p>
              )}
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
  );
}
