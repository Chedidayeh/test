import { PrismaClient } from "@prisma/client";
import { logger } from "../../../lib/logger";

const prisma = new PrismaClient();

/**
 * ISSUE 5 FIX: Feedback loop that updates skills based on child performance
 * and adapts future story difficulty accordingly
 *
 * Uses Exponential Moving Average (EMA) to update skill scores
 * Increases confidence in scores as more data is collected
 */

export interface ChallengePerformance {
  skillName: string;
  correct: number;
  incorrect: number;
  hintUsed: boolean;
}

/**
 * Update child's skill scores based on challenge performance
 * Uses EMA to blend previous scores with new performance data
 */
export async function updateSkillsFromPerformance(
  childProfileId: string,
  storyId: string,
  performance: ChallengePerformance[],
) {
  try {
    const child = await prisma.childProfile.findUnique({
      where: { id: childProfileId },
      include: { skillScores: true },
    });

    if (!child) throw new Error("Child profile not found");

    const skillUpdateWeight = parseFloat(
      process.env.SKILL_UPDATE_WEIGHT || "0.2"
    );

    // Calculate new scores based on performance
    for (const perf of performance) {
      // Validate performance data
      const totalChallenges = perf.correct + perf.incorrect;
      if (totalChallenges === 0) {
        logger.warn("[Skill] Skill has no challenges", {
          skillName: perf.skillName,
        });
        continue;
      }

      const successRate = perf.correct / totalChallenges;
      const hintPenalty = perf.hintUsed ? 0.1 : 0;

      // Performance score 0-1 (with hint penalty for assistance)
      const performanceScore = Math.max(0, successRate - hintPenalty);

      // Find or create skill score
      let skillScore = child.skillScores.find(
        (s) => s.skillName === perf.skillName
      );

      if (!skillScore) {
        skillScore = await prisma.skillScore.create({
          data: {
            childProfileId,
            skillName: perf.skillName,
            score: 0.5, // Start at neutral
            confidence: 0.3, // Low confidence initially
          },
        });
      }

      // EMA (Exponential Moving Average) update
      // New_Score = Old_Score * (1 - weight) + New_Data * weight
      const newScore =
        skillScore.score * (1 - skillUpdateWeight) +
        performanceScore * skillUpdateWeight;

      // Increase confidence in score over time
      // Each evaluation adds confidence up to 1.0
      const newConfidence = Math.min(1.0, skillScore.confidence + 0.15);

      await prisma.skillScore.update({
        where: { id: skillScore.id },
        data: {
          score: newScore,
          confidence: newConfidence,
        },
      });

      // Record in skill history for progression tracking
      await prisma.skillHistory.create({
        data: {
          childProfileId,
          skillName: perf.skillName,
          score: newScore,
          week: getCurrentWeek(),
        },
      });

      logger.info("[Skill] Updated skill score", {
        childProfileId,
        skillName: perf.skillName,
        oldScore: skillScore.score.toFixed(2),
        newScore: newScore.toFixed(2),
        performanceScore: performanceScore.toFixed(2),
        confidence: newConfidence.toFixed(2),
      });
    }

    // Recalculate child's average skill score to determine next difficulty
    const updatedChild = await prisma.childProfile.findUnique({
      where: { id: childProfileId },
      include: { skillScores: true },
    });

    if (updatedChild && updatedChild.skillScores.length > 0) {
      const avgSkillScore =
        updatedChild.skillScores.reduce((sum, s) => sum + s.score, 0) /
        updatedChild.skillScores.length;

      const difficultyAdjustment = calculateDifficultyAdjustment(avgSkillScore);

      logger.info("[Skill] Difficulty adjustment calculated", {
        childProfileId,
        avgSkillScore: avgSkillScore.toFixed(2),
        difficultyAdjustment: difficultyAdjustment.toFixed(2),
      });

      return { difficultyAdjustment };
    }
  } catch (error) {
    logger.error("[Skill] Failed to update skills from performance", {
      error: String(error),
      childProfileId,
      storyId,
    });
    throw error;
  }
}

/**
 * Calculate difficulty adjustment based on average skill score
 * ISSUE 5 FIX: Adaptive difficulty based on performance
 *
 * Score ranges:
 * < 0.40: Struggling - decrease by 0.5
 * 0.40-0.55: Below average - decrease by 0.25
 * 0.55-0.70: On track - no change
 * 0.70-0.85: Above average - increase by 0.25
 * > 0.85: Excelling - increase by 0.5
 */
function calculateDifficultyAdjustment(avgSkillScore: number): number {
  if (avgSkillScore < 0.4) {
    return -0.5; // Struggling - make it easier
  }
  if (avgSkillScore < 0.55) {
    return -0.25; // Below average
  }
  if (avgSkillScore > 0.85) {
    return 0.5; // Excelling - challenge more
  }
  if (avgSkillScore > 0.7) {
    return 0.25; // Above average
  }
  return 0; // On track - maintain current difficulty
}

/**
 * Get the current week number since epoch
 * Used for skill history grouping
 */
function getCurrentWeek(): number {
  // Calculate week number from milliseconds since epoch
  const WEEK_MS = 7 * 24 * 60 * 60 * 1000;
  return Math.floor(Date.now() / WEEK_MS);
}

/**
 * Get adapted difficulty for next story
 * Considers both base world difficulty and child's current skill level
 *
 * ISSUE 5 FIX: Difficulty adaptation based on performance
 */
export async function getAdaptedDifficulty(
  childProfileId: string,
  baseDifficulty: number,
): Promise<number> {
  try {
    const child = await prisma.childProfile.findUnique({
      where: { id: childProfileId },
      include: { skillScores: true },
    });

    if (!child) {
      logger.warn("[Skill] Child profile not found for difficulty adaptation", {
        childProfileId,
      });
      return baseDifficulty;
    }

    // If no skill scores yet, use base difficulty
    if (child.skillScores.length === 0) {
      logger.debug("[Skill] No skill scores found, using base difficulty", {
        childProfileId,
        baseDifficulty,
      });
      return baseDifficulty;
    }

    // Calculate average skill score
    const avgSkill =
      child.skillScores.reduce((sum, s) => sum + s.score, 0) /
      child.skillScores.length;

    // Get difficulty adjustment
    const adjustment = calculateDifficultyAdjustment(avgSkill);

    // Clamp final difficulty to valid range [1.0, 5.0]
    const adaptedDifficulty = Math.max(
      1.0,
      Math.min(5.0, baseDifficulty + adjustment)
    );

    logger.debug("[Skill] Adapted difficulty calculated", {
      childProfileId,
      baseDifficulty: baseDifficulty.toFixed(2),
      avgSkill: avgSkill.toFixed(2),
      adjustment: adjustment.toFixed(2),
      adaptedDifficulty: adaptedDifficulty.toFixed(2),
    });

    return adaptedDifficulty;
  } catch (error) {
    logger.error("[Skill] Failed to calculate adapted difficulty", {
      error: String(error),
      childProfileId,
      baseDifficulty,
    });
    // Fallback to base difficulty on error
    return baseDifficulty;
  }
}

/**
 * Record a performance evaluation for a completed story
 * Stores comprehensive performance data for analytics and adaptation
 */
export async function recordPerformanceEvaluation(
  childProfileId: string,
  storyId: string,
  totalChallenges: number,
  correctAnswers: number,
  incorrectAnswers: number,
  hintUsageCount: number,
  skillsAssessed: Record<string, { score: number; confidence: number }>,
) {
  try {
    const evaluation = await prisma.performanceEvaluation.create({
      data: {
        childProfileId,
        storyId,
        totalChallenges,
        correctAnswers,
        incorrectAnswers,
        hintUsageCount,
        skillsAssessed: skillsAssessed,
        suggestedDifficultyAdjustment: calculateDifficultyAdjustment(
          Object.values(skillsAssessed).reduce((sum, s) => sum + s.score, 0) /
            Object.keys(skillsAssessed).length
        ),
        skillsThatNeedWork: Object.entries(skillsAssessed)
          .filter(([, data]) => data.score < 0.5)
          .map(([name]) => name),
        skillsThatExcel: Object.entries(skillsAssessed)
          .filter(([, data]) => data.score > 0.8)
          .map(([name]) => name),
      },
    });

    logger.info("[Skill] Performance evaluation recorded", {
      childProfileId,
      storyId,
      successRate: (
        (correctAnswers / totalChallenges) *
        100
      ).toFixed(2),
      hintUsageCount,
    });

    return evaluation;
  } catch (error) {
    logger.error("[Skill] Failed to record performance evaluation", {
      error: String(error),
      childProfileId,
      storyId,
    });
    throw error;
  }
}
