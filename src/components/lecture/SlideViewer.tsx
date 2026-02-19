'use client';

import { useState, useEffect, useRef } from 'react';
import { remark } from 'remark';
import html from 'remark-html';
import remarkGfm from 'remark-gfm';

interface SlideViewerProps {
  content: string;
}

export default function SlideViewer({ content }: SlideViewerProps) {
  const [slides, setSlides] = useState<string[]>([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [htmlSlides, setHtmlSlides] = useState<string[]>([]);

  useEffect(() => {
    // 슬라이드를 --- 로 구분 (줄바꿈 포함)
    // frontmatter의 ---는 이미 제거된 상태이므로 content만 처리
    const trimmedContent = content.trim();
    
    // ---로 구분된 슬라이드 추출
    // 정규식: 줄바꿈 + --- + 줄바꿈 또는 줄바꿈 + --- (줄 끝)
    // 더 정확한 패턴 매칭을 위해 여러 패턴 시도
    let slideContents: string[] = [];
    
    // 패턴 1: \n---\n (가장 일반적)
    slideContents = trimmedContent.split(/\n---\n/);
    
    // 만약 분리가 안 되었다면 (길이가 1이면) 다른 패턴 시도
    if (slideContents.length === 1) {
      // 패턴 2: \n--- (줄 끝)
      slideContents = trimmedContent.split(/\n---$/m);
    }
    
    if (slideContents.length === 1) {
      // 패턴 3: ---\n (줄 시작)
      slideContents = trimmedContent.split(/^---\n/m);
    }
    
    if (slideContents.length === 1) {
      // 패턴 4: 단순히 --- (공백 무시)
      slideContents = trimmedContent.split(/---/);
    }
    
    // 각 슬라이드를 정리하고 필터링
    const result = slideContents
      .map(s => s.trim())
      .filter(s => {
        // 빈 문자열이나 ---만 있는 경우 제외
        return s.length > 0 && !s.match(/^---+$/);
      });
    
    // 슬라이드가 없으면 전체를 하나의 슬라이드로 처리
    const finalResult = result.length > 1 ? result : (result.length === 1 && result[0].length > 0 ? result : [trimmedContent]);
    
    if (process.env.NODE_ENV === 'development') {
      console.log('원본 콘텐츠 길이:', trimmedContent.length);
      console.log('원본 콘텐츠 처음 200자:', trimmedContent.substring(0, 200));
      console.log('원본 콘텐츠에 --- 포함 여부:', trimmedContent.includes('---'));
      console.log('분리된 슬라이드 개수:', slideContents.length);
      console.log('최종 슬라이드 개수:', finalResult.length);
      console.log('슬라이드 제목들:', finalResult.map((s, idx) => {
        const lines = s.split('\n').filter(line => line.trim().length > 0);
        const firstLine = lines[0] || '';
        return `슬라이드 ${idx + 1}: ${firstLine.substring(0, 50)}`;
      }));
      console.log('각 슬라이드 길이:', finalResult.map(s => s.length));
    }
    
    setSlides(finalResult);
  }, [content]);

  const [mermaidLoaded, setMermaidLoaded] = useState(false);
  const slideContentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Mermaid 동적 로드 및 초기화
    const loadMermaid = async () => {
      try {
        const mermaidModule = await import('mermaid');
        const mermaid = mermaidModule.default;
        
        mermaid.initialize({
          startOnLoad: false,
          theme: 'default',
          securityLevel: 'loose',
          fontFamily: 'inherit',
        });
        
        setMermaidLoaded(true);
      } catch (error) {
        console.error('Mermaid 로드 실패:', error);
      }
    };

    loadMermaid();
  }, []);

  useEffect(() => {
    // 각 슬라이드를 HTML로 변환 (표 지원을 위해 remark-gfm 사용)
    const processSlides = async () => {
      const processed = await Promise.all(
        slides.map(async (slide) => {
          const processed = await remark()
            .use(remarkGfm) // GitHub Flavored Markdown 지원 (표, 취소선 등)
            .use(html)
            .process(slide);
          return processed.toString();
        })
      );
      setHtmlSlides(processed);
    };

    if (slides.length > 0) {
      processSlides();
    }
  }, [slides]);

  // Mermaid 다이어그램 렌더링
  useEffect(() => {
    if (htmlSlides.length === 0 || !htmlSlides[currentSlide] || !mermaidLoaded) return;

    const renderMermaid = async () => {
      if (!slideContentRef.current) return;

      // Mermaid 모듈 동적 import
      const mermaidModule = await import('mermaid');
      const mermaid = mermaidModule.default;

      // 현재 슬라이드의 컨테이너에서 Mermaid 코드 블록 찾기
      const mermaidPreBlocks = slideContentRef.current.querySelectorAll('pre code.language-mermaid');
      
      if (mermaidPreBlocks.length === 0) return;

      for (let i = 0; i < mermaidPreBlocks.length; i++) {
        const codeBlock = mermaidPreBlocks[i] as HTMLElement;
        const code = codeBlock.textContent || '';
        
        if (!code.trim()) continue;

        try {
          const parentPre = codeBlock.parentElement;
          if (!parentPre || parentPre.tagName !== 'PRE') continue;

          // 이미 렌더링된 경우 스킵 (data-mermaid-rendered 속성 확인)
          if (parentPre.hasAttribute('data-mermaid-rendered')) continue;

          // 고유 ID 생성
          const id = `mermaid-${currentSlide}-${i}-${Date.now()}`;
          
          // Mermaid 컨테이너 생성
          const mermaidDiv = document.createElement('div');
          mermaidDiv.className = 'mermaid';
          mermaidDiv.id = id;
          mermaidDiv.textContent = code;
          mermaidDiv.style.textAlign = 'center';
          mermaidDiv.style.margin = '1rem 0';
          mermaidDiv.style.minHeight = '200px';

          // 기존 pre 요소 교체
          parentPre.setAttribute('data-mermaid-rendered', 'true');
          parentPre.replaceWith(mermaidDiv);

          // Mermaid 렌더링
          await mermaid.run({
            nodes: [mermaidDiv],
          });
        } catch (error) {
          console.error('Mermaid 렌더링 오류:', error);
        }
      }
    };

    // HTML이 렌더링된 후 Mermaid 처리
    const timer = setTimeout(() => {
      renderMermaid();
    }, 300);

    return () => clearTimeout(timer);
  }, [htmlSlides, currentSlide, mermaidLoaded]);

  const goToNext = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(prev => {
        const next = prev + 1;
        if (process.env.NODE_ENV === 'development') {
          console.log('다음 슬라이드로 이동:', next, '/', slides.length);
        }
        return next;
      });
    }
  };

  const goToPrevious = () => {
    if (currentSlide > 0) {
      setCurrentSlide(prev => {
        const prevSlide = prev - 1;
        if (process.env.NODE_ENV === 'development') {
          console.log('이전 슬라이드로 이동:', prevSlide, '/', slides.length);
        }
        return prevSlide;
      });
    }
  };

  const goToSlide = (index: number) => {
    if (index >= 0 && index < slides.length) {
      setCurrentSlide(index);
    }
  };

  // 키보드 네비게이션
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === ' ') {
        e.preventDefault();
        if (currentSlide < slides.length - 1) {
          setCurrentSlide(currentSlide + 1);
        }
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        if (currentSlide > 0) {
          setCurrentSlide(currentSlide - 1);
        }
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [currentSlide, slides.length]);

  if (slides.length === 0) {
    return <div className="text-center py-12">슬라이드를 불러오는 중...</div>;
  }

  if (htmlSlides.length === 0) {
    return <div className="text-center py-12">슬라이드를 처리하는 중...</div>;
  }

  return (
    <div className="w-full">
      {/* 슬라이드 뷰어 - 틀 제거, 어두운 배경 */}
      <div className="bg-gradient-to-br from-gray-900 to-gray-800 py-12 px-6 flex items-center justify-center min-h-[70vh]">
        <div
          ref={slideContentRef}
          key={`slide-${currentSlide}`}
          className="w-full max-w-5xl flex flex-col justify-center slide-content"
          dangerouslySetInnerHTML={{
            __html: htmlSlides[currentSlide] || '',
          }}
        />
      </div>

      {/* 네비게이션 컨트롤 */}
      <div className="mt-8 mb-4 flex items-center justify-between max-w-5xl mx-auto px-6">
        <button
          onClick={goToPrevious}
          disabled={currentSlide === 0}
          className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          이전
        </button>

        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600 dark:text-gray-400">
            {currentSlide + 1} / {slides.length}
          </span>
          {process.env.NODE_ENV === 'development' && (
            <span className="text-xs text-gray-400">
              (HTML: {htmlSlides.length})
            </span>
          )}
        </div>

        <button
          onClick={goToNext}
          disabled={currentSlide === slides.length - 1}
          className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
        >
          다음
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* 키보드 단축키 안내 */}
      <div className="text-center text-xs text-gray-500 dark:text-gray-400 mb-6">
        키보드: ← → 또는 스페이스바로 이동
      </div>

      {/* 슬라이드 썸네일 네비게이션 - 맨 하단 */}
      <div className="border-t border-gray-200 dark:border-gray-700 pt-6 mt-8">
        <div className="max-w-5xl mx-auto px-6">
          <div className="flex gap-2 overflow-x-auto pb-4 scrollbar-thin">
            {slides.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`flex-shrink-0 w-24 h-16 rounded border-2 transition-all ${
                  index === currentSlide
                    ? 'border-primary-500 ring-2 ring-primary-200 bg-primary-50 dark:bg-primary-900/20'
                    : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500 bg-gray-100 dark:bg-gray-700'
                }`}
              >
                <div className="p-2 text-xs text-center text-gray-600 dark:text-gray-400">
                  슬라이드 {index + 1}
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
