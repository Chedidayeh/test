import { Roadmap } from '@shared/types';

/**
 * Display format for roadmap cards
 * Transformed from Roadmap type for UI rendering
 */
export interface RoadmapDisplay {
  id: string;
  title: string;
  description: string;
  coverImage: string;
  readingLevel: string;
  ageGroup: string;
  worldCount: number;
  storyCount: number;
}

/**
 * Transforms a Roadmap object into display format for the UI
 * Maps theme data to display properties, counts worlds/stories
 */
export function transformRoadmapForDisplay(roadmap: Roadmap): RoadmapDisplay {
  const storyCount = roadmap.worlds.reduce(
    (total, world) => total + (world.stories?.length ?? 0),
    0
  );

  return {
    id: roadmap.id,
    title: roadmap.theme.name,
    description: roadmap.theme.description || '',
    coverImage: roadmap.theme.imageUrl || '/images/placeholder-roadmap.jpg',
    readingLevel: roadmap.readingLevel,
    ageGroup: roadmap.ageGroup?.name || '',
    worldCount: roadmap.worlds.length,
    storyCount,
  };
}

