/**
 * Progress Analysis utilities for level and badge progression
 * Analyzes child's current progress and determines next level/badge acquisition
 */

import { ChildBadge, Badge, Level } from "@shared/types";

export interface LevelProgressAnalysis {
  currentLevel: number;
  currentLevelStarsRequired: number;
  nextLevel: Level | null;
  nextLevelNumber: number;
  nextLevelStarsRequired: number;
  totalStarsEarned: number;
  starsNeededForNextLevel: number;
  willReachNextLevel: boolean;
  progressPercentage: number;
  currentBadges: ChildBadge[];
  nextBadge: Badge | null;
  willEarnNextBadge: boolean;
}

/**
 * Analyze child's level and badge progression
 * @param currentLevel - Child's current level number
 * @param totalStars - Total stars earned by child
 * @param earnedBadges - Array of badges earned by child
 * @param levels - All available levels
 * @param badges - All available badges
 * @returns Analysis object with level and badge progression info
 */
export function analyzeLevelProgress(
  currentLevel: number,
  totalStars: number,
  earnedBadges: ChildBadge[],
  levels: Level[],
  badges: Badge[],
): LevelProgressAnalysis {
  // Sort levels by levelNumber
  const sortedLevels = [...levels].sort((a, b) => a.levelNumber - b.levelNumber);

  // Find current level info
  const currentLevelInfo = sortedLevels.find((l) => l.levelNumber === currentLevel);
  const currentLevelStarsRequired = currentLevelInfo?.requiredStars || 0;

  // Find next level info
  const nextLevelInfo = sortedLevels.find((l) => l.levelNumber === currentLevel + 1);
  const nextLevelNumber = nextLevelInfo?.levelNumber || currentLevel + 1;
  const nextLevelStarsRequired = nextLevelInfo?.requiredStars || 0;

  // Calculate if child will reach next level
  const willReachNextLevel = totalStars >= nextLevelStarsRequired;
  const starsNeededForNextLevel = Math.max(0, nextLevelStarsRequired - totalStars);

  // Calculate progress percentage
  const progressPercentage =
    nextLevelStarsRequired > 0
      ? Math.min(100, (totalStars / nextLevelStarsRequired) * 100)
      : 100;

  // Find next badge
  const nextBadge = nextLevelInfo
    ? badges.find((b) => b.levelId === nextLevelInfo.id) || null
    : null;

  // Check if child will earn next badge
  const willEarnNextBadge = willReachNextLevel && nextBadge !== null;

  return {
    currentLevel,
    currentLevelStarsRequired,
    nextLevel: nextLevelInfo || null,
    nextLevelNumber,
    nextLevelStarsRequired,
    totalStarsEarned: totalStars,
    starsNeededForNextLevel,
    willReachNextLevel,
    progressPercentage,
    currentBadges: earnedBadges,
    nextBadge,
    willEarnNextBadge,
  };
}

/**
 * Get formatted progress summary
 * @param analysis - Level progress analysis object
 * @returns Human-readable progress summary
 */
export function getProgressSummary(analysis: LevelProgressAnalysis): string {
  if (analysis.willReachNextLevel) {
    const badgeText = analysis.willEarnNextBadge ? ` and earn the "${analysis.nextBadge?.name}" badge` : "";
    return `Congratulations! You've reached Level ${analysis.nextLevelNumber}${badgeText}!`;
  }

  return `You need ${analysis.starsNeededForNextLevel} more stars to reach Level ${analysis.nextLevelNumber}`;
}

/**
 * Calculate stars needed to reach a specific level
 * @param targetLevel - Target level number
 * @param currentStars - Current stars earned
 * @param levels - All available levels
 * @returns Stars needed to reach target level
 */
export function starsNeededForLevel(
  targetLevel: number,
  currentStars: number,
  levels: Level[],
): number {
  const targetLevelInfo = levels.find((l) => l.levelNumber === targetLevel);
  if (!targetLevelInfo) return 0;

  return Math.max(0, targetLevelInfo.requiredStars - currentStars);
}
