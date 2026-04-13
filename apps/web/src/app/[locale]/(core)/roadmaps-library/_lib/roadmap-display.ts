import { Roadmap } from '@readdly/shared-types';

/**
 * Display format for roadmap cards
 * Transformed from Roadmap type for UI rendering
 */
export interface RoadmapDisplay {
  id: string;
  title: string;
  themeName: string;
  category: string;
  themeDescription: string;
  coverImage: string;
  readingLevel: string;
  ageGroup: Roadmap["ageGroup"];
  worldCount: number;
  storyCount: number;
  theme: Roadmap["theme"];
  translations?: Roadmap["translations"];
}

/**
 * Transforms a Roadmap object into display format for the UI
 * Maps theme data to display properties, counts worlds/stories
 */
export function transformRoadmapForDisplay(roadmap: Roadmap): RoadmapDisplay {
  const storyCount = roadmap.worlds!.reduce(
    (total, world) => total + (world.stories?.length ?? 0),
    0
  );

  return {
    id: roadmap.id,
    title: roadmap.title || "Untitled Roadmap",
    themeName: roadmap.theme!.name,
    category: roadmap.theme!.name, 
    themeDescription: roadmap.theme!.description || '',
    coverImage: roadmap.theme!.imageUrl || '/images/placeholder-roadmap.jpg',
    readingLevel: roadmap.readingLevel,
    ageGroup: roadmap.ageGroup,
    worldCount: roadmap.worlds!.length,
    storyCount,
    theme: roadmap.theme,
    translations: roadmap.translations,
  };
}

