import {
  ChildProfile,
  Story,
  Progress,
  ChallengeAttempt,
  Challenge,
  Answer,
  AggregatedMetrics,
} from "@shared/src/types";
import {
  ChallengeReport,
  ReadingPattern,
  ChallengePattern,
  EngagementSignal,
  StoryJourney,
  LLMContext,
} from "../../../types/types";
import { logger } from "../../../lib/logger";

/**
 * LLMContextBuilderService
 *
 * Builds rich, narrative context from child's reading progress data and metrics.
 * Creates comprehensive learning profile for LLM analysis including:
 * - Challenge reports with detailed attempt information
 * - Story journey narrative with themes and progression
 * - Pattern extraction for challenges, reading, and engagement
 * - Consolidated narrative ready for LLM processing
 */
export class LLMContextBuilderService {
  /**
   * Create a detailed report for a single challenge attempt
   * @param attempt ChallengeAttempt data
   * @param challenge Challenge definition
   * @param answer Answer selected (if multiple choice)
   * @returns ChallengeReport with all details
   */
  private createChallengeReport(
    attempt: ChallengeAttempt,
    challenge: Challenge | undefined,
    answer?: Answer
  ): ChallengeReport {
    return {
      challengeId: attempt.challengeId,
      challengeType: challenge?.type || "UNKNOWN",
      challengeQuestion: challenge?.question || "N/A",
      correctAnswer: answer?.text || "N/A",
      childAnswer: attempt.textAnswer || answer?.text || "N/A",
      totalAttempts: attempt.attemptNumber,
      success: attempt.isCorrect || false,
      hintsUsed: attempt.usedHints,
      timeSpent: attempt.timeSpentSeconds * 1000, // convert to milliseconds
      starsEarned: attempt.starEvent?.totalStars || 0,
      baseStar: challenge?.baseStars || 0,
    };
  }

  /**
   * Helper: Find challenge by ID across stories
   * @param challengeId Challenge ID to search for
   * @param stories Array of stories
   * @returns Challenge object or undefined
   */
  private findChallengeById(
    challengeId: string,
    stories: Story[]
  ): Challenge | undefined {
    for (const story of stories) {
      if (story.chapters) {
        for (const chapter of story.chapters) {
          if (chapter.challenge?.id === challengeId) {
            return chapter.challenge;
          }
        }
      }
    }
    return undefined;
  }

  /**
   * Helper: Find answer by ID in a challenge
   * @param answerId Answer ID to search for
   * @param challenge Challenge containing answers
   * @returns Answer object or undefined
   */
  private findAnswerById(
    answerId: string | null | undefined,
    challenge: Challenge | undefined
  ): Answer | undefined {
    if (!answerId || !challenge?.answers) return undefined;
    return challenge.answers.find((a) => a.id === answerId);
  }

  /**
   * Synthesize a narrative story journey from progress records
   * @param child ChildProfile with progress data
   * @param stories Story[] that the child has read
   * @param metrics AggregatedMetrics for overall stats
   * @returns StoryJourney with narrative and themes
   */
  private synthesizeStoryJourney(
    child: ChildProfile,
    stories: Story[],
    metrics: AggregatedMetrics
  ): StoryJourney {
    const readStories: Story[] = [];
    const themes = new Set<string>();
    let narrativeElements: string[] = [];

    if (child.progress) {
      // Sort progress chronologically
      const sortedProgress = [...child.progress].sort(
        (a, b) =>
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      );

      sortedProgress.forEach((progress: Progress) => {
        const story = stories.find((s) => s.id === progress.storyId);
        if (story && progress.status === "COMPLETED") {
          readStories.push(story);

          // Extract themes from story world if available
          if (story.world?.roadmap?.title) {
            themes.add(story.world.roadmap.title);
          }

          // Build narrative element
          const challengeStats = this.getChallengeStatsForProgress(progress);
          const narrativeElement = `
            ${story.title} (${this.getDifficultyLabel(story.difficulty)}):
            Completed ${challengeStats.solved}/${challengeStats.attempted} challenges
            with ${challengeStats.successRate}% success rate
            in ${Math.round(progress.totalTimeSpent / 60)} minutes.
          `;
          narrativeElements.push(narrativeElement);
        }
      });
    }

    // Build consolidated narrative
    const consolidatedNarrative = `
      Reading Journey Summary:
      ${child.name} has read ${readStories.length} stories 
      with an overall success rate of ${metrics.successRate}%.
      
      Key Achievements:
      - Completed ${metrics.totalStoriesCompleted} stories
      - Solved ${metrics.totalChallengesSolved} out of ${metrics.totalChallengesAttempted} challenges
      - Earned ${metrics.starsEarned} out of ${metrics.starsPossible} possible stars
      - Average of ${metrics.averageAttemptsPerChallenge} attempts per challenge
      
      Story Progression:
      ${narrativeElements.join("\n")}
      
      Engagement Level: ${metrics.hintDependencyRate}% hint dependency rate
      Reading Duration: ${Math.round(metrics.totalTimeSpent / 60)} total minutes
    `;

    return {
      storiesRead: readStories,
      totalProgressRecords: child.progress?.length || 0,
      narrativeJourney: consolidatedNarrative,
      themes: Array.from(themes),
    };
  }

  /**
   * Helper: Get challenge stats for a specific progress record
   * @param progress Progress record
   * @returns Object with attempted, solved, and success rate
   */
  private getChallengeStatsForProgress(progress: Progress): {
    attempted: number;
    solved: number;
    successRate: number;
  } {
    let attempted = 0;
    let solved = 0;

    if (progress.gameSession?.challengeAttempts) {
      attempted = progress.gameSession.challengeAttempts.length;
      solved = progress.gameSession.challengeAttempts.filter(
        (ca) => ca.isCorrect
      ).length;
    }

    return {
      attempted,
      solved,
      successRate: attempted > 0 ? Math.round((solved / attempted) * 100) : 0,
    };
  }

  /**
   * Helper: Convert numeric difficulty to label
   * @param difficulty Numeric difficulty (1-5)
   * @returns Difficulty label
   */
  private getDifficultyLabel(difficulty: number | undefined): string {
    if (!difficulty) return "Medium";
    if (difficulty <= 2) return "Easy";
    if (difficulty <= 3) return "Medium";
    return "Hard";
  }

  /**
   * Extract patterns from challenge performance
   * @param child ChildProfile with progress data
   * @param stories Story[] with challenge types
   * @param metrics AggregatedMetrics with performance breakdown
   * @returns ChallengePattern with strengths/weaknesses
   */
  private extractChallengePatterns(
    child: ChildProfile,
    stories: Story[],
    metrics: AggregatedMetrics
  ): ChallengePattern {
    // Sort performance by type to find strengths and weaknesses
    const performanceByType = metrics.performanceByType;

    const sorted = [...performanceByType].sort(
      (a, b) => b.successRate - a.successRate
    );

    const strongTypes = sorted
      .filter((p) => p.successRate >= 75)
      .slice(0, 3)
      .map((p) => p.type);

    const weakTypes = sorted
      .filter((p) => p.successRate < 50)
      .slice(0, 3)
      .map((p) => p.type);

    // Extract favorite themes from child's data
    const favoriteThemes =
      child.favoriteThemes && child.favoriteThemes.length > 0
        ? child.favoriteThemes
        : ["Not yet specified"];

    return {
      strongTypes,
      weakTypes,
      overallChallengeSuccessRate: metrics.successRate,
      favoriteThemes,
    };
  }

  /**
   * Extract patterns from reading behavior
   * @param child ChildProfile with progress data
   * @param metrics AggregatedMetrics with time and difficulty data
   * @returns ReadingPattern with speed, progression, frequency
   */
  private extractReadingPatterns(
    child: ChildProfile,
    metrics: AggregatedMetrics
  ): ReadingPattern {
    // Calculate average time per story
    const completedStories = metrics.totalStoriesCompleted || 1;
    const avgTimePerStory = metrics.totalTimeSpent / completedStories;

    // Determine reading speed (time per challenge)
    const timePerChallenge =
      metrics.totalTimeSpent /
      Math.max(metrics.totalChallengesAttempted, 1);

    let readingSpeed = "moderate";
    if (timePerChallenge < 30000) readingSpeed = "fast"; // < 30 seconds per challenge
    if (timePerChallenge > 120000) readingSpeed = "slow"; // > 2 minutes per challenge

    // Difficulty progression (compare first vs last quarters)
    const improvementPercentage =
      metrics.improvementTrend.improvementPercentage;
    const isProgressing =
      improvementPercentage > 0
        ? "Progressive (improving)"
        : "Stable or declining";

    // Reading frequency (estimate based on progress dates)
    let frequency = "sporadic";
    if (child.progress && child.progress.length > 5) {
      frequency = "regular";
    }

    return {
      averageTimePerStory: Math.round(avgTimePerStory / 60), // convert to minutes
      readingSpeed,
      difficultyProgression: isProgressing,
      frequencyOfReading: frequency,
    };
  }

  /**
   * Extract signals from engagement behavior
   * @param child ChildProfile with progress data
   * @param metrics AggregatedMetrics with hint and attempt data
   * @returns EngagementSignal with dependency, persistence, patterns
   */
  private extractEngagementSignals(
    child: ChildProfile,
    metrics: AggregatedMetrics
  ): EngagementSignal {
    // Hint dependency classification
    let hintDependency = "medium";
    if (metrics.hintDependencyRate < 30) hintDependency = "low";
    if (metrics.hintDependencyRate > 70) hintDependency = "high";

    // Persistence (measured by attempt count)
    let persistence = "medium";
    if (metrics.averageAttemptsPerChallenge < 1.3) persistence = "high";
    if (metrics.averageAttemptsPerChallenge > 2.0) persistence = "low";

    // Retry patterns based on improvement trend
    const improvementPercentage =
      metrics.improvementTrend.improvementPercentage;
    const retryPatterns =
      improvementPercentage > 10
        ? "Shows significant improvement with retries"
        : improvementPercentage > 0
          ? "Slight improvement with retries"
          : "Retries not leading to improvement";

    // Session consistency (number of progress records)
    let sessionConsistency = "sporadic";
    if (child.progress && child.progress.length > 10) {
      sessionConsistency = "consistent";
    }

    return {
      hintDependency,
      persistence,
      retryPatterns,
      sessionConsistency,
    };
  }

  /**
   * Main method: Build comprehensive learning context
   * @param child ChildProfile with all data
   * @param stories Story[] that the child has read
   * @param metrics AggregatedMetrics from metrics service
   * @param pastRecords Optional array of AIProgressInsight records from past analytics
   * @returns LLMContext with all narrative and structured data
   */
  public buildLearningContext(
    child: ChildProfile,
    stories: Story[],
    metrics: AggregatedMetrics,
    pastRecords?: any[]
  ): LLMContext {
    try {
      logger.debug("[LLMContextBuilder] Starting context building", {
        childId: child.id,
        childName: child.name,
        storiesCount: stories.length,
      });

      // Build story journey
      const storyJourney = this.synthesizeStoryJourney(
        child,
        stories,
        metrics
      );

      // Extract patterns
      const challengePattern = this.extractChallengePatterns(
        child,
        stories,
        metrics
      );
      const readingPattern = this.extractReadingPatterns(child, metrics);
      const engagementSignal = this.extractEngagementSignals(child, metrics);

      // Collect top challenge reports (most recent or most relevant)
      const topChallengeReports: ChallengeReport[] = [];
      if (child.progress) {
        const allReports: ChallengeReport[] = [];

        child.progress.forEach((progress: Progress) => {
          if (progress.gameSession?.challengeAttempts) {
            progress.gameSession.challengeAttempts.forEach(
              (attempt: ChallengeAttempt) => {
                const challenge = this.findChallengeById(
                  attempt.challengeId,
                  stories
                );
                const answer = this.findAnswerById(attempt.answerId, challenge);
                const report = this.createChallengeReport(
                  attempt,
                  challenge,
                  answer
                );
                allReports.push(report);
              }
            );
          }
        });

        // Take the 10 most recent reports
        topChallengeReports.push(
          ...allReports.slice(Math.max(0, allReports.length - 10))
        );
      }

      // Build consolidated narrative for LLM
      const consolidatedNarrative = `
CHILD LEARNING PROFILE: ${child.name}

READING JOURNEY:
${storyJourney.narrativeJourney}

CHALLENGE PATTERNS:
- Strong Areas: ${challengePattern.strongTypes.join(", ") || "Not yet determined"}
- Areas for Improvement: ${challengePattern.weakTypes.join(", ") || "Not yet determined"}
- Favorite Themes: ${challengePattern.favoriteThemes.join(", ")}

READING BEHAVIOR:
- Average Time per Story: ${readingPattern.averageTimePerStory} minutes
- Reading Speed: ${readingPattern.readingSpeed}
- Difficulty Progression: ${readingPattern.difficultyProgression}
- Reading Frequency: ${readingPattern.frequencyOfReading}

ENGAGEMENT SIGNALS:
- Hint Dependency: ${engagementSignal.hintDependency}
- Persistence Level: ${engagementSignal.persistence}
- Retry Patterns: ${engagementSignal.retryPatterns}
- Session Consistency: ${engagementSignal.sessionConsistency}

PERFORMANCE METRICS:
- Success Rate: ${metrics.successRate}%
- Star Achievement: ${metrics.starAchievementRate}%
- Average Attempts per Challenge: ${metrics.averageAttemptsPerChallenge}
- Total Time Investment: ${Math.round(metrics.totalTimeSpent / 60)} minutes
- Improvement Trend: ${metrics.improvementTrend.improvementPercentage > 0 ? "Positive" : "Stable"}

RECENT CHALLENGE PERFORMANCE:
${topChallengeReports
  .slice(0, 5)
  .map(
    (r, i) =>
      `${i + 1}. ${r.challengeQuestion} (${r.challengeType}): ${r.success ? "Solved" : "Attempted"} in ${r.totalAttempts} attempt(s)`
  )
  .join("\n")}

${
  pastRecords && pastRecords.length > 0
    ? `HISTORICAL ANALYTICS CONTEXT:
This child has been analyzed ${pastRecords.length} time(s) before. Key historical patterns:

${pastRecords
  .slice(0, 5)
  .map(
    (record: any, i: number) =>
      `Report ${i + 1} (${new Date(record.periodStart).toLocaleDateString()} - ${new Date(record.periodEnd).toLocaleDateString()}):
  - Reading Level: ${record.readingLevel}
  - Engagement Score: ${record.engagementScore}%
  - Success Rate: ${record.metrics?.successRate || "N/A"}%
  
  Key Strengths: ${record.insights?.strengths?.slice(0, 2).join(", ") || "Not specified"}
  Areas for Improvement: ${record.insights?.weaknesses?.slice(0, 2).join(", ") || "Not specified"}
  
  Previous Recommendations: ${record.insights?.recommendations?.slice(0, 2).join("; ") || "Not specified"}
  Previous Tips: ${record.insights?.tips?.slice(0, 2).join("; ") || "Not specified"}`
  )
  .join("\n\n")}

PROGRESSION ANALYSIS:
${
  pastRecords.length > 1
    ? `- Current Engagement (${metrics.successRate}%) vs Previous Average: ${Math.round(pastRecords.reduce((sum: number, r: any) => sum + r.engagementScore, 0) / pastRecords.length)}%
- Consistency: ${pastRecords.length} consecutive analyses show sustained engagement
- Track Changes: ${pastRecords[0].readingLevel !== pastRecords[pastRecords.length - 1]?.readingLevel ? `Reading level has progressed from ${pastRecords[pastRecords.length - 1]?.readingLevel} to ${pastRecords[0].readingLevel}` : "Reading level has remained consistent"}`
    : "First detailed analytics report - no prior performance data to compare"
}
`
    : ""
}
      `;

      const context: LLMContext = {
        childId: child.id,
        childName: child.name,
        childProfile: child,
        storyJourney,
        metrics,
        readingPattern,
        challengePattern,
        engagementSignal,
        topChallengeReports,
        consolidatedNarrative,
      };

      logger.info(
        "[LLMContextBuilder] Successfully built learning context",
        {
          childId: child.id,
          storiesRead: storyJourney.storiesRead.length,
          strongAreas: challengePattern.strongTypes.length,
          weakAreas: challengePattern.weakTypes.length,
          reportCount: topChallengeReports.length,
          pastRecordsIncluded: pastRecords?.length || 0,
        }
      );

      return context;
    } catch (error) {
      logger.error("[LLMContextBuilder] Error building learning context", {
        childId: child.id,
        error: String(error),
        stack: error instanceof Error ? error.stack : "N/A",
      });

      throw error;
    }
  }
}

export const llmContextBuilderService = new LLMContextBuilderService();
