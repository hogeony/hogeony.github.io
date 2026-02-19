'use client';

import { useState, useEffect, useRef } from 'react';
import { MediaItem } from '@/types/content';

interface MusicPlayerProps {
  media: MediaItem;
  autoplay?: boolean;
}

export default function MusicPlayer({ media, autoplay = false }: MusicPlayerProps) {
  const [isReady, setIsReady] = useState(false);
  const playerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (media.type !== 'youtube' || !playerRef.current) return;

    const getYouTubeVideoId = (url: string) => {
      const match = url.match(
        /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/
      );
      return match ? match[1] : null;
    };

    const videoId = getYouTubeVideoId(media.url);
    if (!videoId) return;

    // YouTube IFrame API 로드
    if (!window.YT) {
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);

      window.onYouTubeIframeAPIReady = () => {
        new window.YT.Player(playerRef.current!, {
          videoId: videoId,
          playerVars: {
            autoplay: autoplay ? 1 : 0,
            rel: 0,
            modestbranding: 1,
            enablejsapi: 1,
            origin: typeof window !== 'undefined' ? window.location.origin : '',
            controls: 1,
            playsinline: 1,
          },
          events: {
            onReady: () => setIsReady(true),
            onError: (event: any) => {
              console.error('YouTube 플레이어 오류:', event.data);
            },
          },
        });
      };
    } else {
      new window.YT.Player(playerRef.current, {
        videoId: videoId,
        playerVars: {
          autoplay: autoplay ? 1 : 0,
          rel: 0,
          modestbranding: 1,
          enablejsapi: 1,
          origin: typeof window !== 'undefined' ? window.location.origin : '',
          controls: 1,
          playsinline: 1,
        },
        events: {
          onReady: () => setIsReady(true),
          onError: (event: any) => {
            console.error('YouTube 플레이어 오류:', event.data);
          },
        },
      });
    }
  }, [media.url, autoplay]);

  if (media.type !== 'youtube') {
    return null;
  }

  return (
    <div className="w-full">
      <div ref={playerRef} className="w-full aspect-video bg-black rounded-lg" />
    </div>
  );
}

// YouTube API 타입 선언
declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady: () => void;
  }
}
