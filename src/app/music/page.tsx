import { getContentByType } from '@/lib/content-server';
import MusicPageClient from '@/components/music/MusicPageClient';

export default function MusicPage() {
  const contents = getContentByType('music');

  return <MusicPageClient initialContents={contents} />;
}
