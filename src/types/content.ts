export type ContentType = 'diary' | 'essay' | 'art' | 'music' | 'article' | 'news';

export interface MediaItem {
  type: 'youtube' | 'image' | 'video';
  url: string;
  thumbnail?: string;
  title?: string;
}

export interface ContentMeta {
  generated: string;
  llm_model?: string;
  sentiment?: 'positive' | 'neutral' | 'negative';
  keywords?: string[];
}

export interface ContentFrontMatter {
  type: ContentType;
  title: string;
  date: string;
  tags: string[];
  source?: string;
  media?: MediaItem[];
  tldr?: string;
  meta?: ContentMeta;
  [key: string]: any;
}

export interface Content {
  slug: string;
  type: ContentType;
  frontMatter: ContentFrontMatter;
  content: string;
  html?: string;
}

export interface ContentIndex {
  [type: string]: {
    [slug: string]: Content;
  };
}

export interface SearchResult {
  content: Content;
  score: number;
  highlights?: string[];
}
