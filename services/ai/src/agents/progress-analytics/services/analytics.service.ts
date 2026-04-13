import { llmGenerateAnalytics } from "./llm.service";
import {
  WeeklyAnalyticsReportData,
  AnalyticsInput,
  MetricsSnapshot,
  TrendAnalysis,
  GenerateReportResponse,
} from "./types";

import { PrismaClient } from "@prisma/client";
import { ChildProfile, Story, ChallengeAttempt } from "@shared/src/types";
import { logger } from "../../../lib/logger";

const prisma = new PrismaClient();

/**
 * Generate and save a weekly analytics report for a child
 *
 * Flow:
 * 1. Extract metrics from passed child data (this week)
 * 2. Query database for previous week's report (if exists)
 * 3. Calculate trend analysis
 * 4. Call LLM to generate narrative
 * 5. Save report to database
 * 6. Return response with generated content
 *
 * @param childProfileId - ID of the child's profile
 * @param childProfile - Child profile data with skills
 * @param storiesData - Array of stories read this week (with challenge data)
 * @param week - ISO week number for this report
 * @returns Generated analytics report with summary, trends, and recommendations
 */
export async function generateWeeklyReport(
  childProfileId: string,
  childProfile: ChildProfile, // ChildProfile type from shared
  storiesData: Story[], // Story[] type from shared
  week: number,
): Promise<GenerateReportResponse> {
  const startTime = Date.now();

  try {
    logger.info(
      JSON.stringify({
        timestamp: new Date().toISOString(),
        level: "info",
        service: "ai-service",
        agent: "progress-analytics",
        message: "Starting weekly analytics generation",
        childProfileId,
        week,
      }),
    );

    // =========================================================================
    // STEP 1: Extract this week's metrics from input
    // =========================================================================
    const thisWeekMetrics = extractThisWeekMetrics(childProfile, storiesData);

    logger.info(
      JSON.stringify({
        timestamp: new Date().toISOString(),
        level: "info",
        service: "ai-service",
        agent: "progress-analytics",
        message: "Metrics extracted",
        storiesCount: thisWeekMetrics.storiesCount,
        successRate: thisWeekMetrics.successRate,
      }),
    );

    // =========================================================================
    // STEP 2: Query database for previous week's report (for trend context)
    // =========================================================================
    let previousWeekMetrics: MetricsSnapshot | undefined;
    let previousWeekReport: any = null;

    try {
      previousWeekReport = await prisma.weeklyAnalyticsReport.findFirst({
        where: { childProfileId },
        orderBy: { week: "desc" },
      });

      if (previousWeekReport) {
        previousWeekMetrics = previousWeekReport.metricsSnapshot;
        logger.info(
          JSON.stringify({
            timestamp: new Date().toISOString(),
            level: "info",
            service: "ai-service",
            agent: "progress-analytics",
            message: "Previous week report found for trend analysis",
            previousWeek: previousWeekReport.week,
          }),
        );
      }
    } catch (dbError) {
      logger.warn(
        JSON.stringify({
          timestamp: new Date().toISOString(),
          level: "warn",
          service: "ai-service",
          agent: "progress-analytics",
          message: "Error querying previous week report",
          error: dbError instanceof Error ? dbError.message : String(dbError),
        }),
      );
      // Continue without previous week data
    }

    // =========================================================================
    // STEP 3: Calculate trend analysis
    // =========================================================================
    let trendAnalysis: TrendAnalysis | undefined;
    if (previousWeekMetrics) {
      trendAnalysis = calculateTrends(thisWeekMetrics, previousWeekMetrics);
      logger.info(
        JSON.stringify({
          timestamp: new Date().toISOString(),
          level: "info",
          service: "ai-service",
          agent: "progress-analytics",
          message: "Trend analysis calculated",
          successRateChange: trendAnalysis.successRateChange,
          velocityChange: trendAnalysis.velocityChange,
        }),
      );
    }

    // =========================================================================
    // STEP 4: Prepare input for LLM
    // =========================================================================
    const analysisInput: AnalyticsInput = {
      childName: childProfile.name,
      childAge: childProfile.ageGroupName,
      favoriteThemes: childProfile.favoriteThemes || [],
      currentSkillScores: buildSkillScores(childProfile),
      thisWeekMetrics,
      previousWeekMetrics,
      trendAnalysis,
    };

    // =========================================================================
    // STEP 5: Call LLM to generate analytics
    // =========================================================================
    logger.info(
      JSON.stringify({
        timestamp: new Date().toISOString(),
        level: "info",
        service: "ai-service",
        agent: "progress-analytics",
        message: "Calling LLM for analytics generation",
      }),
    );

    const llmOutput = await llmGenerateAnalytics(analysisInput);

    logger.info(
      JSON.stringify({
        timestamp: new Date().toISOString(),
        level: "info",
        service: "ai-service",
        agent: "progress-analytics",
        message: "LLM generation complete",
        summaryLength: llmOutput.executiveSummary.length,
        trendsLength: llmOutput.progressTrends.length,
        recommendationsCount: llmOutput.recommendations.length,
      }),
    );

    // =========================================================================
    // STEP 6: Save report to database
    // =========================================================================
    const reportData: WeeklyAnalyticsReportData = {
      childProfileId,
      week,
      executiveSummary: llmOutput.executiveSummary,
      progressTrends: llmOutput.progressTrends,
      recommendations: llmOutput.recommendations,
      metricsSnapshot: thisWeekMetrics,
    };

    let savedReport;
    try {
      savedReport = await prisma.weeklyAnalyticsReport.create({
        data: {
          childProfileId: reportData.childProfileId,
          week: reportData.week,
          executiveSummary: reportData.executiveSummary,
          progressTrends: reportData.progressTrends,
          recommendations: reportData.recommendations,
          metricsSnapshot: reportData.metricsSnapshot as any, // Cast to JSON-compatible type
        },
      });

      logger.info(
        JSON.stringify({
          timestamp: new Date().toISOString(),
          level: "info",
          service: "ai-service",
          agent: "progress-analytics",
          message: "Analytics report saved to database",
          reportId: savedReport.id,
          childProfileId,
          week,
        }),
      );
    } catch (saveError) {
      // Check if unique constraint violation (report already exists for this week)
      if (saveError instanceof Error && saveError.message.includes("unique")) {
        logger.warn(
          JSON.stringify({
            timestamp: new Date().toISOString(),
            level: "warn",
            service: "ai-service",
            agent: "progress-analytics",
            message: "Report already exists for this week, updating",
            childProfileId,
            week,
          }),
        );

        // Update existing report (use update instead of updateMany to get full object)
        savedReport = await prisma.weeklyAnalyticsReport.update({
          where: { childProfileId_week: { childProfileId, week } },
          data: {
            ...reportData,
            metricsSnapshot: reportData.metricsSnapshot as any, // Cast to JSON-compatible type
          },
        });
      } else {
        throw saveError;
      }
    }

    // =========================================================================
    // STEP 7: Return response
    // =========================================================================
    const elapsedMs = Date.now() - startTime;
    logger.info(
      JSON.stringify({
        timestamp: new Date().toISOString(),
        level: "info",
        service: "ai-service",
        agent: "progress-analytics",
        message: "Weekly analytics generation complete",
        childProfileId,
        week,
        elapsedMs,
      }),
    );

    return {
      success: true,
      reportId: savedReport?.id || "updated",
      childProfileId,
      week,
      executiveSummary: llmOutput.executiveSummary,
      progressTrends: llmOutput.progressTrends,
      recommendations: llmOutput.recommendations,
      generatedAt: new Date(),
    };
  } catch (error) {
    const elapsedMs = Date.now() - startTime;
    logger.error(
      JSON.stringify({
        timestamp: new Date().toISOString(),
        level: "error",
        service: "ai-service",
        agent: "progress-analytics",
        message: "Error in analytics generation",
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
        childProfileId,
        week,
        elapsedMs,
      }),
    );

    return {
      success: false,
      childProfileId,
      week,
      executiveSummary: "",
      progressTrends: "",
      recommendations: [],
      generatedAt: new Date(),
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}

/**
 * Extract this week's metrics from child profile and stories data
 * Called by generateWeeklyReport to prepare metrics for LLM and database
 *
 * Uses both childProfile (for progress/attempt data) and storiesData (for story metadata)
 * to calculate comprehensive metrics for the week
 *
 * @param childProfile - Child profile with progress array and challenge attempt data
 * @param storiesData - Array of stories read this week with chapter/challenge metadata
 * @returns MetricsSnapshot ready for analysis
 */
function extractThisWeekMetrics(
  childProfile: ChildProfile,
  storiesData: Story[],
): MetricsSnapshot {
  // Initialize metrics
  const challenges: { [type: string]: number } = {};
  let correctCount = 0;
  let incorrectCount = 0;
  let skippedCount = 0;
  let totalChallenges = 0;
  let totalTimeSeconds = 0;
  let skillsExercised = new Set<string>();
  let difficultiesHandled = new Set<number>();
  let totalHintsUsed = 0;

  // Get story IDs from this week's stories for cross-reference
  const storyIds = new Set(storiesData.map((s) => s.id));

  // =========================================================================
  // STEP 1: Extract from storiesData (for story metadata and structure)
  // =========================================================================
  storiesData.forEach((story: Story) => {
    // Track difficulty
    if (story.difficulty) {
      difficultiesHandled.add(story.difficulty);
    }

    // Process chapters and challenges
    if (story.chapters && Array.isArray(story.chapters)) {
      story.chapters.forEach((chapter: any) => {
        if (chapter.challenge) {
          const challenge = chapter.challenge;
          const type = challenge.type || "UNKNOWN";

          // Count by type
          challenges[type] = (challenges[type] || 0) + 1;

          // Track skills (from story metadata)
          if (challenge.skillsToReinforce) {
            challenge.skillsToReinforce.forEach((skill: string) => {
              skillsExercised.add(skill);
            });
          }
        }
      });
    }
  });

  // =========================================================================
  // STEP 2: Extract from childProfile.progress (for actual challenge results)
  // =========================================================================
  // childProfile.progress contains Progress objects with gameSession data
  // Each gameSession contains challengeAttempts with isCorrect status
  if (childProfile.progress && Array.isArray(childProfile.progress)) {
    childProfile.progress.forEach((progress: any) => {
      // Only count progress for stories in this week
      if (!storyIds.has(progress.storyId)) {
        return; // Skip progress from other weeks
      }

      // Get time spent from Progress total
      if (progress.totalTimeSpent) {
        totalTimeSeconds += progress.totalTimeSpent;
      }

      // Extract challenge results from gameSession
      if (
        progress.gameSession &&
        Array.isArray(progress.gameSession.challengeAttempts)
      ) {
        progress.gameSession.challengeAttempts.forEach((attempt: any) => {
          totalChallenges++;

          // Count by result status
          if (attempt.isCorrect === true) {
            correctCount++;
          } else if (attempt.isCorrect === false) {
            incorrectCount++;
          } else if (attempt.status === "SKIPPED") {
            skippedCount++;
          } else {
            // Default to incorrect if unclear
            incorrectCount++;
          }

          // Sum hints used
          if (attempt.usedHints) {
            totalHintsUsed += attempt.usedHints;
          }
        });
      }
    });
  }

  // =========================================================================
  // STEP 3: Ensure all story-related time is captured
  // =========================================================================
  // Note: Challenge attempt data should come from childProfile.progress (STEP 2)
  // Story data itself doesn't contain challenge attempt details
  // If STEP 2 yielded no results, it likely means no progress data was passed
  if (totalChallenges === 0) {
    logger.warn(
      "[Analytics] No challenge attempts found in childProfile.progress - metrics may be incomplete",
    );
    // This is expected for first-time reports or if progress data wasn't loaded
    // Continue with whatever metrics we have from story metadata
  }

  // =========================================================================
  // STEP 4: Calculate additional context from childProfile
  // =========================================================================
  // Use childProfile skill scores if available for analysis context
  if (childProfile.storytelling?.learningObjectives) {
    childProfile.storytelling.learningObjectives.forEach((obj: string) => {
      skillsExercised.add(obj);
    });
  }

  // =========================================================================
  // STEP 5: Calculate derived metrics
  // =========================================================================
  const successRate =
    totalChallenges > 0 ? (correctCount / totalChallenges) * 100 : 0;

  const challengeResults = {
    correct: correctCount,
    incorrect: incorrectCount,
    skipped: skippedCount,
  };

  return {
    storiesCount: storiesData.length,
    challenges,
    successRate: Math.round(successRate * 10) / 10, // Round to 1 decimal
    hintUsagePattern: {
      totalHintsUsed,
      averageHintsPerChallenge:
        totalChallenges > 0
          ? Math.round((totalHintsUsed / totalChallenges) * 10) / 10
          : 0,
    },
    timeSpent: {
      totalSeconds: totalTimeSeconds,
      averagePerStory:
        storiesData.length > 0
          ? Math.round((totalTimeSeconds / storiesData.length) * 10) / 10
          : 0,
    },
    skillsExercised: Array.from(skillsExercised),
    difficultiesHandled: Array.from(difficultiesHandled),
    challengeResultBreakdown: challengeResults,
  };
}

/**
 * Calculate trend analysis by comparing this week to previous week metrics
 *
 * @param thisWeek - Current week's metrics
 * @param previousWeek - Previous week's metrics
 * @returns TrendAnalysis with improvements and areas needing work
 */
function calculateTrends(
  thisWeek: MetricsSnapshot,
  previousWeek: MetricsSnapshot,
): TrendAnalysis {
  // Calculate success rate change
  const successRateChange = thisWeek.successRate - previousWeek.successRate;

  // Calculate hint usage improvement (negative = fewer hints = improvement)
  const hintChangePercent =
    previousWeek.hintUsagePattern.averageHintsPerChallenge > 0
      ? ((thisWeek.hintUsagePattern.averageHintsPerChallenge -
          previousWeek.hintUsagePattern.averageHintsPerChallenge) /
          previousWeek.hintUsagePattern.averageHintsPerChallenge) *
        100
      : 0;

  // Calculate speed improvement
  const speedImprovementPercent =
    previousWeek.timeSpent.averagePerStory > 0
      ? ((previousWeek.timeSpent.averagePerStory -
          thisWeek.timeSpent.averagePerStory) /
          previousWeek.timeSpent.averagePerStory) *
        100
      : 0;

  // Calculate difficulty progression
  const thisWeekMaxDifficulty = Math.max(...thisWeek.difficultiesHandled, 0);
  const prevWeekMaxDifficulty = Math.max(
    ...previousWeek.difficultiesHandled,
    0,
  );
  const difficultyProgression = thisWeekMaxDifficulty - prevWeekMaxDifficulty;

  // Find new skills introduced
  const newSkills = thisWeek.skillsExercised.filter(
    (skill) => !previousWeek.skillsExercised.includes(skill),
  );

  // Determine velocity
  let velocityChange: "improving" | "consistent" | "regressing" = "consistent";
  if (successRateChange > 5 || speedImprovementPercent > 10) {
    velocityChange = "improving";
  } else if (successRateChange < -5 || speedImprovementPercent < -10) {
    velocityChange = "regressing";
  }

  // Placeholder for skill-based analysis (would need access to SkillScore table)
  const strugglingAreas = thisWeek.successRate < 60 ? ["comprehension"] : [];
  const improvementAreas =
    thisWeek.successRate > 80 ? ["logic", "persistence"] : [];

  return {
    successRateChange: Math.round(successRateChange * 10) / 10,
    hintUsageImprovement: Math.round(hintChangePercent * 10) / 10,
    speedImprovement: Math.round(speedImprovementPercent * 10) / 10,
    difficultyProgression:
      difficultyProgression > 0 ? difficultyProgression : null,
    newSkillsIntroduced: newSkills,
    strugglingAreas,
    improvementAreas,
    velocityChange,
  };
}

/**
 * Build skill scores object from child profile
 * Used for LLM context
 */
function buildSkillScores(childProfile: any): {
  [skillName: string]: { score: number; confidence: number };
} {
  const scores: { [skillName: string]: { score: number; confidence: number } } =
    {};

  // If child profile has skillScores array (from Prisma)
  if (childProfile.skillScores && Array.isArray(childProfile.skillScores)) {
    childProfile.skillScores.forEach((skill: any) => {
      scores[skill.skillName] = {
        score: skill.score,
        confidence: skill.confidence,
      };
    });
  }

  // Default skills if none provided
  if (Object.keys(scores).length === 0) {
    scores["reading"] = { score: 0.5, confidence: 0.3 };
    scores["comprehension"] = { score: 0.5, confidence: 0.3 };
    scores["logic"] = { score: 0.5, confidence: 0.3 };
  }

  return scores;
}
