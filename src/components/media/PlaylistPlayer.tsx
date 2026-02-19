'use client';

import { useState, useEffect, useRef } from 'react';
import { Content } from '@/types/content';

interface PlaylistPlayerProps {
  playlist: Content[];
  autoplay?: boolean;
  shuffle?: boolean;
}

export default function PlaylistPlayer({ 
  playlist, 
  autoplay = false,
  shuffle = false 
}: PlaylistPlayerProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [shuffledList, setShuffledList] = useState<Content[]>([]);
  const playerRef = useRef<HTMLDivElement>(null);
  const youtubePlayerRef = useRef<any>(null);

  // 셔플 모드일 때 리스트 섞기
  useEffect(() => {
    if (shuffle && playlist.length > 0) {
      const shuffled = [...playlist].sort(() => Math.random() - 0.5);
      setShuffledList(shuffled);
    } else {
      setShuffledList(playlist);
    }
  }, [playlist, shuffle]);

  const getYouTubeVideoId = (url: string) => {
    const match = url.match(
      /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/
    );
    return match ? match[1] : null;
  };

  const currentSong = shuffledList[currentIndex];
  const videoId = currentSong?.frontMatter.media?.find(
    (m) => m.type === 'youtube'
  ) ? getYouTubeVideoId(
    currentSong.frontMatter.media.find((m) => m.type === 'youtube')!.url
  ) : null;

  useEffect(() => {
    if (!videoId || !playerRef.current) return;

    // YouTube IFrame API 로드
    if (!window.YT) {
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);

      window.onYouTubeIframeAPIReady = () => {
        createPlayer();
      };
    } else {
      createPlayer();
    }

    function createPlayer() {
      if (!playerRef.current || !videoId) return;

      // 기존 플레이어 제거
      if (youtubePlayerRef.current) {
        youtubePlayerRef.current.destroy();
      }

      // 플레이어 div 초기화
      playerRef.current.innerHTML = '';

      // 새 플레이어 생성
      youtubePlayerRef.current = new window.YT.Player(playerRef.current, {
        videoId: videoId,
        playerVars: {
          autoplay: autoplay ? 1 : 0,
          rel: 0,
          modestbranding: 1,
          enablejsapi: 1,
          origin: typeof window !== 'undefined' ? window.location.origin : '',
          controls: 1,
          playsinline: 1,
          iv_load_policy: 3,
        },
        events: {
          onReady: (event: any) => {
            setIsPlaying(true);
            // 자동 재생이 실패할 수 있으므로, 사용자 상호작용 후 재생 시도
            if (autoplay) {
              try {
                event.target.playVideo();
              } catch (error) {
                console.log('자동 재생 실패, 사용자가 직접 재생해주세요');
              }
            }
          },
          onStateChange: (event: any) => {
            if (event.data === window.YT.PlayerState.ENDED) {
              playNext();
            } else if (event.data === window.YT.PlayerState.PAUSED) {
              // 일시정지 상태 확인 (동시 재생 제한 등)
              const errorCode = event.target.getVideoData().error;
              if (errorCode) {
                console.log('재생 오류 발생:', errorCode);
              }
            }
          },
          onError: (event: any) => {
            console.error('YouTube 플레이어 오류:', event.data);
            // 오류 발생 시 다음 곡으로 넘어가거나 사용자에게 알림
            if (event.data === 150 || event.data === 101 || event.data === 100) {
              // 동시 재생 제한 등의 오류
              alert('재생 제한이 발생했습니다. 잠시 후 다시 시도하거나 수동으로 재생해주세요.');
            }
          },
        },
      });
    }

    return () => {
      if (youtubePlayerRef.current) {
        youtubePlayerRef.current.destroy();
      }
    };
  }, [videoId, autoplay]);

  const playNext = () => {
    if (currentIndex < shuffledList.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      // 플레이리스트 끝
      setIsPlaying(false);
    }
  };

  const playPrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  if (playlist.length === 0) {
    return null;
  }

  const [showLyrics, setShowLyrics] = useState(true);
  const lyricsContent = currentSong?.content || '';

  return (
    <div className="fixed bottom-0 right-0 left-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 shadow-lg z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-start gap-4 flex-wrap">
          <div className="flex-1 min-w-[200px]">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              {currentIndex + 1} / {playlist.length}
              {shuffle && ' (셔플)'}
            </div>
            <div className="font-semibold mt-1">
              {currentSong?.frontMatter.title || '재생 중...'}
            </div>
            {currentSong?.frontMatter.singer && (
              <div className="text-sm text-gray-600 dark:text-gray-400">
                {currentSong.frontMatter.singer}
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={playPrevious}
              disabled={currentIndex === 0}
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="이전 곡"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              onClick={() => {
                if (youtubePlayerRef.current) {
                  try {
                    const state = youtubePlayerRef.current.getPlayerState();
                    if (state === window.YT.PlayerState.PLAYING) {
                      youtubePlayerRef.current.pauseVideo();
                    } else {
                      youtubePlayerRef.current.playVideo();
                    }
                  } catch (error) {
                    console.error('재생 제어 실패:', error);
                  }
                }
              }}
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
              aria-label="재생/일시정지"
              title="재생/일시정지"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </button>
            <button
              onClick={playNext}
              disabled={currentIndex >= playlist.length - 1}
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="다음 곡"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
            <button
              onClick={() => setShowLyrics(!showLyrics)}
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
              aria-label={showLyrics ? '가사 숨기기' : '가사 보기'}
              title={showLyrics ? '가사 숨기기' : '가사 보기'}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={showLyrics ? "M5 15l7-7 7 7" : "M19 9l-7 7-7-7"} />
              </svg>
            </button>
          </div>

          <div className="w-64 flex-shrink-0">
            <div ref={playerRef} className="w-full aspect-video bg-black rounded" />
          </div>
        </div>

        {/* 가사 영역 */}
        {showLyrics && lyricsContent && (
          <div className="mt-4 border-t border-gray-200 dark:border-gray-700 pt-4">
            <div className="text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">가사</div>
            <div className="max-h-40 overflow-y-auto text-sm text-gray-600 dark:text-gray-400 whitespace-pre-line leading-relaxed scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-200">
              {lyricsContent.trim()}
            </div>
          </div>
        )}

        {/* 플레이리스트 진행 표시 */}
        <div className="mt-4">
          <div className="flex gap-1 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-200">
            {shuffledList.map((song, index) => (
              <button
                key={`${song.type}-${song.slug}`}
                onClick={() => setCurrentIndex(index)}
                className={`px-3 py-1 rounded text-xs whitespace-nowrap transition-colors ${
                  index === currentIndex
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                {song.frontMatter.title}
              </button>
            ))}
          </div>
        </div>
      </div>
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
