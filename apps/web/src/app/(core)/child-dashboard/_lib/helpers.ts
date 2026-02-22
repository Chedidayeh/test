// helpers functions for child progress in roadmap
import { ChildProfile, Story, World, Progress, ProgressStatus } from "@shared/types";

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
  // Check if world is locked
  const totalStars = childProfile.totalStars ?? 0;
  if (world.locked && totalStars < world.requiredStarCount) {
    return "locked";
  }

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
 * Calculate completion percentage based on correct answers
 */
export function calculateCompletionPercentage(
  progress: Progress | undefined
): number {
  if (!progress || progress.totalAnswers === 0) {
    return 0;
  }
  return Math.round((progress.correctAnswers / progress.totalAnswers) * 100);
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
 * Enrich story with progress data
 */
export function enrichStoryWithProgress(
  story: Story,
  world: World,
  childProfile: ChildProfile
) {
  const progress = getStoryProgress(childProfile, story.id);
  const status = getStoryStatus(story, world, childProfile);
  const completionPercentage = calculateCompletionPercentage(progress);
  const totalStars = childProfile.totalStars ?? 0;
  const isUnlocked = !(
    world.locked && totalStars < world.requiredStarCount
  );
  const challengeCount = countChallengesInStory(story);

  return {
    ...story,
    status,
    completionPercentage,
    isUnlocked,
    challengeCount,
    progress,
    // Map friendly names for UI
    name: story.title,
  };
}

/**
 * Get all enriched stories for a world
 */
export function getEnrichedStoriesForWorld(
  world: World,
  childProfile: ChildProfile
) {
  return world.stories.map((story) =>
    enrichStoryWithProgress(story, world, childProfile)
  );
}