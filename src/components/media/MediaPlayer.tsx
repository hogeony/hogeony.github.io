'use client';

import { useState, useEffect } from 'react';
import { MediaItem } from '@/types/content';

interface MediaPlayerProps {
  media: MediaItem;
}

export default function MediaPlayer({ media }: MediaPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);

  const getYouTubeVideoId = (url: string) => {
    const match = url.match(
      /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/
    );
    return match ? match[1] : null;
  };

  if (media.type === 'youtube') {
    const videoId = getYouTubeVideoId(media.url);
    if (!videoId) return null;

    return (
      <div className="mb-6">
        <div className="aspect-video bg-black rounded-lg overflow-hidden">
          <iframe
            width="100%"
            height="100%"
            src={`https://www.youtube.com/embed/${videoId}`}
            title={media.title || 'YouTube video'}
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="w-full h-full"
          />
        </div>
      </div>
    );
  }

  if (media.type === 'image') {
    return (
      <div className="mb-6">
        <img
          src={media.url}
          alt={media.title || 'Image'}
          className="w-full rounded-lg shadow-lg"
        />
        {media.title && (
          <p className="text-center text-gray-600 dark:text-gray-400 mt-2">
            {media.title}
          </p>
        )}
      </div>
    );
  }

  if (media.type === 'video') {
    return (
      <div className="mb-6">
        <video
          src={media.url}
          controls
          className="w-full rounded-lg shadow-lg"
        >
          브라우저가 비디오 태그를 지원하지 않습니다.
        </video>
        {media.title && (
          <p className="text-center text-gray-600 dark:text-gray-400 mt-2">
            {media.title}
          </p>
        )}
      </div>
    );
  }

  return null;
}
