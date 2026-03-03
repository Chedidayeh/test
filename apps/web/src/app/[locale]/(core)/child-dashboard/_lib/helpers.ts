// helpers functions for child progress in roadmap
import { ChildProfile, Story, World, Progress, ProgressStatus, Roadmap } from "@shared/types";

/**
 * Get progress record for a specific story
 */
export function getStoryProgress(
  childProfile: ChildProfile,
  storyId: string
): Progress | undefined {
  if (!childProfile.progress || !Array.isArray(childProfile.progress)) {
    return undefined;
  }
  return childProfile.progress.find((p) => p.storyId === storyId);
}

/**
 * Map progress status to display status
 * Returns: locked, not_started, in_progress, or completed
 */
export function getStoryStatus(
  story: Story,
  world: World,
  childProfile: ChildProfile
): "locked" | "not_started" | "in_progress" | "completed" {

  const progress = getStoryProgress(childProfile, story.id);

  if (!progress) {
    return "not_started";
  }

  if (progress.status === ProgressStatus.COMPLETED) {
    return "completed";
  }

  if (progress.status === ProgressStatus.IN_PROGRESS) {
    return "in_progress";
  }

  return "not_started";
}

/**
 * Calculate completion percentage based on the last chapter read
 * Uses gameSession.chapterId which represents the last chapter the child has read
 */
export function calculateCompletionPercentage(
  progress: Progress | undefined,
  story: Story
): number {
  // Handle edge cases
  if (!progress || !story.chapters || story.chapters.length === 0) {
    return 0;
  }

  // Get game session to access the last chapter read
  const gameSession = progress.gameSession;
  if (!gameSession || !gameSession.chapterId) {
    return 0;
  }

  // Find the last chapter read by its ID
  const lastChapter = story.chapters.find(
    (chapter) => chapter.id === gameSession.chapterId
  );

  // If chapter is not found, return 0
  if (!lastChapter) {
    return 0;
  }

  // chapters reached = order property of the chapter
  const chaptersReached = lastChapter.order;

  // Ensure chaptersReached doesn't exceed total chapters
  const totalChapters = story.chapters.length;
  const validChaptersReached = Math.min(chaptersReached, totalChapters);

  // Calculate completion percentage
  return Math.round((validChaptersReached / totalChapters) * 100);
}

/**
 * Count challenges in a story
 */
export function countChallengesInStory(story: Story): number {
  if (!story.chapters || !Array.isArray(story.chapters)) {
    return 0;
  }
  return story.chapters.reduce((count, chapter) => {
    return count + (chapter.challenge ? 1 : 0);
  }, 0);
}



/**
 * Check if all stories in a specific world are completed
 */
export function isWorldCompleted(
  world: World,
  childProfile: ChildProfile
): boolean {
  if (!childProfile.progress || childProfile.progress.length === 0) {
    return false;
  }

  // Get all stories in this world
  const worldStoryIds = world.stories.map((s) => s.id);

  // Check if all stories in this world are completed
  return worldStoryIds.every((storyId) => {
    const progress = childProfile.progress.find((p) => p.storyId === storyId);
    return progress && progress.status === ProgressStatus.COMPLETED;
  });
}

/**
 * Check if the previous world (by order) is completed
 */
export function isPreviousWorldCompleted(
  roadmap: Roadmap,
  currentWorld: World,
  childProfile: ChildProfile
): boolean {
  // If this is the first world, it's not locked by previous world
  if (currentWorld.order === 1) {
    return true;
  }

  // Find the previous world
  const previousWorld = roadmap.worlds.find(
    (w) => w.order === currentWorld.order - 1
  );

  if (!previousWorld) {
    return true; // If previous world doesn't exist, allow access
  }

  return isWorldCompleted(previousWorld, childProfile);
}

/**
 * Get all enriched stories for a world with cross-world locking
 */
export function getEnrichedStoriesForWorld(
  world: World,
  roadmap: Roadmap,
  childProfile: ChildProfile
) {
  return world.stories.map((story) =>
    enrichStoryWithProgress(story, world, roadmap, childProfile)
  );
}

/**
 * Enrich story with progress data, including cross-world locking logic
 */
export function enrichStoryWithProgress(
  story: Story,
  world: World,
  roadmap: Roadmap,
  childProfile: ChildProfile
) {
  const progress = getStoryProgress(childProfile, story.id);
  let status: "locked" | "not_started" | "in_progress" | "completed";

  // SPECIAL HANDLING for first story of any world:
  // First story of world 1: always unlocked (override star requirement)
  // First story of world N (N > 1): unlocked if previous world completed (override star requirement)
  if (story.order === 1) {
    if (world.order === 1) {
      // First story of first world - always available
      status = !progress
        ? "not_started"
        : progress.status === ProgressStatus.COMPLETED
          ? "completed"
          : progress.status === ProgressStatus.IN_PROGRESS
            ? "in_progress"
            : "not_started";
    } else if (isPreviousWorldCompleted(roadmap, world, childProfile)) {
      // First story of later world - unlock if previous world is completed
      status = !progress
        ? "not_started"
        : progress.status === ProgressStatus.COMPLETED
          ? "completed"
          : progress.status === ProgressStatus.IN_PROGRESS
            ? "in_progress"
            : "not_started";
    } else {
      // Previous world not completed - lock this story
      status = "locked";
    }
  } else {
    // For non-first stories, use normal status logic (includes star requirement check)
    status = getStoryStatus(story, world, childProfile);
  }

  const completionPercentage = calculateCompletionPercentage(progress, story);
  const challengeCount = countChallengesInStory(story);

  return {
    ...story,
    status,
    completionPercentage,
    challengeCount,
    progress,
    // Map friendly names for UI
    name: story.title,
  };
}