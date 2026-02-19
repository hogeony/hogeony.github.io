'use client';

import { useState } from 'react';
import { MediaItem } from '@/types/content';

interface ArtFrameProps {
  media: MediaItem;
  className?: string;
}

export default function ArtFrame({ media, className = '' }: ArtFrameProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);

  if (media.type !== 'image' && media.type !== 'video') {
    return null;
  }

  return (
    <div className={`relative bg-gray-100 dark:bg-gray-900 ${className}`}>
      {media.type === 'image' ? (
        <>
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
            </div>
          )}
          {error && (
            <div className="absolute inset-0 flex items-center justify-center text-gray-500">
              이미지를 불러올 수 없습니다
            </div>
          )}
          <img
            src={media.url}
            alt={media.title || 'Artwork'}
            className={`w-full h-auto object-cover transition-opacity duration-300 ${
              isLoading ? 'opacity-0' : 'opacity-100'
            }`}
            onLoad={() => setIsLoading(false)}
            onError={() => {
              setIsLoading(false);
              setError(true);
            }}
          />
        </>
      ) : (
        <video
          src={media.url}
          className="w-full h-auto"
          controls
          loop
          muted
          playsInline
        >
          브라우저가 비디오 태그를 지원하지 않습니다.
        </video>
      )}
      {/* 액자 효과 */}
      <div className="absolute inset-0 pointer-events-none border-4 border-white dark:border-gray-800 shadow-lg"></div>
    </div>
  );
}
