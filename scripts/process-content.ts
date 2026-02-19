import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { getAllContentTypes } from '../src/lib/content';

/**
 * 콘텐츠 파일을 처리하고 LLM을 통해 메타데이터를 생성하는 스크립트
 * 
 * 사용법:
 * npm run process-content [type] [slug]
 * 
 * 예시:
 * npm run process-content diary 2024-01-15-my-diary
 */

async function processContent(type: string, slug: string) {
  const contentDirectory = path.join(process.cwd(), 'content');
  const filePath = path.join(contentDirectory, type, `${slug}.md`);

  if (!fs.existsSync(filePath)) {
    console.error(`❌ File not found: ${filePath}`);
    process.exit(1);
  }

  const fileContents = fs.readFileSync(filePath, 'utf8');
  const { data, content } = matter(fileContents);

  console.log(`📄 Processing: ${type}/${slug}`);
  console.log(`📝 Title: ${data.title || 'No title'}`);

  // LLM API 호출 (선택사항)
  // 참고: 정적 export 모드에서는 API Routes를 사용할 수 없으므로
  // 직접 OpenAI API를 호출하거나 별도 서버를 사용해야 합니다.
  if (process.env.OPENAI_API_KEY) {
    try {
      const { default: OpenAI } = await import('openai');
      const openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
      });

      const prompt = `다음 콘텐츠를 분석하여 메타데이터를 생성해주세요.

타입: ${type}
제목: ${data.title || ''}
내용:
${content.substring(0, 2000)}...

다음 형식의 JSON을 반환해주세요:
{
  "tldr": "2-3문장으로 요약",
  "tags": ["태그1", "태그2", "태그3"],
  "sentiment": "positive | neutral | negative",
  "keywords": ["키워드1", "키워드2", "키워드3"]
}`;

      const completion = await openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content:
              'You are a helpful assistant that analyzes content and generates metadata in Korean.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.7,
        max_tokens: 500,
      });

      const responseText = completion.choices[0]?.message?.content || '{}';
      
      // JSON 파싱 시도
      let metadata;
      try {
        const jsonMatch = responseText.match(/```json\n([\s\S]*?)\n```/) || 
                         responseText.match(/```\n([\s\S]*?)\n```/) ||
                         [null, responseText];
        metadata = JSON.parse(jsonMatch[1] || responseText);
      } catch (e) {
        metadata = {
          tldr: content.substring(0, 150) + '...',
          tags: [],
          sentiment: 'neutral',
          keywords: [],
        };
      }

      // Front matter 업데이트
      const updatedData = {
        ...data,
        tldr: metadata.tldr || data.tldr,
        tags: metadata.tags || data.tags || [],
        meta: {
          ...data.meta,
          ...metadata,
          generated: new Date().toISOString(),
          llm_model: 'gpt-4',
        },
      };

      // 파일 저장
      const updatedContent = matter.stringify(content, updatedData);
      fs.writeFileSync(filePath, updatedContent);
      console.log(`✅ File updated with LLM metadata: ${filePath}`);
    } catch (error) {
      console.warn('⚠️  LLM API error:', error);
    }
  } else {
    console.warn('⚠️  OPENAI_API_KEY not set, skipping LLM processing');
  }
}

// CLI 인자 파싱
const args = process.argv.slice(2);
if (args.length < 2) {
  console.log('Usage: npm run process-content [type] [slug]');
  console.log('Example: npm run process-content diary 2024-01-15-my-diary');
  process.exit(1);
}

const [type, slug] = args;

if (!getAllContentTypes().includes(type as any)) {
  console.error(`❌ Invalid type: ${type}`);
  console.error(`Valid types: ${getAllContentTypes().join(', ')}`);
  process.exit(1);
}

processContent(type, slug).catch((error) => {
  console.error('❌ Error:', error);
  process.exit(1);
});
