import type { Metadata } from 'next';
import StoryLibraryInteractive from './_components/StoryLibraryInteractive';

export const metadata: Metadata = {
  title: 'Story Library - Readly',
  description: 'Discover and explore a magical collection of interactive stories for children. Browse by category, reading level, and progress status to find your next adventure.',
};

export default function StoryLibraryPage() {
  return <StoryLibraryInteractive />;
}