import { Story, Chapter } from "@readdly/shared-types";

/**
 * StoryPage interface represents a single readable page in the UI
 * Maps from backend Chapter structure
 */
export interface StoryPage {
  pageNumber: number;
  text: string;
  image: string | null;
  alt: string;
  hasRiddle: boolean;
}

/**
 * Transform a Story object into an array of StoryPage objects for UI consumption
 * Each chapter becomes a page
 *
 * @param story - The Story object from backend
 * @returns Array of StoryPage objects sorted by chapter order
 */
export function transformStoryToPages(story: Story): StoryPage[] {
  if (!story.chapters || story.chapters.length === 0) {
    return [];
  }

  // Sort chapters by order to ensure correct page sequence
  const sortedChapters = [...story.chapters].sort((a, b) => a.order - b.order);

  return sortedChapters.map((chapter: Chapter, index: number) => ({
    pageNumber: index + 1,
    text: chapter.content || "",
    image: chapter.imageUrl,
    alt: `Page ${index + 1}`,
    hasRiddle: !!chapter.challenge,
  }));
}

/**
 * Get the chapter object for a specific page number
 *
 * @param story - The Story object
 * @param pageNumber - The page number (1-indexed)
 * @returns The Chapter object or undefined
 */
export function getChapterByPageNumber(
  story: Story,
  pageNumber: number,
): Chapter | undefined {
  if (!story.chapters) return undefined;

  // Sort and adjust for 1-indexing
  const sortedChapters = [...story.chapters].sort((a, b) => a.order - b.order);

  return sortedChapters[pageNumber - 1];
}

/**
 * Map ChallengeType enum values to RiddleInteractive's expected type format
 */
export function mapChallengeTypeToRiddleType(
  challengeType: string,
): "text" | "multiple-choice" {
  switch (challengeType) {
    case "MULTIPLE_CHOICE":
      return "multiple-choice";
    case "RIDDLE":
      return "text";
    case "TRUE_FALSE":
    case "CHOOSE_ENDING":
    case "MORAL_DECISION":
      return "multiple-choice";
    default:
      return "text";
  }
}
