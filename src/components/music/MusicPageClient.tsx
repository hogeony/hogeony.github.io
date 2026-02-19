'use client';

import { useState, useMemo, useEffect } from 'react';
import { Content } from '@/types/content';
import MusicList from './MusicList';
import PlaylistPlayer from '@/components/media/PlaylistPlayer';

interface MusicPageClientProps {
  initialContents: Content[];
}

export default function MusicPageClient({ initialContents }: MusicPageClientProps) {
  const [selectedSongs, setSelectedSongs] = useState<Set<string>>(new Set());
  const [isPlaylistMode, setIsPlaylistMode] = useState(false);
  const [shuffleMode, setShuffleMode] = useState(false);

  // LocalStorage에서 저장된 플레이리스트 불러오기
  useEffect(() => {
    try {
      const saved = localStorage.getItem('music-playlist');
      if (saved) {
        const savedIds = JSON.parse(saved);
        const validIds = savedIds.filter((id: string) =>
          initialContents.some((c) => `${c.type}-${c.slug}` === id)
        );
        if (validIds.length > 0) {
          setSelectedSongs(new Set(validIds));
        }
      }
    } catch (error) {
      console.error('Failed to load saved playlist:', error);
    }
  }, [initialContents]);

  const playlist = useMemo(() => {
    return initialContents.filter((content) =>
      selectedSongs.has(`${content.type}-${content.slug}`)
    );
  }, [initialContents, selectedSongs]);

  const toggleSong = (content: Content) => {
    const key = `${content.type}-${content.slug}`;
    setSelectedSongs((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(key)) {
        newSet.delete(key);
      } else {
        newSet.add(key);
      }
      return newSet;
    });
  };

  const selectAll = () => {
    if (selectedSongs.size === initialContents.length) {
      setSelectedSongs(new Set());
    } else {
      setSelectedSongs(
        new Set(initialContents.map((c) => `${c.type}-${c.slug}`))
      );
    }
  };

  const clearSelection = () => {
    setSelectedSongs(new Set());
    setIsPlaylistMode(false);
    localStorage.removeItem('music-playlist');
  };

  const startPlaylist = () => {
    if (playlist.length > 0) {
      setIsPlaylistMode(true);
    }
  };

  const stopPlaylist = () => {
    setIsPlaylistMode(false);
  };

  const savePlaylist = () => {
    if (playlist.length === 0) return;

    try {
      const ids = Array.from(selectedSongs);
      localStorage.setItem('music-playlist', JSON.stringify(ids));
      alert('플레이리스트가 저장되었습니다!');
    } catch (error) {
      console.error('Failed to save playlist:', error);
      alert('플레이리스트 저장에 실패했습니다.');
    }
  };

  const copyPlaylist = () => {
    if (playlist.length === 0) return;

    const playlistData = playlist
      .map((song) => {
        const youtubeMedia = song.frontMatter.media?.find(
          (m) => m.type === 'youtube'
        );
        return `${song.frontMatter.title} - ${
          song.frontMatter.singer || 'Unknown'
        } | ${youtubeMedia?.url || ''}`;
      })
      .join('\n');

    navigator.clipboard.writeText(playlistData).then(() => {
      alert('플레이리스트가 클립보드에 복사되었습니다!');
    }).catch(() => {
      const textarea = document.createElement('textarea');
      textarea.value = playlistData;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      alert('플레이리스트가 클립보드에 복사되었습니다!');
    });
  };

  const loadPlaylist = () => {
    const input = prompt(
      '플레이리스트를 붙여넣으세요 (각 줄에 "제목 - 가수 | YouTube링크" 형식):'
    );
    if (!input) return;

    const lines = input.split('\n').filter((line) => line.trim());
    const newSelection = new Set<string>();

    lines.forEach((line) => {
      const match = line.match(/(.+?)\s*-\s*(.+?)\s*\|\s*(.+)/);
      if (match) {
        const [, title, singer, youtube] = match;
        const song = initialContents.find(
          (c) =>
            c.frontMatter.title === title.trim() &&
            (c.frontMatter.singer || '') === singer.trim() &&
            c.frontMatter.media?.some((m) => m.url === youtube.trim())
        );
        if (song) {
          newSelection.add(`${song.type}-${song.slug}`);
        }
      }
    });

    if (newSelection.size > 0) {
      setSelectedSongs(newSelection);
      alert(`${newSelection.size}개의 곡이 플레이리스트에 추가되었습니다.`);
    } else {
      alert('일치하는 곡을 찾을 수 없습니다.');
    }
  };

  return (
    <div className="space-y-6 pb-32">
      <div>
        <h1 className="text-3xl font-bold mb-2">음악</h1>
        <p className="text-gray-600 dark:text-gray-400">
          총 {initialContents.length}개의 곡
          {selectedSongs.size > 0 && (
            <span className="ml-2 text-primary-600 font-semibold">
              ({selectedSongs.size}개 선택됨)
            </span>
          )}
        </p>
      </div>

      {/* 플레이리스트 컨트롤 - 항상 표시 */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
        <div className="flex flex-wrap gap-2 items-center">
          <button
            onClick={selectAll}
            className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded hover:bg-gray-300 dark:hover:bg-gray-600 text-sm"
          >
            {selectedSongs.size === initialContents.length ? '전체 해제' : '전체 선택'}
          </button>
          <button
            onClick={clearSelection}
            disabled={selectedSongs.size === 0}
            className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded hover:bg-gray-300 dark:hover:bg-gray-600 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            선택 초기화
          </button>
          <button
            onClick={startPlaylist}
            disabled={playlist.length === 0}
            className="px-4 py-2 bg-primary-600 text-white rounded hover:bg-primary-700 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            플레이리스트 재생 ({playlist.length})
          </button>
          <button
            onClick={() => setShuffleMode(!shuffleMode)}
            disabled={playlist.length === 0}
            className={`px-4 py-2 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed ${
              shuffleMode
                ? 'bg-primary-600 text-white'
                : 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600'
            }`}
          >
            {shuffleMode ? '✓ 셔플' : '셔플'}
          </button>
          <button
            onClick={savePlaylist}
            disabled={playlist.length === 0}
            className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded hover:bg-gray-300 dark:hover:bg-gray-600 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            저장
          </button>
          <button
            onClick={copyPlaylist}
            disabled={playlist.length === 0}
            className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded hover:bg-gray-300 dark:hover:bg-gray-600 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            복사
          </button>
          <button
            onClick={loadPlaylist}
            className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded hover:bg-gray-300 dark:hover:bg-gray-600 text-sm"
          >
            불러오기
          </button>
        </div>
      </div>

      {initialContents.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500">아직 음악이 없습니다.</p>
          <p className="text-sm text-gray-400 mt-2">
            content/music/ 폴더에 MD 파일을 추가하세요.
          </p>
        </div>
      ) : (
        <MusicList
          contents={initialContents}
          selectedSongs={selectedSongs}
          onToggleSong={toggleSong}
        />
      )}

      {/* 플레이리스트 플레이어 */}
      {isPlaylistMode && playlist.length > 0 && (
        <PlaylistPlayer
          playlist={playlist}
          autoplay={true}
          shuffle={shuffleMode}
          onClose={stopPlaylist}
        />
      )}
    </div>
  );
}
