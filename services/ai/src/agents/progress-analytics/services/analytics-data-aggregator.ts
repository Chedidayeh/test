import { PrismaClient } from "@prisma/client";
import { logger } from "../../../lib/logger";
import {
  ChildProfile,
  Story,
  Progress,
  GameSession,
  ChallengeAttempt,
  ChallengeType,
  ReadingLevel,
  ReadingEngagementMetrics,
  LearningProgressMetrics,
  ComprehensionMetrics,
  ReportMetrics,
  ProgressReport,
  ChallengeStatus,
} from "@shared/src/types";
import {
  EnrichedReadingContext,
  EnrichedStory,
  EnrichedChapter,
  EnrichedChallenge,
} from "../types/enriched-context.types";

/**
 * AnalyticsDataAggregator
 *
 * Transforms raw child progress data (childProfile + storiesData) into structured metrics
 * for the weekly progress report. Calculates:
 *
 * - Reading Engagement: time spent, session frequency, consistency patterns
 * - Learning Progress: story completion, level progression, stars earned
 * - Comprehension: challenge success rates by difficulty, hints usage
 * - Reading Patterns: theme preferences, difficulty progression, timing
 */
export class AnalyticsDataAggregator {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
  }

  /**
   * Aggregate all metrics from child profile and stories data
   * Entry point for the aggregation workflow
   */
  async aggregateMetrics(
    childProfile: ChildProfile,
    storiesData: Story[],
    periodStart: Date,
    periodEnd: Date,
  ): Promise<ReportMetrics> {
    try {
      logger.info("[Aggregator] Starting metrics aggregation", {
        childProfileId: childProfile.id,
        childName: childProfile.name,
        periodStart,
        periodEnd,
      });

      // Validate input data
      this.validateInputData(childProfile, storiesData);



      logger.debug("[Aggregator] Period progress records", {
        childProfileId: childProfile.id,
        recordsCount: childProfile.progress.length,
      });

      // Calculate metrics
      const reading = this.calculateReadingEngagement(childProfile.progress);
      const learning = this.calculateLearningProgress(
        childProfile.progress,
        childProfile,
      );
      const comprehension = this.calculateComprehension(childProfile.progress);

      const metrics: ReportMetrics = {
        reading,
        learning,
        comprehension,
      };

      logger.info("[Aggregator] Metrics aggregation completed", {
        childProfileId: childProfile.id,
        metrics: {
          readingMetrics: {
            sessionsCount: reading.totalSessionsCount,
            totalMinutes: reading.totalSessionDurationMinutes,
            consistency: reading.consistencyScore,
          },
          learningMetrics: {
            storiesCompleted: learning.storiesCompletedCount,
            completionRate: learning.completionRate,
            starsEarned: learning.totalStarsEarned,
          },
          comprehensionMetrics: {
            challengesAttempted: comprehension.totalChallengesAttempted,
            successRate: comprehension.overallSuccessRate,
          },
        },
      });

      return metrics;
    } catch (error) {
      logger.error("[Aggregator] Error during metrics aggregation", {
        childProfileId: childProfile.id,
        error: String(error),
        stack: error instanceof Error ? error.stack : "N/A",
      });
      throw error;
    }
  }

  /**
   * ===================================================================
   * READING ENGAGEMENT METRICS
   * ===================================================================
   */
  private calculateReadingEngagement(
    periodProgress: Progress[],
  ): ReadingEngagementMetrics {
    // Collect all game sessions within the period
    const gameSessions: GameSession[] = [];

    periodProgress.forEach((progress) => {
      if (progress.gameSession) {
        gameSessions.push(progress.gameSession);
      }
    });

    const totalSessionsCount = gameSessions.length;
    const totalSessionDurationSeconds = gameSessions.reduce(
      (sum, session) => sum + (session.elapsedTimeSeconds || 0),
      0,
    );
    const totalSessionDurationMinutes = Math.round(
      totalSessionDurationSeconds / 60,
    );
    const averageSessionDurationMinutes =
      totalSessionsCount > 0
        ? Math.round(totalSessionDurationMinutes / totalSessionsCount)
        : 0;

    // Calculate reading frequency (sessions per day)
    const days = this.getDaysBetween(periodProgress);
    const sessionsPerDay = days > 0 ? totalSessionsCount / days : 0;

    // Classify reading frequency
    let readingFrequency: "daily" | "regular" | "occasional" | "sparse";
    if (sessionsPerDay >= 1) {
      readingFrequency = "daily";
    } else if (sessionsPerDay >= 0.5) {
      readingFrequency = "regular"; // 3-4 sessions per week
    } else if (sessionsPerDay >= 0.2) {
      readingFrequency = "occasional"; // 1-2 sessions per week
    } else {
      readingFrequency = "sparse";
    }

    // Calculate consistency score (0-100)
    // Based on how evenly sessions are distributed across days
    const consistencyScore = this.calculateConsistencyScore(
      gameSessions,
      days,
    );

    return {
      totalSessionsCount,
      totalSessionDurationMinutes,
      averageSessionDurationMinutes,
      readingFrequency,
      sessionsPerDay: Math.round(sessionsPerDay * 10) / 10,
      consistencyScore,
    };
  }

  /**
   * ===================================================================
   * LEARNING PROGRESS METRICS
   * ===================================================================
   */
  private calculateLearningProgress(
    periodProgress: Progress[],
    childProfile: ChildProfile,
  ): LearningProgressMetrics {
    const storiesStartedCount = periodProgress.length;
    const storiesCompletedCount = periodProgress.filter(
      (p) => p.status === "COMPLETED",
    ).length;
    const completionRate =
      storiesStartedCount > 0
        ? Math.round((storiesCompletedCount / storiesStartedCount) * 100)
        : 0;

    // Stars earned this week from game sessions
    const totalStarsEarned = periodProgress.reduce((sum, progress) => {
      if (progress.gameSession) {
        return sum + (progress.gameSession.starsEarned || 0);
      }
      return sum;
    }, 0);

    // Determine difficulty progression trend
    const avgDifficultyProgression = this.calculateDifficultyProgression(
      periodProgress,
    );

    return {
      storiesStartedCount,
      storiesCompletedCount,
      completionRate,
      currentLevel: childProfile.currentLevel || 1,
      totalStarsEarned,
      avgDifficultyProgression,
    };
  }

  /**
   * ===================================================================
   * COMPREHENSION METRICS
   * ===================================================================
   */
  private calculateComprehension(
    periodProgress: Progress[],
  ): ComprehensionMetrics {
    const challengeAttempts: ChallengeAttempt[] = [];
    const challengeTypesSet = new Set<ChallengeType>();

    // Collect all challenge attempts from all sessions
    periodProgress.forEach((progress) => {
      if (progress.gameSession?.challengeAttempts) {
        challengeAttempts.push(...progress.gameSession.challengeAttempts);
        progress.gameSession.challengeAttempts.forEach((attempt) => {
          challengeTypesSet.add(attempt.challengeId as any); // Placeholder, actual challenge type would come from challenge lookup
        });
      }
    });

    const totalChallengesAttempted = challengeAttempts.length;
    const totalChallengesSolved = challengeAttempts.filter(
      (a) => a.status === "SOLVED",
    ).length;
    const overallSuccessRate =
      totalChallengesAttempted > 0
        ? Math.round((totalChallengesSolved / totalChallengesAttempted) * 100)
        : 0;

    // Average hints per challenge
    const totalHintsUsed = challengeAttempts.reduce(
      (sum, a) => sum + (a.usedHints || 0),
      0,
    );
    const avgHintsUsedPerChallenge =
      totalChallengesAttempted > 0
        ? Math.round((totalHintsUsed / totalChallengesAttempted) * 10) / 10
        : 0;

    return {
      totalChallengesAttempted,
      totalChallengesSolved,
      overallSuccessRate,
      avgHintsUsedPerChallenge,
    };
  }



  /**
   * ===================================================================
   * HELPER METHODS
   * ===================================================================
   */

  /**
   * Validate that input data contains required fields
   */
  private validateInputData(childProfile: ChildProfile, storiesData: Story[]) {
    if (!childProfile) {
      throw new Error("childProfile is required");
    }

    if (!childProfile.id) {
      throw new Error("childProfile.id is required");
    }

    if (!Array.isArray(storiesData)) {
      throw new Error("storiesData must be an array");
    }

    logger.debug("[Aggregator] Input data validation passed", {
      childProfileId: childProfile.id,
      hasProgress: !!childProfile.progress?.length,
      storiesCount: storiesData.length,
    });
  }

  /**
   * Calculate consistency score based on session distribution
   * Score 0-100: higher = more consistent reading habit
   */
  private calculateConsistencyScore(
    sessions: GameSession[],
    totalDays: number,
  ): number {
    if (sessions.length === 0 || totalDays === 0) return 0;

    // Group sessions by day
    const sessionsByDay = new Map<string, number>();
    sessions.forEach((session) => {
      let dateObj: Date;
      
      if (session.startedAt) {
        // Handle both Date objects and date strings
        if (session.startedAt instanceof Date) {
          dateObj = session.startedAt;
        } else if (typeof session.startedAt === 'string') {
          dateObj = new Date(session.startedAt);
        } else {
          dateObj = new Date();
        }
      } else {
        dateObj = new Date();
      }
      
      const day = dateObj.toDateString();
      sessionsByDay.set(day, (sessionsByDay.get(day) || 0) + 1);
    });

    // Calculate standard deviation of sessions per day
    const avgSessionsPerDay = sessions.length / totalDays;
    const variance = Array.from(sessionsByDay.values()).reduce(
      (sum, count) => sum + Math.pow(count - avgSessionsPerDay, 2),
      0,
    ) / totalDays;
    const stdDev = Math.sqrt(variance);

    // Convert to consistency score (lower stdDev = higher consistency)
    // Score range: 0-100
    const consistencyScore = Math.max(
      0,
      Math.round(Math.max(0, 100 - stdDev * 10)),
    );
    return Math.min(100, consistencyScore);
  }

  /**
   * Get number of days between first and last progress record
   */
  private getDaysBetween(progress: Progress[]): number {
    if (progress.length === 0) return 1;

    const dates = progress
      .map((p) => {
        const date = p.completedAt || p.createdAt;
        // Convert string dates to Date objects
        if (typeof date === 'string') {
          return new Date(date);
        }
        return date;
      })
      .filter((d) => d instanceof Date && !isNaN((d as Date).getTime()));

    if (dates.length === 0) return 1;

    const minDate = new Date(Math.min(...dates.map((d) => (d as Date).getTime())));
    const maxDate = new Date(Math.max(...dates.map((d) => (d as Date).getTime())));

    const diffMs = maxDate.getTime() - minDate.getTime();
    const diffDays = Math.max(1, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));

    return diffDays;
  }

  /**
   * Calculate difficulty progression trend
   */
  private calculateDifficultyProgression(
    periodProgress: Progress[],
  ): "decreasing" | "stable" | "increasing" {
    if (periodProgress.length < 2) return "stable";

    // This would require having difficulty data for each story
    // For now, return stable as default
    return "stable";
  }



  /**
   * ===================================================================
   * HISTORICAL REPORTS FETCHING
   * ===================================================================
   */

  /**
   * Fetch historical progress reports for the past N weeks
   * Used to provide context to LLM for coherent report generation
   */
  async fetchHistoricalReports(
    childId: string,
    weekCount: number = 4,
  ): Promise<ProgressReport[]> {
    try {
      logger.info("[Aggregator] Fetching historical reports", {
        childId,
        weekCount,
      });

      const reports = await this.prisma.aIProgressInsight.findMany({
        where: {
          childId,
        },
        orderBy: {
          createdAt: "desc",
        },
        take: weekCount,
      });

      const parsedReports = reports
        .map((record) => {
          try {
            if (record.reportData) {
              return record.reportData as unknown as ProgressReport;
            }
            return null;
          } catch (error) {
            logger.warn(
              "[Aggregator] Failed to parse report data from record",
              {
                childId,
                recordId: record.id,
                error: String(error),
              },
            );
            return null;
          }
        })
        .filter((r) => r !== null) as ProgressReport[];

      logger.info("[Aggregator] Successfully fetched historical reports", {
        childId,
        count: parsedReports.length,
        requestedWeekCount: weekCount,
      });

      return parsedReports;
    } catch (error) {
      logger.error("[Aggregator] Error fetching historical reports", {
        childId,
        error: String(error),
        stack: error instanceof Error ? error.stack : "N/A",
      });
      throw error;
    }
  }

  /**
   * Extract summaries from historical reports for LLM context
   * Returns condensed version of key metrics and insights
   */
  extractHistoricalContext(reports: ProgressReport[]): string {
    if (reports.length === 0) {
      return "No previous reports available for this child.";
    }

    const contextParts: string[] = [];

    reports.forEach((report, index) => {
      const weekLabel = `Week ${index + 1} ago`;
      contextParts.push(`\n${weekLabel}:`);
      contextParts.push(
        `- Engagement: ${report.summary.engagementStatus}`,
      );
      contextParts.push(
        `- Progress: ${report.summary.progressTrend}`,
      );
      contextParts.push(
        `- Stories completed: ${report.metrics.learning.storiesCompletedCount}/${report.metrics.learning.storiesStartedCount}`,
      );
      contextParts.push(
        `- Challenge success rate: ${report.metrics.comprehension.overallSuccessRate}%`,
      );
    });

    return contextParts.join("\n");
  }

  /**
   * ===================================================================
   * ENRICHED CONTEXT BUILDING
   * ===================================================================
   */

  /**
   * Build enriched reading context with full chapter and challenge details
   * This is passed to LLM for story-specific insights
   */
  async buildEnrichedReadingContext(
    childProfile: ChildProfile,
    storiesData: Story[],
    periodStart: Date,
    periodEnd: Date,
  ): Promise<EnrichedReadingContext> {
    try {
      logger.info("[Aggregator] Building enriched reading context", {
        childProfileId: childProfile.id,
        childName: childProfile.name,
        storiesCount: storiesData.length,
      });

      // Filter progress records for the period
      const periodProgress = childProfile.progress.filter((p) => {
        const startDate = new Date(p.createdAt);
        return startDate >= periodStart && startDate <= periodEnd;
      });

      // Enrich each story with chapter and challenge details
      const enrichedStories: EnrichedStory[] = [];
      let totalChaptersRead = 0;
      let totalChallengesAttempted = 0;
      let totalChallengesSolved = 0;

      for (const progress of periodProgress) {
        // Find the story in storiesData
        const story = storiesData.find((s) => s.id === progress.storyId);
        if (!story) continue;

        const enrichedStory = await this.enrichStory(
          story,
          progress,
          periodStart,
          periodEnd,
        );

        if (enrichedStory) {
          enrichedStories.push(enrichedStory);
          totalChaptersRead += enrichedStory.chapters.length;
          totalChallengesAttempted += enrichedStory.totalChallengesAttempted;
          totalChallengesSolved += enrichedStory.totalChallengeSolved;
        }
      }

      // Build summary text
      const summaryText = this.buildEnrichedContextSummary(
        enrichedStories,
        childProfile.name,
      );

      const enrichedContext: EnrichedReadingContext = {
        weekStart: periodStart,
        weekEnd: periodEnd,
        childName: childProfile.name,
        childId: childProfile.id,
        stories: enrichedStories,
        totalStoriesStarted: periodProgress.filter(
          (p) => p.status !== "NOT_STARTED",
        ).length,
        totalStoriesCompleted: periodProgress.filter(
          (p) => p.status === "COMPLETED",
        ).length,
        totalChaptersRead,
        totalChallengesAttempted,
        totalChallengesSolved,
        summaryText,
      };

      logger.info("[Aggregator] Enriched reading context built", {
        childProfileId: childProfile.id,
        storiesCount: enrichedStories.length,
        chaptersCount: totalChaptersRead,
        challengesCount: totalChallengesAttempted,
      });

      return enrichedContext;
    } catch (error) {
      logger.error("[Aggregator] Error building enriched context", {
        childProfileId: childProfile.id,
        error: String(error),
        stack: error instanceof Error ? error.stack : "N/A",
      });
      throw error;
    }
  }

  /**
   * Enrich a single story with chapter and challenge details
   */
  private async enrichStory(
    story: Story,
    progress: Progress,
    periodStart: Date,
    periodEnd: Date,
  ): Promise<EnrichedStory | null> {
    try {
      const enrichedChapters: EnrichedChapter[] = [];
      let totalChallengeSolved = 0;
      let totalChallengesAttempted = 0;
      let totalTimeSpent = 0;

      // Get the game session for this progress
      const gameSession = progress.gameSession;
      if (!gameSession) {
        logger.warn("[Aggregator] No game session found for progress", {
          progressId: progress.id,
          storyId: story.id,
        });
        return null;
      }

      // Enrich each chapter
      if (story.chapters && story.chapters.length > 0) {
        for (const chapter of story.chapters) {
          const enrichedChapter = await this.enrichChapter(
            chapter,
            gameSession.challengeAttempts || [],
          );

          if (enrichedChapter) {
            enrichedChapters.push(enrichedChapter);
            totalChallengesAttempted += enrichedChapter.challenges.length;
            totalChallengeSolved += enrichedChapter.challenges.filter(
              (c) => c.status === "SOLVED",
            ).length;
            totalTimeSpent += enrichedChapter.totalTimeSpent;
          }
        }
      }

      const enrichedStory: EnrichedStory = {
        id: story.id,
        title: story.title,
        description: story.description,
        difficulty: story.difficulty || 1,
        chapters: enrichedChapters,
        worldName: story.world?.name,
        themeName: story.world?.roadmap?.theme?.name,
        totalChallengeSolved,
        totalChallengesAttempted,
        challengeSuccessRate:
          totalChallengesAttempted > 0
            ? Math.round((totalChallengeSolved / totalChallengesAttempted) * 100)
            : 0,
        totalTimeSpent,
        completedAt:
          progress.status === "COMPLETED" ? progress.completedAt : undefined,
        completionPercentage:
          progress.status === "COMPLETED"
            ? 100
            : Math.round(
                (enrichedChapters.length /
                  (story.chapters?.length || 1)) *
                  100,
              ),
      };

      return enrichedStory;
    } catch (error) {
      logger.warn("[Aggregator] Error enriching story", {
        storyId: story.id,
        error: String(error),
      });
      return null;
    }
  }

  /**
   * Enrich a single chapter with challenge details
   */
  private async enrichChapter(
    chapter: any,
    challengeAttempts: ChallengeAttempt[],
  ): Promise<EnrichedChapter | null> {
    try {
      const enrichedChallenges: EnrichedChallenge[] = [];
      let totalTimeSpent = 0;
      let challengesSolved = 0;

      // Match challenges to attempts
      if (chapter.challenge) {
        const attempts = challengeAttempts.filter(
          (a) => a.challengeId === chapter.challenge.id,
        );

        if (attempts.length > 0) {
          const lastAttempt = attempts[attempts.length - 1];

          const enrichedChallenge: EnrichedChallenge = {
            id: chapter.challenge.id,
            type: chapter.challenge.type,
            question: chapter.challenge.question,
            answer: lastAttempt.textAnswer,
            status: lastAttempt.status,
            hints: chapter.challenge.hints || [],
            usedHints: lastAttempt.usedHints || 0,
            timeSpentSeconds: lastAttempt.timeSpentSeconds || 0,
            attemptCount: attempts.length,
          };

          enrichedChallenges.push(enrichedChallenge);
          totalTimeSpent += enrichedChallenge.timeSpentSeconds;

          if (enrichedChallenge.status === "SOLVED") {
            challengesSolved++;
          }
        }
      }

      const enrichedChapter: EnrichedChapter = {
        id: chapter.id,
        order: chapter.order,
        content: chapter.content || "",
        contentLength: (chapter.content || "").length,
        challenges: enrichedChallenges,
        successRate:
          enrichedChallenges.length > 0
            ? Math.round(
                (challengesSolved / enrichedChallenges.length) * 100,
              )
            : 0,
        totalTimeSpent,
      };

      return enrichedChapter;
    } catch (error) {
      logger.warn("[Aggregator] Error enriching chapter", {
        chapterId: chapter.id,
        error: String(error),
      });
      return null;
    }
  }

  /**
   * Build natural language summary of enriched context for LLM
   */
  private buildEnrichedContextSummary(
    stories: EnrichedStory[],
    childName: string,
  ): string {
    const parts: string[] = [];

    parts.push(`This week, ${childName} engaged with the following stories:\n`);

    stories.forEach((story, idx) => {
      parts.push(`${idx + 1}. "${story.title}" (Difficulty: ${story.difficulty}/5)`);
      parts.push(
        `   - Read ${story.completionPercentage}% of the story (${story.chapters.length} chapters)`,
      );
      parts.push(
        `   - Challenge success: ${story.challengeSuccessRate}% (${story.totalChallengeSolved}/${story.totalChallengesAttempted})`,
      );

      // Add theme/world context if available
      if (story.themeName) {
        parts.push(`   - Theme: ${story.themeName}`);
      }

      // Add specific chapter notes if notable
      const failedChallenges = story.chapters
        .flatMap((c) => c.challenges)
        .filter((c) => c.status !== "SOLVED");

      if (failedChallenges.length > 0) {
        parts.push(`   - Faced challenges with ${failedChallenges.length} questions`);
      }

      parts.push("");
    });

    return parts.join("\n");
  }

  /**
   * Cleanup method: Disconnect Prisma client
   */

  async cleanup(): Promise<void> {
    try {
      await this.prisma.$disconnect();
    } catch (error) {
      logger.error("[Aggregator] Error disconnecting Prisma client", {
        error: String(error),
      });
    }
  }
}

export const analyticsDataAggregator = new AnalyticsDataAggregator();
