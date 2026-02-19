import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import Link from 'next/link';
import { safeFormatDate } from '@/lib/date-utils';

interface Lecture {
  slug: string;
  title: string;
  date: string;
  tags: string[];
  description?: string;
}

function getLectures(): Lecture[] {
  const lectureDirectory = path.join(process.cwd(), 'content', 'lecture');
  
  if (!fs.existsSync(lectureDirectory)) {
    return [];
  }

  const fileNames = fs.readdirSync(lectureDirectory);
  const lectures = fileNames
    .filter((name) => name.endsWith('.md'))
    .map((fileName) => {
      const slug = fileName.replace(/\.md$/, '');
      const fullPath = path.join(lectureDirectory, fileName);
      const fileContents = fs.readFileSync(fullPath, 'utf8');
      const { data } = matter(fileContents);
      
      return {
        slug,
        title: data.title || slug,
        date: data.date || new Date().toISOString(),
        tags: data.tags || [],
        description: data.description || '',
      };
    })
    .sort((a, b) => {
      const dateA = new Date(a.date).getTime();
      const dateB = new Date(b.date).getTime();
      return dateB - dateA;
    });

  return lectures;
}

export default function LecturePage() {
  const lectures = getLectures();

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">인생학교</h1>
        <p className="text-gray-600 dark:text-gray-400 text-lg">
          삶의 지혜와 노하우를 공유하는 강의 공간
        </p>
      </div>

      {lectures.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500">아직 강의 자료가 없습니다.</p>
          <p className="text-sm text-gray-400 mt-2">
            content/lecture/ 폴더에 MD 파일을 추가하세요.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {lectures.map((lecture) => (
            <Link
              key={lecture.slug}
              href={`/lecture/${encodeURIComponent(lecture.slug)}`}
              className="block p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-shadow border-2 border-transparent hover:border-primary-500"
            >
              <h2 className="text-xl font-semibold mb-2">{lecture.title}</h2>
              {lecture.description && (
                <p className="text-gray-600 dark:text-gray-400 text-sm mb-3 line-clamp-2">
                  {lecture.description}
                </p>
              )}
              <div className="flex items-center justify-between mt-4">
                <span className="text-sm text-gray-500">
                  {safeFormatDate(lecture.date, 'yyyy-MM-dd')}
                </span>
                {lecture.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {lecture.tags.slice(0, 2).map((tag) => (
                      <span
                        key={tag}
                        className="px-2 py-1 bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300 rounded text-xs"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
