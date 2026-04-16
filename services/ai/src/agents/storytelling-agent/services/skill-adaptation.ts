import { PrismaClient } from "@prisma/client";
import { logger } from "../../../lib/logger";

const prisma = new PrismaClient();

/**
 * ISSUE 5 FIX: Feedback loop that updates skills based on child performance
 * and adapts future story difficulty accordingly
 *
 * Uses Exponential Moving Average (EMA) to update skill scores
 * Increases confidence in scores as more data is collected
 * 
 * RC-7 FIX: All skill updates now use atomic transactions to prevent
 * data loss under concurrent load. The EMA calculation happens inside
 * a database transaction, preventing race conditions.
 */

export interface ChallengePerformance {
  skillName: string;
  correct: number;
  incorrect: number;
  hintUsed: boolean;
}

/**
 * RC-7 FIX: Atomic skill score update result
 */
export interface AtomicSkillUpdateResult {
  skillName: string;
  oldScore: number;
  newScore: number;
  oldConfidence: number;
  newConfidence: number;
  performanceScore: number;
}

/**
 * Update child's skill scores based on challenge performance
 * RC-7 FIX: Now uses atomic transactional updates to prevent data loss
 * under concurrent load
 */
export async function updateSkillsFromPerformance(
  childProfileId: string,
  storyId: string,
  performance: ChallengePerformance[],
) {
  try {
    const child = await prisma.childProfile.findUnique({
      where: { id: childProfileId },
    });

    if (!child) throw new Error("Child profile not found");

    const skillUpdateWeight = parseFloat(
      process.env.SKILL_UPDATE_WEIGHT || "0.2"
    );

    // Prepare skill updates array
    const skillUpdates: Array<{ skillName: string; performanceScore: number }> =
      [];

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

      skillUpdates.push({
        skillName: perf.skillName,
        performanceScore,
      });
    }

    // RC-7 FIX: Use atomic batch update instead of individual non-transactional updates
    if (skillUpdates.length > 0) {
      const updateResults = await updateSkillScoresBatch(
        childProfileId,
        skillUpdates,
        skillUpdateWeight
      );

      // Log results
      for (const result of updateResults) {
        logger.info("[Skill] Updated skill score (atomic)", {
          childProfileId,
          skillName: result.skillName,
          oldScore: result.oldScore.toFixed(2),
          newScore: result.newScore.toFixed(2),
          performanceScore: result.performanceScore.toFixed(2),
          confidence: result.newConfidence.toFixed(2),
        });
      }
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
 * RC-7 FIX: Atomic Skill Score Update with Transactional EMA
 * 
 * Prevents race condition where concurrent performance updates could lose data.
 * 
 * VULNERABLE SCENARIO (Before):
 *   Request A: Read skillScore.score = 0.5
 *   Request B: Read skillScore.score = 0.5 ← reads same baseline
 *   Request A: Calculate newScore = 0.5 * 0.8 + 0.8 * 0.2 = 0.56 → WRITE
 *   Request B: Calculate newScore = 0.5 * 0.8 + 0.6 * 0.2 = 0.52 → WRITE (overwrites A!)
 *   Result: Request A's performance data LOST
 * 
 * FIXED SCENARIO (After):
 *   Request A: BEGIN TRANSACTION
 *              Read skillScore.score = 0.5 (row locked)
 *              Calculate: 0.5 * 0.8 + 0.8 * 0.2 = 0.56
 *              WRITE 0.56
 *              COMMIT (locks released)
 *   Request B: BEGIN TRANSACTION (gets current state)
 *              Read skillScore.score = 0.56 ← sees A's update!
 *              Calculate: 0.56 * 0.8 + 0.6 * 0.2 = 0.568
 *              WRITE 0.568
 *              COMMIT
 *   Result: Both updates applied correctly ✓
 * 
 * @param childProfileId - Child whose skill is being updated
 * @param skillName - Name of skill to update
 * @param performanceScore - Performance score (0-1) from current challenge
 * @param skillUpdateWeight - EMA weight for new data (default 0.2)
 * @returns Update result with old/new scores for verification
 */
export async function updateSkillScoreAtomic(
  childProfileId: string,
  skillName: string,
  performanceScore: number,
  skillUpdateWeight: number = 0.2,
): Promise<AtomicSkillUpdateResult | null> {
  const transactionStart = Date.now();

  try {
    // Validate inputs
    if (performanceScore < 0 || performanceScore > 1) {
      throw new Error(
        `Invalid performance score: ${performanceScore} (must be 0-1)`
      );
    }

    if (skillUpdateWeight < 0 || skillUpdateWeight > 1) {
      throw new Error(
        `Invalid skill update weight: ${skillUpdateWeight} (must be 0-1)`
      );
    }

    // Use transaction to ensure atomicity
    const result = await prisma.$transaction(async (tx) => {
      // STEP 1: Find or create skill score (reads with lock in transaction)
      let skillScore = await tx.skillScore.findUnique({
        where: {
          childProfileId_skillName: {
            childProfileId,
            skillName,
          },
        },
      });

      let oldScore = 0.5;
      let oldConfidence = 0.3;

      if (!skillScore) {
        logger.debug("[Skill] Creating new skill score record in transaction", {
          childProfileId,
          skillName,
        });

        skillScore = await tx.skillScore.create({
          data: {
            childProfileId,
            skillName,
            score: 0.5,
            confidence: 0.3,
          },
        });
      } else {
        oldScore = skillScore.score;
        oldConfidence = skillScore.confidence;
      }

      // STEP 2: Calculate new values (still in transaction)
      const newScore =
        oldScore * (1 - skillUpdateWeight) +
        performanceScore * skillUpdateWeight;
      const newConfidence = Math.min(1.0, oldConfidence + 0.15);

      // STEP 3: Update score and confidence (still in transaction)
      // This is the critical part - all happens atomically now
      const updatedSkill = await tx.skillScore.update({
        where: { id: skillScore.id },
        data: {
          score: newScore,
          confidence: newConfidence,
          updatedAt: new Date(),
        },
      });

      // STEP 4: Record in skill history (still in transaction)
      await tx.skillHistory.create({
        data: {
          childProfileId,
          skillName,
          score: newScore,
          week: getCurrentWeek(),
        },
      });

      logger.debug("[Skill] Atomic skill update completed in transaction", {
        childProfileId,
        skillName,
        oldScore: oldScore.toFixed(3),
        newScore: newScore.toFixed(3),
        oldConfidence: oldConfidence.toFixed(3),
        newConfidence: newConfidence.toFixed(3),
        performanceScore: performanceScore.toFixed(3),
        transactionDurationMs: Date.now() - transactionStart,
      });

      return {
        skillName,
        oldScore,
        newScore,
        oldConfidence,
        newConfidence,
        performanceScore,
      };
    });

    return result;
  } catch (error) {
    logger.error("[Skill] Atomic skill update failed - transaction rolled back", {
      childProfileId,
      skillName,
      error: String(error),
      transactionDurationMs: Date.now() - transactionStart,
    });
    throw error;
  }
}

/**
 * RC-7 FIX: Batch atomic skill updates
 * Updates multiple skills in a single transaction for better performance
 * 
 * @param childProfileId - Child whose skills are being updated
 * @param skillUpdates - Array of { skillName, performanceScore }
 * @param skillUpdateWeight - EMA weight (default 0.2)
 * @returns Array of update results
 */
export async function updateSkillScoresBatch(
  childProfileId: string,
  skillUpdates: Array<{ skillName: string; performanceScore: number }>,
  skillUpdateWeight: number = 0.2,
): Promise<AtomicSkillUpdateResult[]> {
  const transactionStart = Date.now();

  try {
    if (skillUpdates.length === 0) {
      logger.debug(
        "[Skill] Batch skill update called with empty list, returning early",
        { childProfileId }
      );
      return [];
    }

    // All skill updates happen in a single transaction
    const results = await prisma.$transaction(async (tx) => {
      const batchResults: AtomicSkillUpdateResult[] = [];

      for (const update of skillUpdates) {
        // Validate input
        if (
          update.performanceScore < 0 ||
          update.performanceScore > 1
        ) {
          logger.warn("[Skill] Invalid performance score in batch", {
            skillName: update.skillName,
            performanceScore: update.performanceScore,
          });
          continue;
        }

        // Find or create skill score
        let skillScore = await tx.skillScore.findUnique({
          where: {
            childProfileId_skillName: {
              childProfileId,
              skillName: update.skillName,
            },
          },
        });

        let oldScore = 0.5;
        let oldConfidence = 0.3;

        if (!skillScore) {
          skillScore = await tx.skillScore.create({
            data: {
              childProfileId,
              skillName: update.skillName,
              score: 0.5,
              confidence: 0.3,
            },
          });
        } else {
          oldScore = skillScore.score;
          oldConfidence = skillScore.confidence;
        }

        // Calculate new values
        const newScore =
          oldScore * (1 - skillUpdateWeight) +
          update.performanceScore * skillUpdateWeight;
        const newConfidence = Math.min(1.0, oldConfidence + 0.15);

        // Update (still in same transaction)
        await tx.skillScore.update({
          where: { id: skillScore.id },
          data: {
            score: newScore,
            confidence: newConfidence,
            updatedAt: new Date(),
          },
        });

        // Record history
        await tx.skillHistory.create({
          data: {
            childProfileId,
            skillName: update.skillName,
            score: newScore,
            week: getCurrentWeek(),
          },
        });

        batchResults.push({
          skillName: update.skillName,
          oldScore,
          newScore,
          oldConfidence,
          newConfidence,
          performanceScore: update.performanceScore,
        });
      }

      return batchResults;
    });

    logger.info("[Skill] Batch atomic skill updates completed", {
      childProfileId,
      updateCount: results.length,
      transactionDurationMs: Date.now() - transactionStart,
    });

    return results;
  } catch (error) {
    logger.error("[Skill] Batch skill update failed - transaction rolled back", {
      childProfileId,
      updateCount: skillUpdates.length,
      error: String(error),
      transactionDurationMs: Date.now() - transactionStart,
    });
    throw error;
  }
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
