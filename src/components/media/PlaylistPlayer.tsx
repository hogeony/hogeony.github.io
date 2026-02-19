'use client';

import { useState, useEffect, useRef } from 'react';
import { Content } from '@/types/content';

interface PlaylistPlayerProps {
  playlist: Content[];
  autoplay?: boolean;
  shuffle?: boolean;
  onClose?: () => void;
}

export default function PlaylistPlayer({ 
  playlist, 
  autoplay = false,
  shuffle = false,
  onClose
}: PlaylistPlayerProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [shuffledList, setShuffledList] = useState<Content[]>([]);
  const playerRef = useRef<HTMLDivElement>(null);
  const youtubePlayerRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const resizeHandleRef = useRef<HTMLDivElement>(null);
  const [playerHeight, setPlayerHeight] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('playlistPlayerHeight');
      return saved ? parseInt(saved, 10) : 400;
    }
    return 400;
  });
  const [isResizing, setIsResizing] = useState(false);

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

  // 리사이즈 핸들 드래그 처리
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing || !containerRef.current) return;
      
      const windowHeight = window.innerHeight;
      const newHeight = windowHeight - e.clientY;
      
      // 최소/최대 높이 제한 (200px ~ 800px)
      const minHeight = 200;
      const maxHeight = 800;
      const clampedHeight = Math.max(minHeight, Math.min(maxHeight, newHeight));
      
      setPlayerHeight(clampedHeight);
    };

    const handleMouseUp = () => {
      if (isResizing) {
        setIsResizing(false);
        // 높이를 localStorage에 저장
        if (typeof window !== 'undefined') {
          localStorage.setItem('playlistPlayerHeight', playerHeight.toString());
        }
      }
    };

    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'row-resize';
      document.body.style.userSelect = 'none';
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
  }, [isResizing, playerHeight]);

  if (playlist.length === 0) {
    return null;
  }

  const [showLyrics, setShowLyrics] = useState(true);
  const lyricsContent = currentSong?.content || '';
  const [lyricsFontSize, setLyricsFontSize] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('playlistLyricsFontSize');
      return saved ? parseInt(saved, 10) : 24; // 기본값 24px
    }
    return 24;
  });

  // 글씨 크기 조절 함수
  const increaseFontSize = () => {
    const newSize = Math.min(50, lyricsFontSize + 2); // 최대 50px
    setLyricsFontSize(newSize);
    if (typeof window !== 'undefined') {
      localStorage.setItem('playlistLyricsFontSize', newSize.toString());
    }
  };

  const decreaseFontSize = () => {
    const newSize = Math.max(10, lyricsFontSize - 2); // 최소 10px
    setLyricsFontSize(newSize);
    if (typeof window !== 'undefined') {
      localStorage.setItem('playlistLyricsFontSize', newSize.toString());
    }
  };

  return (
    <div 
      ref={containerRef}
      className="fixed right-0 left-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 shadow-lg z-50"
      style={{ bottom: 0, height: `${playerHeight}px`, maxHeight: '90vh' }}
    >
      {/* 리사이즈 핸들 */}
      <div
        ref={resizeHandleRef}
        onMouseDown={(e) => {
          e.preventDefault();
          setIsResizing(true);
        }}
        className="absolute top-0 left-0 right-0 h-2 cursor-row-resize hover:bg-primary-500 dark:hover:bg-primary-400 transition-colors group"
        style={{ zIndex: 10 }}
        title="드래그하여 높이 조정"
      >
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-12 h-1 bg-gray-400 dark:bg-gray-500 rounded-full group-hover:bg-primary-500 dark:group-hover:bg-primary-400 transition-colors" />
      </div>
      
      <div className="container mx-auto px-4 py-4 h-full flex flex-col">
        {/* 2컬럼 레이아웃 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 flex-1 min-h-0">
          {/* 좌측: 제목, 가수, 플레이어 */}
          <div className="space-y-4">
            {/* 제목/가수 */}
            <div>
              <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                {currentIndex + 1} / {playlist.length}
                {shuffle && ' (셔플)'}
              </div>
              <div className="font-semibold text-lg">
                {currentSong?.frontMatter.title || '재생 중...'}
              </div>
              {currentSong?.frontMatter.singer && (
                <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {currentSong.frontMatter.singer}
                </div>
              )}
            </div>

            {/* 플레이어 */}
            <div>
              <div ref={playerRef} className="w-full h-48 bg-black rounded-lg" />
            </div>

            {/* 컨트롤 버튼 */}
            <div className="flex items-center justify-center gap-2">
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
                className="p-3 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 bg-primary-100 dark:bg-primary-900"
                aria-label="재생/일시정지"
                title="재생/일시정지"
              >
                <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
            </div>
          </div>

          {/* 우측: 가사 및 닫기 버튼 */}
          <div className="flex flex-col min-h-0">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide">
                  {showLyrics ? '가사' : ''}
                </div>
                {/* 글씨 크기 조절 버튼 */}
                {showLyrics && lyricsContent && (
                  <div className="flex items-center gap-1 border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden">
                    <button
                      onClick={decreaseFontSize}
                      className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400 transition-colors"
                      aria-label="글씨 크기 줄이기"
                      title="글씨 크기 줄이기"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                      </svg>
                    </button>
                    <span className="px-2 text-xs text-gray-600 dark:text-gray-400 min-w-[2rem] text-center">
                      {lyricsFontSize}px
                    </span>
                    <button
                      onClick={increaseFontSize}
                      className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400 transition-colors"
                      aria-label="글씨 크기 늘리기"
                      title="글씨 크기 늘리기"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                    </button>
                  </div>
                )}
              </div>
              {/* 닫기 버튼 */}
              {onClose && (
                <button
                  onClick={onClose}
                  className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                  aria-label="플레이어 닫기"
                  title="플레이어 닫기"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
            {/* 가사 영역 */}
            {showLyrics && lyricsContent && (
              <div 
                className="flex-1 overflow-y-auto text-gray-600 dark:text-gray-400 leading-relaxed scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-200 pr-2 min-h-0"
                style={{ 
                  whiteSpace: 'pre-wrap',
                  fontSize: `${lyricsFontSize}px`
                }}
              >
                {lyricsContent.trim()}
              </div>
            )}
            {!showLyrics && (
              <button
                onClick={() => setShowLyrics(true)}
                className="w-full p-4 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg text-gray-500 dark:text-gray-400 hover:border-primary-500 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
              >
                가사 보기
              </button>
            )}
          </div>
        </div>

        {/* 플레이리스트 진행 표시 - 전체 너비 */}
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 flex-shrink-0">
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
