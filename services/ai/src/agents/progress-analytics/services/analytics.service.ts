import { llmGenerateAnalytics } from "./llm.service";
import {
  WeeklyAnalyticsReportData,
  AnalyticsInput,
  MetricsSnapshot,
  TrendAnalysis,
  GenerateReportResponse,
  AttemptBehaviorMetrics,
  ChallengeTypeBehaviorSummary,
  ChallengeDetail,
} from "./types";

import { PrismaClient } from "@prisma/client";
import { ChildProfile, Story, ChallengeAttempt, Answer, Chapter, ChallengeStatus, ProgressStatus } from "@shared/src/types";
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

    // Re-derive behaviorInsights from the populated MetricsSnapshot so the
    // LLM receives the same data that was stored in the snapshot
    const behaviorInsights =
      thisWeekMetrics.behaviorByType !== undefined
        ? {
            byType: thisWeekMetrics.behaviorByType!,
            giveUpRate: thisWeekMetrics.giveUpRate ?? 0,
            persistenceAreas: thisWeekMetrics.persistenceAreas ?? [],
            quickWinAreas: thisWeekMetrics.quickWinAreas ?? [],
            selfCorrectionRate: thisWeekMetrics.selfCorrectionRate ?? 0,
          }
        : undefined;

    const analysisInput: AnalyticsInput = {
      childName: childProfile.name,
      childAge: childProfile.ageGroupName!,
      favoriteThemes: childProfile.favoriteThemes || [],
      currentSkillScores: buildSkillScores(childProfile),
      thisWeekMetrics,
      previousWeekMetrics,
      trendAnalysis,
      behaviorInsights,
      challengeDetails: buildChallengeDetails(storiesData, childProfile),
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
 * IMPORTANT: Considers only stories that were COMPLETED by the child.
 * Filters out stories with status "not_started" or "in_progress".
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

  // =========================================================================
  // STEP 0: Identify completed stories from child's progress
  // =========================================================================
  // Only consider stories that have been marked as completed by the child
  const completedStoryIds = new Set<string>();

  if (childProfile.progress && Array.isArray(childProfile.progress)) {
    childProfile.progress.forEach((progress: any) => {
      // Only add story if status is "COMPLETED" or equivalent
      if (progress.status === "COMPLETED" || progress.status === ProgressStatus.COMPLETED) {
        if (progress.storyId) {
          completedStoryIds.add(progress.storyId);
        }
      }
    });
  }

  logger.info(
    JSON.stringify({
      timestamp: new Date().toISOString(),
      level: "info",
      service: "ai-service",
      agent: "progress-analytics",
      message: "Completed stories identified",
      totalCompletedStories: completedStoryIds.size,
      availableStories: storiesData.length,
    }),
  );

  // Filter storiesData to only include completed stories
  const completedStories = storiesData.filter((s) => completedStoryIds.has(s.id));

  if (completedStories.length === 0) {
    logger.warn(
      JSON.stringify({
        timestamp: new Date().toISOString(),
        level: "warn",
        service: "ai-service",
        agent: "progress-analytics",
        message: "No completed stories found in this week's data",
        availableStories: storiesData.length,
      }),
    );
  }

  // Get story IDs from completed stories only
  const storyIds = new Set(completedStories.map((s) => s.id));

  // =========================================================================
  // STEP 1: Extract from completed storiesData (story metadata + challengeId → type map)
  // =========================================================================
  // Build a lookup so we can resolve challengeType when processing attempts
  const challengeTypeById = new Map<string, string>();

  completedStories.forEach((story: Story) => {
    // Track difficulty
    if (story.difficulty) {
      difficultiesHandled.add(story.difficulty);
    }

    // Process chapters and challenges
    if (story.chapters && Array.isArray(story.chapters)) {
      story.chapters.forEach((chapter: Chapter) => {
        if (chapter.challenge) {
          const challenge = chapter.challenge;
          const type = challenge.type

          // Count by type
          challenges[type] = (challenges[type] || 0) + 1;

          // Build lookup for behavior analysis
          if (challenge.id) {
            challengeTypeById.set(challenge.id, type);
          }
        }
      });
    }
  });

  // =========================================================================
  // STEP 2: Extract from childProfile.progress (challenge results + raw attempts)
  // =========================================================================
  // Collect attempts paired with their challenge type for behavior analysis
  const attemptsWithType: Array<{
    attempt: ChallengeAttempt;
    challengeType: string;
  }> = [];

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
          // Skip challenges that were never attempted
          if (attempt.status === ChallengeStatus.NOT_ATTEMPTED) return;

          totalChallenges++;

          // Count by result status
          if (attempt.isCorrect === true) {
            correctCount++;
          } else if (attempt.isCorrect === false) {
            incorrectCount++;
          } else if (attempt.status === ChallengeStatus.SKIPPED) {
            skippedCount++;
          } else {
            // Default to incorrect if unclear
            incorrectCount++;
          }

          // Sum hints used
          if (attempt.usedHints) {
            totalHintsUsed += attempt.usedHints;
          }

          // Collect attempt for behavior analysis (resolve type from lookup)
          const challengeType =
            challengeTypeById.get(attempt.challengeId) ?? "UNKNOWN";
          attemptsWithType.push({ attempt: attempt as ChallengeAttempt, challengeType });
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
  // STEP 5: Run behavior analysis pipeline on collected attempts
  // =========================================================================
  const behaviorInsights = buildBehaviorInsights(attemptsWithType);

  const behaviorByType = behaviorInsights?.byType;
  const giveUpRate = behaviorInsights?.giveUpRate;
  const persistenceAreas = behaviorInsights?.persistenceAreas;
  const quickWinAreas = behaviorInsights?.quickWinAreas;
  const selfCorrectionRate = behaviorInsights?.selfCorrectionRate;

  if (behaviorInsights) {
    logger.info(
      JSON.stringify({
        timestamp: new Date().toISOString(),
        level: "info",
        service: "ai-service",
        agent: "progress-analytics",
        message: "Behavior insights extracted",
        challengeTypesAnalyzed: Object.keys(behaviorByType ?? {}).length,
        giveUpRate,
        persistenceAreas,
        quickWinAreas,
        selfCorrectionRate,
      }),
    );
  }

  // =========================================================================
  // STEP 6: Calculate derived metrics
  // =========================================================================
  const successRate =
    totalChallenges > 0 ? (correctCount / totalChallenges) * 100 : 0;

  const challengeResults = {
    correct: correctCount,
    incorrect: incorrectCount,
    skipped: skippedCount,
  };

  return {
    storiesCount: completedStories.length,
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
        completedStories.length > 0
          ? Math.round((totalTimeSeconds / completedStories.length) * 10) / 10
          : 0,
    },
    skillsExercised: Array.from(skillsExercised),
    difficultiesHandled: Array.from(difficultiesHandled),
    challengeResultBreakdown: challengeResults,
    // Behavior fields — populated when AttemptAction data is available
    ...(behaviorByType !== undefined && { behaviorByType }),
    ...(giveUpRate !== undefined && { giveUpRate }),
    ...(persistenceAreas !== undefined && { persistenceAreas }),
    ...(quickWinAreas !== undefined && { quickWinAreas }),
    ...(selfCorrectionRate !== undefined && { selfCorrectionRate }),
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

// ============================================================================
// PER-CHALLENGE DETAIL BUILDER
// ============================================================================

/**
 * Join storiesData (content metadata) with childProfile.progress (attempt data)
 * to build a per-challenge drill-down that gives the LLM full context:
 * question text, answer options, story/chapter, and what happened on each attempt.
 *
 * @param storiesData - Stories with chapters → challenges → answers (from Content Service)
 * @param childProfile - Child profile with progress → gameSession → challengeAttempts (from Progress Service)
 * @returns ChallengeDetail[] sorted by story order → chapter order
 */
function buildChallengeDetails(
  storiesData: Story[],
  childProfile: ChildProfile,
): ChallengeDetail[] {
  // -------------------------------------------------------------------------
  // Build content lookup: challengeId → content metadata
  // -------------------------------------------------------------------------
  const contentMap = new Map<
    string,
    {
      storyTitle: string;
      storyDifficulty: number | null;
      chapterOrder: number;
      challengeType: string;
      question: string;
      answers: Array<{ id: string; text: string; isCorrect: boolean }>;
      hints: string[];
      storyOrder: number; // for sorting
    }
  >();

  storiesData.forEach((story) => {
    if (!story.chapters || !Array.isArray(story.chapters)) return;

    story.chapters.forEach((chapter) => {
      if (!chapter.challenge) return;

      const challenge = chapter.challenge;
      const answers = (challenge.answers ?? []).map((a: Answer) => ({
        id: a.id,
        text: a.text,
        isCorrect: a.isCorrect,
      }));

      contentMap.set(challenge.id, {
        storyTitle: story.title,
        storyDifficulty: story.difficulty,
        chapterOrder: chapter.order,
        challengeType: challenge.type || "UNKNOWN",
        question: challenge.question,
        answers,
        hints: challenge.hints ?? [],
        storyOrder: story.order,
      });
    });
  });

  // -------------------------------------------------------------------------
  // Build attempt lookup: challengeId → ChallengeAttempt[] (this week only)
  // -------------------------------------------------------------------------
  const storyIds = new Set(storiesData.map((s) => s.id));
  const attemptMap = new Map<string, ChallengeAttempt[]>();

  if (childProfile.progress && Array.isArray(childProfile.progress)) {
    childProfile.progress.forEach((progress: any) => {
      if (!storyIds.has(progress.storyId)) return; // Only this week's stories

      if (
        progress.gameSession &&
        Array.isArray(progress.gameSession.challengeAttempts)
      ) {
        progress.gameSession.challengeAttempts.forEach((attempt: any) => {
          const cid = attempt.challengeId;
          if (!attemptMap.has(cid)) {
            attemptMap.set(cid, []);
          }
          attemptMap.get(cid)!.push(attempt as ChallengeAttempt);
        });
      }
    });
  }

  // -------------------------------------------------------------------------
  // Join: for each challenge in content, attach its attempts
  // -------------------------------------------------------------------------
  const details: ChallengeDetail[] = [];

  for (const [challengeId, content] of contentMap) {
    const rawAttempts = attemptMap.get(challengeId) ?? [];

    // Sort attempts by attemptNumber
    const sortedAttempts = [...rawAttempts].sort(
      (a, b) => a.attemptNumber - b.attemptNumber,
    );

    // Resolve each attempt's selected answer text
    const attempts = sortedAttempts.map((attempt) => {
      let selectedAnswer: string | null = null;

      if (attempt.textAnswer) {
        // RIDDLE: child typed their answer
        selectedAnswer = attempt.textAnswer;
      } else if (attempt.answerId) {
        // MC / TF / CHOOSE_ENDING / MORAL_DECISION: resolve answerId → text
        const matchedAnswer = content.answers.find(
          (a) => a.id === attempt.answerId,
        );
        selectedAnswer = matchedAnswer?.text ?? null;
      }

      return {
        attemptNumber: attempt.attemptNumber,
        status: attempt.status,
        isCorrect: attempt.isCorrect,
        usedHints: attempt.usedHints,
        timeSpentSeconds: attempt.timeSpentSeconds,
        selectedAnswer,
      };
    });

    // Determine final status from the last attempt (or NOT_ATTEMPTED if none)
    const finalStatus =
      sortedAttempts.length > 0
        ? sortedAttempts[sortedAttempts.length - 1].status
        : "NOT_ATTEMPTED";

    // Sum time across all attempts
    const totalTimeSpent = sortedAttempts.reduce(
      (sum, a) => sum + (a.timeSpentSeconds ?? 0),
      0,
    );

    details.push({
      storyTitle: content.storyTitle,
      storyDifficulty: content.storyDifficulty,
      chapterOrder: content.chapterOrder,
      challengeId,
      challengeType: content.challengeType,
      question: content.question,
      answers: content.answers.map(({ text, isCorrect }) => ({
        text,
        isCorrect,
      })),
      hints: content.hints,
      attempts,
      finalStatus,
      totalTimeSpent,
    });
  }

  // Sort by story order → chapter order
  details.sort((a, b) => {
    const storyA = contentMap.get(a.challengeId)!;
    const storyB = contentMap.get(b.challengeId)!;
    if (storyA.storyOrder !== storyB.storyOrder) {
      return storyA.storyOrder - storyB.storyOrder;
    }
    return a.chapterOrder - b.chapterOrder;
  });

  return details;
}

// ============================================================================
// BEHAVIOR ANALYSIS FUNCTIONS
// ============================================================================

/**
 * Extract behavioral metrics from a single ChallengeAttempt.
 *
 * Uses the `actions` array for granular insight; falls back to attempt-level
 * fields (isCorrect, attemptNumber, status) when actions are unavailable.
 *
 * Derived signals:
 * - attemptSequence  : ordered log of what the child selected/typed
 * - solvedOnFirstTry : child's very first action was correct
 * - selfCorrected    : went incorrect → correct under own steam (no hints)
 * - gaveUp           : challenge ended as SKIPPED after 1+ attempts
 * - hintsRequestedAtAttempt : inferred attempt number(s) where hint was used
 */
function extractAttemptBehaviors(
  attempt: ChallengeAttempt,
  challengeType: string,
): AttemptBehaviorMetrics {
  const actions = attempt.actions ?? [];
  const hasActions = actions.length > 0;

  // -------------------------------------------------------------------------
  // Build attempt sequence
  // -------------------------------------------------------------------------
  let attemptSequence: AttemptBehaviorMetrics["attemptSequence"];

  if (hasActions) {
    // Rich path: derive sequence directly from action records
    attemptSequence = actions.map((action) => ({
      attemptNumber: action.attemptNumberAtAction,
      isCorrect: action.isCorrect,
      selectedAnswerText: action.selectedAnswerText,
      answerText: action.answerText,
    }));
  } else {
    // Fallback: synthesise a single-entry sequence from attempt-level fields
    // Captures the final outcome even without per-action granularity
    attemptSequence = [
      {
        attemptNumber: attempt.attemptNumber,
        isCorrect: attempt.isCorrect,
        selectedAnswerText: null,
        answerText: attempt.textAnswer,
      },
    ];
  }

  // -------------------------------------------------------------------------
  // Derive behavioral flags
  // -------------------------------------------------------------------------
  const gaveUp = attempt.status === "SKIPPED";

  // Solved on the very first action/attempt with no prior failures
  const solvedOnFirstTry =
    !gaveUp &&
    attemptSequence.length > 0 &&
    attemptSequence[0].isCorrect === true;

  // Self-corrected: at least one incorrect action was followed by a correct one,
  // and the child did NOT use any hints (they worked it out themselves)
  const hasIncorrectThenCorrect = attemptSequence.some((action, i) => {
    if (action.isCorrect !== true) return false;
    return attemptSequence.slice(0, i).some((prev) => prev.isCorrect === false);
  });
  const selfCorrected = hasIncorrectThenCorrect && attempt.usedHints === 0;

  // -------------------------------------------------------------------------
  // Infer hint-usage timing
  // -------------------------------------------------------------------------
  // AttemptAction does not record hint events explicitly.
  // Heuristic: hints were requested after the first incorrect action.
  // If no incorrect action exists, hints were used proactively on attempt #1.
  const hintsRequestedAtAttempt: number[] = [];
  if (attempt.usedHints > 0) {
    const firstFailure = attemptSequence.find((a) => a.isCorrect === false);
    hintsRequestedAtAttempt.push(
      firstFailure ? firstFailure.attemptNumber : 1,
    );
  }

  return {
    challengeId: attempt.challengeId,
    challengeType,
    totalActionCount: hasActions ? actions.length : attempt.attemptNumber,
    solvedOnFirstTry,
    selfCorrected,
    gaveUp,
    hintsRequestedAtAttempt,
    attemptSequence,
  };
}

/**
 * Group a flat list of AttemptBehaviorMetrics by challenge type and compute a
 * ChallengeTypeBehaviorSummary for each type.
 *
 * Notes:
 * - CHOOSE_ENDING / MORAL_DECISION treat every non-skipped attempt as solved
 *   (all answers are intentionally correct for those challenge types).
 * - Rates are expressed as percentages rounded to 1 decimal place.
 */
function categorizeByType(
  behaviors: AttemptBehaviorMetrics[],
): { [type: string]: ChallengeTypeBehaviorSummary } {
  // Group by challenge type
  const grouped: { [type: string]: AttemptBehaviorMetrics[] } = {};
  for (const b of behaviors) {
    if (!grouped[b.challengeType]) grouped[b.challengeType] = [];
    grouped[b.challengeType].push(b);
  }

  const result: { [type: string]: ChallengeTypeBehaviorSummary } = {};

  for (const [type, group] of Object.entries(grouped)) {
    const total = group.length;

    // All answers are correct for these challenge types
    const isAllCorrectType =
      type === "CHOOSE_ENDING" || type === "MORAL_DECISION";

    // Solved: not skipped, and either all-correct type or had at least one correct action
    const solvedCount = group.filter((b) => {
      if (b.gaveUp) return false;
      if (isAllCorrectType) return true;
      return (
        b.solvedOnFirstTry ||
        b.selfCorrected ||
        b.attemptSequence.some((a) => a.isCorrect === true)
      );
    }).length;

    const firstTrySolvedCount = group.filter((b) => b.solvedOnFirstTry).length;
    const selfCorrectedCount = group.filter((b) => b.selfCorrected).length;
    const gaveUpCount = group.filter((b) => b.gaveUp).length;

    // Hint early: child asked for help on or before their 2nd attempt
    const hintEarlyCount = group.filter(
      (b) =>
        b.hintsRequestedAtAttempt.length > 0 &&
        Math.min(...b.hintsRequestedAtAttempt) <= 2,
    ).length;

    // Hint after failure: child persisted at least 2 times before requesting a hint
    const hintAfterFailureCount = group.filter(
      (b) =>
        b.hintsRequestedAtAttempt.length > 0 &&
        Math.min(...b.hintsRequestedAtAttempt) > 2,
    ).length;

    // Average actions across solved challenges only
    const solvedBehaviors = group.filter(
      (b) =>
        !b.gaveUp &&
        (isAllCorrectType ||
          b.attemptSequence.some((a) => a.isCorrect === true)),
    );
    const avgActionsBeforeSolve =
      solvedBehaviors.length > 0
        ? Math.round(
            (solvedBehaviors.reduce(
              (sum, b) => sum + b.totalActionCount,
              0,
            ) /
              solvedBehaviors.length) *
              10,
          ) / 10
        : 0;

    const pct = (n: number) =>
      total > 0 ? Math.round((n / total) * 1000) / 10 : 0;

    result[type] = {
      type,
      totalChallenges: total,
      successRate: pct(solvedCount),
      firstTrySolveRate: pct(firstTrySolvedCount),
      averageActionsBeforeSolve: avgActionsBeforeSolve,
      selfCorrectionRate: pct(selfCorrectedCount),
      giveUpRate: pct(gaveUpCount),
      hintEarlyRate: pct(hintEarlyCount),
      hintAfterFailureRate: pct(hintAfterFailureCount),
    };
  }

  return result;
}

/**
 * Derive overall persistence / quick-win signals from per-type summaries.
 *
 * Thresholds (tunable):
 * - Persistence area : give-up rate < 20 % AND avg actions before solve > 1.5
 * - Quick-win area   : first-try solve rate >= 70 %
 * - Global rates use a weighted average across all challenge types.
 */
function calculatePersistenceMetrics(byType: {
  [type: string]: ChallengeTypeBehaviorSummary;
}): {
  giveUpRate: number;
  persistenceAreas: string[];
  quickWinAreas: string[];
  selfCorrectionRate: number;
} {
  const summaries = Object.values(byType);
  if (summaries.length === 0) {
    return {
      giveUpRate: 0,
      persistenceAreas: [],
      quickWinAreas: [],
      selfCorrectionRate: 0,
    };
  }

  const totalChallenges = summaries.reduce(
    (sum, s) => sum + s.totalChallenges,
    0,
  );

  const weightedRate = (rateField: keyof ChallengeTypeBehaviorSummary) =>
    totalChallenges > 0
      ? Math.round(
          (summaries.reduce(
            (sum, s) =>
              sum +
              Math.round(((s[rateField] as number) / 100) * s.totalChallenges),
            0,
          ) /
            totalChallenges) *
            1000,
        ) / 10
      : 0;

  return {
    giveUpRate: weightedRate("giveUpRate"),
    selfCorrectionRate: weightedRate("selfCorrectionRate"),
    // Persistence: child retried multiple times without giving up
    persistenceAreas: summaries
      .filter((s) => s.giveUpRate < 20 && s.averageActionsBeforeSolve > 1.5)
      .map((s) => s.type),
    // Quick wins: child mostly solves on very first try
    quickWinAreas: summaries
      .filter((s) => s.firstTrySolveRate >= 70)
      .map((s) => s.type),
  };
}

/**
 * Orchestrates the full behavior analysis pipeline for a collection of attempts.
 *
 * Call this once all ChallengeAttempts for the week have been gathered
 * (done in Phase 3 inside extractThisWeekMetrics).
 *
 * Returns undefined when no attempts are provided so callers can cleanly
 * omit the field from AnalyticsInput.
 *
 * @param attemptsWithType - Each attempt paired with its challenge type string
 */
export function buildBehaviorInsights(
  attemptsWithType: Array<{ attempt: ChallengeAttempt; challengeType: string }>,
): NonNullable<AnalyticsInput["behaviorInsights"]> | undefined {
  if (attemptsWithType.length === 0) return undefined;

  // Step 1: Extract per-challenge behavioral metrics
  const behaviors = attemptsWithType.map(({ attempt, challengeType }) =>
    extractAttemptBehaviors(attempt, challengeType),
  );

  // Step 2: Aggregate by challenge type
  const byType = categorizeByType(behaviors);

  // Step 3: Derive global signals
  const { giveUpRate, persistenceAreas, quickWinAreas, selfCorrectionRate } =
    calculatePersistenceMetrics(byType);

  return { byType, giveUpRate, persistenceAreas, quickWinAreas, selfCorrectionRate };
}
