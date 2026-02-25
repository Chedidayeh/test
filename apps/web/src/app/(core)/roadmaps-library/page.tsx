import type { Metadata } from 'next';
import RoadmapsLibrary from './_components/RoadmapsLibrary';
import { getRoadmaps } from '@/src/lib/content-service/server-api';

export const metadata: Metadata = {
  title: 'Story Library - Readly',
  description: 'Discover and explore a magical collection of interactive stories for children. Browse by category, reading level, and progress status to find your next adventure.',
};

export default async function page() {
  
  const roadmaps = await getRoadmaps();
  return <RoadmapsLibrary roadmaps={roadmaps} />;
}