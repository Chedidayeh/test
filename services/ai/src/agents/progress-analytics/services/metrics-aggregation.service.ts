import { ChildProfile, Story, Progress, ChallengeAttempt, PerformanceByType, PerformanceByDifficulty, ImprovementTrend, AggregatedMetrics } from "@shared/src/types";
import { logger } from "../../../lib/logger";

/**
 * MetricsAggregationService
 *
 * Calculates comprehensive metrics from a child's reading progress data.
 * Provides 12+ metrics including success rates, performance patterns,
 * and improvement trends.
 */
export class MetricsAggregationService {
  /**
   * Calculate total number of stories completed by the child
   * @param child ChildProfile with progress data
   * @returns number of completed stories
   */
  private calculateTotalStoriesCompleted(child: ChildProfile): number {
    if (!child.progress || child.progress.length === 0) return 0;

    return child.progress.filter(
      (p: Progress) => p.status === "COMPLETED"
    ).length;
  }

  /**
   * Calculate total number of challenge attempts across all stories
   * @param child ChildProfile with progress data
   * @returns total challenge attempts
   */
  private calculateTotalChallengesAttempted(child: ChildProfile): number {
    if (!child.progress || child.progress.length === 0) return 0;

    let totalAttempts = 0;
    child.progress.forEach((progress: Progress) => {
      if (progress.gameSession?.challengeAttempts) {
        totalAttempts += progress.gameSession.challengeAttempts.length;
      }
    });

    return totalAttempts;
  }

  /**
   * Calculate total number of challenges solved correctly
   * @param child ChildProfile with progress data
   * @returns total challenges solved
   */
  private calculateTotalChallengesSolved(child: ChildProfile): number {
    if (!child.progress || child.progress.length === 0) return 0;

    let totalSolved = 0;
    child.progress.forEach((progress: Progress) => {
      if (progress.gameSession?.challengeAttempts) {
        totalSolved += progress.gameSession.challengeAttempts.filter(
          (ca: ChallengeAttempt) => ca.isCorrect
        ).length;
      }
    });

    return totalSolved;
  }

  /**
   * Calculate success rate (solved / attempted)
   * @param attempted Total challenges attempted
   * @param solved Total challenges solved
   * @returns success rate as percentage (0-100)
   */
  private calculateSuccessRate(attempted: number, solved: number): number {
    if (attempted === 0) return 0;
    return Math.round((solved / attempted) * 100);
  }

  /**
   * Calculate average number of attempts per challenge
   * @param child ChildProfile with progress data
   * @param totalAttempts Total number of attempts
   * @returns average attempts per challenge
   */
  private calculateAverageAttemptsPerChallenge(
    child: ChildProfile,
    totalAttempts: number
  ): number {
    const totalChallengesCount = this.getTotalUniqueChallengesCount(child);
    if (totalChallengesCount === 0) return 0;

    return Math.round((totalAttempts / totalChallengesCount) * 100) / 100;
  }

  /**
   * Get total unique challenges count across all progress records
   * @param child ChildProfile with progress data
   * @returns count of unique challenges
   */
  private getTotalUniqueChallengesCount(child: ChildProfile): number {
    const challengeIds = new Set<string>();
    if (child.progress) {
      child.progress.forEach((progress: Progress) => {
        if (progress.gameSession?.challengeAttempts) {
          progress.gameSession.challengeAttempts.forEach(
            (ca: ChallengeAttempt) => {
              challengeIds.add(ca.challengeId);
            }
          );
        }
      });
    }
    return challengeIds.size;
  }

  /**
   * Calculate total time spent reading (in milliseconds)
   * @param child ChildProfile with progress data
   * @returns total time spent in milliseconds
   */
  private calculateTotalTimeSpent(child: ChildProfile): number {
    if (!child.progress || child.progress.length === 0) return 0;

    return child.progress.reduce(
      (sum: number, p: Progress) => sum + (p.totalTimeSpent || 0),
      0
    );
  }

  /**
   * Calculate hint dependency rate (hints used / total challenges)
   * @param child ChildProfile with progress data
   * @param totalAttempts Total challenges attempted
   * @returns hint dependency rate as percentage (0-100)
   */
  private calculateHintDependencyRate(
    child: ChildProfile,
    totalAttempts: number
  ): number {
    if (totalAttempts === 0) return 0;

    let hintsUsed = 0;
    if (child.progress) {
      child.progress.forEach((progress: Progress) => {
        if (progress.gameSession?.challengeAttempts) {
          hintsUsed += progress.gameSession.challengeAttempts.filter(
            (ca: ChallengeAttempt) => ca.usedHints > 0
          ).length;
        }
      });
    }

    return Math.round((hintsUsed / totalAttempts) * 100);
  }

  /**
   * Calculate total stars earned
   * @param child ChildProfile with totalStars
   * @returns total stars earned
   */
  private calculateStarsEarned(child: ChildProfile): number {
    return child.totalStars || 0;
  }

  /**
   * Calculate total possible stars for all challenges attempted
   * @param child ChildProfile with progress data
   * @returns total possible stars
   */
  private calculateStarsPossible(
    child: ChildProfile,
    stories: Story[]
  ): number {
    if (!child.progress || child.progress.length === 0) return 0;

    let totalPossible = 0;

    child.progress.forEach((progress: Progress) => {
      const story = stories.find((s: Story) => s.id === progress.storyId);
      if (story && story.chapters) {
        story.chapters.forEach((chapter) => {
          if (chapter.challenge) {
            totalPossible += chapter.challenge.baseStars || 0;
          }
        });
      }
    });

    return totalPossible;
  }

  /**
   * Calculate star achievement rate (earned / possible)
   * @param earned Stars earned
   * @param possible Stars possible
   * @returns achievement rate as percentage (0-100)
   */
  private calculateStarAchievementRate(
    earned: number,
    possible: number
  ): number {
    if (possible === 0) return 0;
    return Math.round((earned / possible) * 100);
  }

  /**
   * Calculate performance breakdown by challenge type
   * @param child ChildProfile with progress data
   * @param stories Stories with challenge types
   * @returns array of performance by type
   */
  private calculatePerformanceByType(
    child: ChildProfile,
    stories: Story[]
  ): PerformanceByType[] {
    const typeMap = new Map<
      string,
      {
        attempted: number;
        solved: number;
      }
    >();

    if (child.progress) {
      child.progress.forEach((progress: Progress) => {
        if (progress.gameSession?.challengeAttempts) {
          progress.gameSession.challengeAttempts.forEach(
            (attempt: ChallengeAttempt) => {
              const challenge = this.findChallengeById(
                attempt.challengeId,
                stories
              );
              const type = challenge?.type || "UNKNOWN";

              if (!typeMap.has(type)) {
                typeMap.set(type, { attempted: 0, solved: 0 });
              }

              const stats = typeMap.get(type)!;
              stats.attempted += 1;
              if (attempt.isCorrect) {
                stats.solved += 1;
              }
            }
          );
        }
      });
    }

    return Array.from(typeMap.entries()).map(([type, stats]) => ({
      type,
      attempted: stats.attempted,
      solved: stats.solved,
      successRate: this.calculateSuccessRate(
        stats.attempted,
        stats.solved
      ),
      averageAttempts: Math.round(
        (stats.attempted / (this.getTotalUniqueChallengesCount(child) || 1)) *
          100
      ) / 100,
    }));
  }

  /**
   * Calculate performance breakdown by story difficulty
   * @param child ChildProfile with progress data
   * @param stories Stories with difficulty levels
   * @returns array of performance by difficulty
   */
  private calculatePerformanceByDifficulty(
    child: ChildProfile,
    stories: Story[]
  ): PerformanceByDifficulty[] {
    const difficultyMap = new Map<
      string,
      {
        stories: number;
        attempted: number;
        solved: number;
      }
    >();

    if (child.progress) {
      child.progress.forEach((progress: Progress) => {
        const story = stories.find((s: Story) => s.id === progress.storyId);
        const difficulty = this.convertNumericDifficultyToString(
          story?.difficulty
        );

        if (!difficultyMap.has(difficulty)) {
          difficultyMap.set(difficulty, {
            stories: 0,
            attempted: 0,
            solved: 0,
          });
        }

        const stats = difficultyMap.get(difficulty)!;
        stats.stories += 1;

        if (progress.gameSession?.challengeAttempts) {
          progress.gameSession.challengeAttempts.forEach(
            (attempt: ChallengeAttempt) => {
              stats.attempted += 1;
              if (attempt.isCorrect) {
                stats.solved += 1;
              }
            }
          );
        }
      });
    }

    return Array.from(difficultyMap.entries()).map(([difficulty, stats]) => ({
      difficulty: difficulty as "EASY" | "MEDIUM" | "HARD",
      storiesRead: stats.stories,
      successRate: this.calculateSuccessRate(
        stats.attempted,
        stats.solved
      ),
      averageAttempts:
        Math.round((stats.attempted / stats.stories) * 100) / 100,
    }));
  }

  /**
   * Calculate improvement trend comparing first and last quarters
   * @param child ChildProfile with progress data
   * @returns improvement trend data
   */
  private calculateImprovement(child: ChildProfile): ImprovementTrend {
    if (!child.progress || child.progress.length === 0) {
      return {
        firstQuarterSuccessRate: 0,
        lastQuarterSuccessRate: 0,
        improvementPercentage: 0,
        totalProgress: 0,
      };
    }

    // Sort progress by date
    const sortedProgress = [...child.progress].sort(
      (a, b) =>
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );

    const totalRecords = sortedProgress.length;
    const quarterSize = Math.ceil(totalRecords / 4);

    // First quarter
    const firstQuarterRecords = sortedProgress.slice(0, quarterSize);
    const firstQuarterStats = this.calculateQuarterStats(firstQuarterRecords);

    // Last quarter
    const lastQuarterRecords = sortedProgress.slice(
      Math.max(0, totalRecords - quarterSize)
    );
    const lastQuarterStats = this.calculateQuarterStats(lastQuarterRecords);

    const improvement =
      lastQuarterStats.successRate - firstQuarterStats.successRate;

    return {
      firstQuarterSuccessRate: firstQuarterStats.successRate,
      lastQuarterSuccessRate: lastQuarterStats.successRate,
      improvementPercentage: improvement,
      totalProgress: totalRecords,
    };
  }

  /**
   * Calculate success rate for a quarter of progress records
   * @param progressList Array of progress records for a quarter
   * @returns success rate
   */
  private calculateQuarterStats(
    progressList: Progress[]
  ): {
    successRate: number;
  } {
    let attempted = 0;
    let solved = 0;

    progressList.forEach((progress: Progress) => {
      if (progress.gameSession?.challengeAttempts) {
        progress.gameSession.challengeAttempts.forEach(
          (attempt: ChallengeAttempt) => {
            attempted += 1;
            if (attempt.isCorrect) {
              solved += 1;
            }
          }
        );
      }
    });

    return {
      successRate: this.calculateSuccessRate(attempted, solved),
    };
  }

  /**
   * Helper: Convert numeric difficulty (1-5) to string difficulty level
   * @param numericDifficulty Difficulty number from Story (1-5)
   * @returns difficulty level string
   */
  private convertNumericDifficultyToString(
    numericDifficulty: number | undefined
  ): "EASY" | "MEDIUM" | "HARD" {
    if (!numericDifficulty) return "MEDIUM";
    
    if (numericDifficulty <= 2) return "EASY";
    if (numericDifficulty <= 3) return "MEDIUM";
    return "HARD";
  }

  /**
   * Helper: Find a challenge by ID across all stories
   * @param challengeId Challenge ID to search for
   * @param stories Array of stories
   * @returns Challenge object or undefined
   */
  private findChallengeById(challengeId: string, stories: Story[]) {
    for (const story of stories) {
      if (story.chapters) {
        for (const chapter of story.chapters) {
          if (chapter.challenge) {
            const found = chapter.challenge.id === challengeId ? chapter.challenge : undefined;
            if (found) return found;
          }
        }
      }
    }
    return undefined;
  }

  /**
   * Get the last activity date from progress records
   * @param child ChildProfile with progress data
   * @returns last activity date
   */
  private getLastActivityDate(child: ChildProfile): Date {
    if (!child.progress || child.progress.length === 0) {
      return new Date();
    }

    return new Date(
      Math.max(
        ...child.progress.map((p: Progress) =>
          new Date(p.updatedAt).getTime()
        )
      )
    );
  }

  /**
   * Main aggregation method: Calculate all metrics for a child
   * @param child ChildProfile with all data
   * @param stories Story[] that the child has read
   * @returns AggregatedMetrics with all calculations
   */
  public aggregateChildMetrics(
    child: ChildProfile,
    stories: Story[]
  ): AggregatedMetrics {
    try {
      logger.debug("[MetricsAggregation] Starting aggregation for child", {
        childId: child.id,
        progressCount: child.progress?.length || 0,
        storiesCount: stories.length,
      });

      // Calculate all individual metrics
      const totalStoriesCompleted = this.calculateTotalStoriesCompleted(child);
      const totalChallengesAttempted =
        this.calculateTotalChallengesAttempted(child);
      const totalChallengesSolved = this.calculateTotalChallengesSolved(child);
      const successRate = this.calculateSuccessRate(
        totalChallengesAttempted,
        totalChallengesSolved
      );
      const averageAttemptsPerChallenge =
        this.calculateAverageAttemptsPerChallenge(
          child,
          totalChallengesAttempted
        );
      const totalTimeSpent = this.calculateTotalTimeSpent(child);
      const hintDependencyRate = this.calculateHintDependencyRate(
        child,
        totalChallengesAttempted
      );
      const starsEarned = this.calculateStarsEarned(child);
      const starsPossible = this.calculateStarsPossible(child, stories);
      const starAchievementRate = this.calculateStarAchievementRate(
        starsEarned,
        starsPossible
      );
      const performanceByType = this.calculatePerformanceByType(
        child,
        stories
      );
      const performanceByDifficulty = this.calculatePerformanceByDifficulty(
        child,
        stories
      );
      const improvementTrend = this.calculateImprovement(child);
      const lastActivityDate = this.getLastActivityDate(child);

      const metrics: AggregatedMetrics = {
        totalStoriesCompleted,
        totalChallengesAttempted,
        totalChallengesSolved,
        successRate,
        averageAttemptsPerChallenge,
        totalTimeSpent,
        hintDependencyRate,
        starsEarned,
        starsPossible,
        starAchievementRate,
        performanceByType,
        performanceByDifficulty,
        improvementTrend,
        lastActivityDate,
      };

      logger.info(
        "[MetricsAggregation] Successfully aggregated metrics for child",
        {
          childId: child.id,
          totalStoriesCompleted,
          totalChallengesAttempted,
          totalChallengesSolved,
          successRate,
          hintDependencyRate,
          starAchievementRate,
        }
      );

      return metrics;
    } catch (error) {
      logger.error("[MetricsAggregation] Error aggregating metrics", {
        childId: child.id,
        error: String(error),
        stack: error instanceof Error ? error.stack : "N/A",
      });

      throw error;
    }
  }
}

export const metricsAggregationService = new MetricsAggregationService();
