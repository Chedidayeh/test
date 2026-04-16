import { PrismaClient } from "@prisma/client";
import { logger } from "../../../lib/logger";

const prisma = new PrismaClient();

/**
 * PHASE 2: Plan Completion Detection & Context Extraction
 * 
 * Detects when a child has completed all stories in their active plan
 * and extracts learning context for the next plan generation.
 * 
 * This service bridges Phase 1 (data model) and Phase 3-5 (plan lifecycle).
 */

/**
 * PlanContext: Captured learning summary from completed plan
 * Passed to new plan generation to ensure continuity and progression
 */
export interface PlanContext {
  // Child information
  childName: string;

  // Themes already taught (shouldn't repeat heavily)
  taughtThemes: string[];
  
  // Objectives that have been covered
  taughtObjectives: string[];
  
  // Skills that child has demonstrated mastery in
  masteredSkills: string[];
  
  // Skills that need further development
  needsDevelopmentSkills: string[];
  
  // Difficulty progression info
  startingDifficulty: number;
  endingDifficulty: number;
  averageDifficulty: number;
  
  // Reading level progression
  startingReadingLevel: number;
  endingReadingLevel: number;
  
  // Characters and world state from completed plan
  frequentCharacters: string[];
  worldThemes: string[];
  
  // What to avoid in next plan
  avoid: {
    themes: string[];
    objectives: string[];
    conflicts: string[];
  };
  
  // Achievements from this plan
  achievements: string[];
  
  // Timestamp and version info
  completedPlanId: string;
  completedAt: Date;
  planVersion: number;
  totalStoriesCompleted: number;
  estimatedLearningGains: string;
}

/**
 * Plan completion statistics
 */
export interface PlanCompletionStats {
  completedWorldCount: number;
  totalWorldCount: number;
  completedStoryCount: number;
  totalEstimatedStories: number;
  completionPercentage: number;
  isFullyCompleted: boolean;
}

/**
 * Check if a plan is completed and return statistics
 * 
 * @param childProfileId - Child to check
 * @returns Completion statistics
 */
export async function checkPlanCompletion(
  childProfileId: string,
): Promise<PlanCompletionStats> {
  try {
    const plan = await prisma.storyPlan.findUnique({
      where: { childProfileId },
      include: {
        worlds: {
          include: {
            stories: true,
          },
        },
      },
    });

    // FIRST RUN CASE: No plan exists yet (child is new to storytelling)
    // Return empty stats - plan is neither complete nor needs regeneration
    if (!plan) {
      logger.debug("[Plan Completion Service] No plan exists for child (first run)", {
        childProfileId,
      });
      
      const emptyStats: PlanCompletionStats = {
        completedWorldCount: 0,
        totalWorldCount: 0,
        completedStoryCount: 0,
        totalEstimatedStories: 0,
        completionPercentage: 0,
        isFullyCompleted: false,
      };
      
      return emptyStats;
    }

    // Count completed worlds
    const completedWorldCount = plan.worlds.filter(w => w.isCompleted).length;
    const totalWorldCount = plan.worlds.length;

    // Count completed stories
    let completedStoryCount = 0;
    plan.worlds.forEach(world => {
      completedStoryCount += world.stories.filter(s => s.isCompleted).length;
    });

    // Estimate total stories (sum of estimated story counts per world)
    const totalEstimatedStories = plan.worlds.reduce(
      (sum, w) => sum + w.estimatedStoryCount,
      0,
    );

    // Calculate percentage
    const completionPercentage =
      totalEstimatedStories > 0
        ? Math.round((completedStoryCount / totalEstimatedStories) * 100)
        : 0;

    // Check if fully completed (all worlds completed and all stories done)
    const isFullyCompleted =
      completedWorldCount === totalWorldCount &&
      completedStoryCount >= totalEstimatedStories * 0.95; // 95% threshold for "fully completed"

    const stats: PlanCompletionStats = {
      completedWorldCount,
      totalWorldCount,
      completedStoryCount,
      totalEstimatedStories,
      completionPercentage,
      isFullyCompleted,
    };

    logger.info("[Plan Completion Service] Completion stats calculated", {
      childProfileId,
      ...stats,
    });

    return stats;
  } catch (error) {
    logger.error("[Plan Completion Service] Failed to check plan completion", {
      childProfileId,
      error: String(error),
    });
    throw error;
  }
}

/**
 * Determine if a new plan should be generated
 * 
 * @param childProfileId - Child to check
 * @returns true if plan is fully completed and new one should be generated
 */
export async function shouldGenerateNewPlan(
  childProfileId: string,
): Promise<boolean> {
  try {
    const stats = await checkPlanCompletion(childProfileId);

    // If no plan exists (first run), don't generate a "new" plan
    // The controller will generate the initial plan
    if (stats.totalWorldCount === 0) {
      logger.debug("[Plan Completion Service] No existing plan - controller will create initial plan", {
        childProfileId,
      });
      return false;
    }

    // Generate new plan if currently completed
    if (stats.isFullyCompleted) {
      logger.info("[Plan Completion Service] Child ready for new plan", {
        childProfileId,
        completionPercentage: stats.completionPercentage,
      });
      return true;
    }

    logger.debug(
      "[Plan Completion Service] Plan not yet ready for regeneration",
      {
        childProfileId,
        completionPercentage: stats.completionPercentage,
      },
    );
    return false;
  } catch (error) {
    logger.error(
      "[Plan Completion Service] Failed to determine if new plan needed",
      {
        childProfileId,
        error: String(error),
      },
    );
    // Don't throw - just return false and let system proceed
    // This is safer than crashing on edge cases
    return false;
  }
}

/**
 * Extract learning context from a completed plan
 * Creates a PlanContext that will be passed to the new plan generation
 * 
 * @param completedPlanId - Plan ID to extract context from
 * @returns PlanContext for upcoming plan generation
 */
export async function extractPlanContext(
  completedPlanId: string,
): Promise<PlanContext> {
  try {
    const plan = await prisma.storyPlan.findUnique({
      where: { id: completedPlanId },
      include: {
        worlds: {
          include: {
            stories: {
              include: {
                generatedStory: true,
              },
            },
          },
        },
        childProfile: {
          include: {
            skillScores: true,
            narrativeMemory: {
              include: {
                characters: true,
              },
            },
          },
        },
        history: true,
      },
    });

    if (!plan) {
      throw new Error("Plan not found");
    }

    // Extract taught themes from worlds
    const taughtThemes = plan.worlds.map(w => w.theme);

    // Extract taught objectives from all stories
    const taughtObjectives = [
      ...new Set(plan.worlds.flatMap(w => w.stories.flatMap(s => s.objectives))),
    ];

    // Extract learning focuses
    const worldFocuses = [
      ...new Set(plan.worlds.flatMap(w => w.learningFocus)),
    ];

    // Get skill scores to identify mastered vs needing development
    const skillScores = plan.childProfile.skillScores || [];
    const masteredSkills = skillScores
      .filter(s => s.score >= 0.75)
      .map(s => s.skillName);
    const needsDevelopmentSkills = skillScores
      .filter(s => s.score < 0.6)
      .map(s => s.skillName);

    // Calculate difficulty progression
    const difficulties = plan.worlds
      .flatMap(w => w.stories.map(s => s.baseDifficulty))
      .filter(d => d !== undefined);
    const startingDifficulty = difficulties[0] || 1;
    const endingDifficulty = difficulties[difficulties.length - 1] || 5;
    const averageDifficulty =
      difficulties.length > 0
        ? difficulties.reduce((a, b) => a + b, 0) / difficulties.length
        : 2.5;

    // Reading level progression (from child profile)
    const startingReadingLevel = plan.childProfile.readingLevel;
    const endingReadingLevel = Math.min(
      5,
      startingReadingLevel + Math.floor(plan.version / 2),
    );

    // Extract character information from narrative memory
    const characters = plan.childProfile.narrativeMemory?.characters || [];
    const frequentCharacters = characters
      .sort((a, b) => (b.appearances?.length || 0) - (a.appearances?.length || 0))
      .slice(0, 5)
      .map(c => c.name);

    // Extract world themes (same as taughtThemes)
    const worldThemes = taughtThemes;

    // Define what to avoid in next plan
    const avoid = {
      themes: taughtThemes.slice(0, Math.ceil(taughtThemes.length * 0.5)), // Avoid half of recent themes
      objectives: taughtObjectives.slice(0, Math.ceil(taughtObjectives.length * 0.3)), // Avoid ~30%
      conflicts: [] as string[], // Can be expanded with actual conflict types if needed
    };

    // Collect achievements
    const achievements = [
      `Completed ${plan.worlds.length} themed worlds`,
      `Mastered ${masteredSkills.length} reading skills`,
      `Progressed from reading level ${startingReadingLevel} to ${endingReadingLevel}`,
      `Engaged with ${frequentCharacters.length} memorable characters`,
    ];

    // Count total stories completed
    const totalStoriesCompleted = plan.worlds.reduce((sum, w) => {
      return sum + w.stories.filter(s => s.isCompleted).length;
    }, 0);

    // Generate learning gains summary
    const estimatedLearningGains = `
Child has demonstrated progression in:
- Reading level: ${startingReadingLevel} → ${endingReadingLevel}
- Vocabulary mastery across ${taughtObjectives.length} learning objectives
- Character comprehension and narrative understanding
- Complex plot reasoning and inference skills
Ready for: More sophisticated storytelling, deeper themes, greater autonomy
    `.trim();

    const context: PlanContext = {
      childName: plan.childProfile.name,
      taughtThemes,
      taughtObjectives,
      masteredSkills,
      needsDevelopmentSkills,
      startingDifficulty,
      endingDifficulty,
      averageDifficulty,
      startingReadingLevel,
      endingReadingLevel,
      frequentCharacters,
      worldThemes,
      avoid,
      achievements,
      completedPlanId,
      completedAt: plan.completedAt || new Date(),
      planVersion: plan.planVersion,
      totalStoriesCompleted,
      estimatedLearningGains,
    };

    logger.info("[Plan Completion Service] Context extracted from completed plan", {
      completedPlanId,
      childProfileId: plan.childProfileId,
      taughtThemesCount: taughtThemes.length,
      masteredSkillsCount: masteredSkills.length,
      totalStoriesCompleted,
    });

    return context;
  } catch (error) {
    logger.error("[Plan Completion Service] Failed to extract plan context", {
      completedPlanId,
      error: String(error),
    });
    throw error;
  }
}

/**
 * Mark a plan as completed and record the event in history
 * 
 * @param planId - Plan to complete
 * @param reason - Reason for completion (for tracking)
 * @returns Updated plan
 */
export async function completePlan(
  planId: string,
  reason: string = "All stories completed",
) {
  try {
    const now = new Date();

    // Update plan status and completion info
    const updatedPlan = await prisma.storyPlan.update({
      where: { id: planId },
      data: {
        planStatus: "completed",
        completedAt: now,
        completedPercentage: 100,
      },
    });

    // Record completion in history
    await prisma.planHistory.create({
      data: {
        storyPlanId: planId,
        event: "completed",
        description: reason,
        metadata: {
          completedAt: now.toISOString(),
          planVersion: updatedPlan.planVersion,
          finalStatus: "completed",
        },
      },
    });

    logger.info("[Plan Completion Service] Plan marked as completed", {
      planId,
      reason,
      completedAt: now,
    });

    return updatedPlan;
  } catch (error) {
    logger.error("[Plan Completion Service] Failed to complete plan", {
      planId,
      error: String(error),
    });
    throw error;
  }
}

/**
 * Record a new plan generation event in the history of the previous plan
 * Links the old and new plans together
 * 
 * @param previousPlanId - Plan that was completed
 * @param newPlanId - New plan being created
 * @returns History entry
 */
export async function recordPlanRegeneration(
  previousPlanId: string,
  newPlanId: string,
) {
  try {
    const historyEntry = await prisma.planHistory.create({
      data: {
        storyPlanId: previousPlanId,
        event: "regenerated",
        description: "New plan generated based on learning progress",
        metadata: {
          newPlanId,
          regeneratedAt: new Date().toISOString(),
        },
      },
    });

    logger.info(
      "[Plan Completion Service] Plan regeneration recorded in history",
      {
        previousPlanId,
        newPlanId,
      },
    );

    return historyEntry;
  } catch (error) {
    logger.error(
      "[Plan Completion Service] Failed to record plan regeneration",
      {
        previousPlanId,
        newPlanId,
        error: String(error),
      },
    );
    throw error;
  }
}

/**
 * Get completion history for a child across all plan versions
 * 
 * @param childProfileId - Child ID
 * @returns Array of plan history entries
 */
export async function getPlanHistory(childProfileId: string) {
  try {
    // Get all plans for this child
    const plans = await prisma.storyPlan.findMany({
      where: { childProfileId },
      include: {
        history: {
          orderBy: { timestamp: "desc" },
        },
      },
      orderBy: { createdAt: "asc" },
    });

    // Flatten and sort all history entries
    const allHistory = plans
      .flatMap(plan =>
        plan.history.map(h => ({
          ...h,
          planVersion: plan.planVersion,
          planId: plan.id,
        })),
      )
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    logger.info("[Plan Completion Service] Plan history retrieved", {
      childProfileId,
      totalPlans: plans.length,
      totalHistoryEntries: allHistory.length,
    });

    return allHistory;
  } catch (error) {
    logger.error("[Plan Completion Service] Failed to get plan history", {
      childProfileId,
      error: String(error),
    });
    throw error;
  }
}

/**
 * FIX: Validate and ensure an active plan exists for child
 * Detects orphaned plan states where child has no active plan
 * This can happen if plan regeneration fails mid-process
 * 
 * @param childProfileId - Child ID to check
 * @returns true if active plan exists, false otherwise
 */
export async function ensureActivePlanExists(
  childProfileId: string,
): Promise<boolean> {
  try {
    const activePlan = await prisma.storyPlan.findFirst({
      where: {
        childProfileId,
        planStatus: { in: ["active", "generating"] },
      },
      orderBy: { createdAt: "desc" },
    });

    if (activePlan) {
      logger.debug("[Plan Completion Service] Active plan verified", {
        childProfileId,
        planId: activePlan.id,
        status: activePlan.planStatus,
      });
      return true;
    }

    logger.warn(
      "[Plan Completion Service] CRITICAL: No active plan found for child - checking recovery options",
      {
        childProfileId,
      },
    );

    // Try to recover: Mark most recent completed plan as active
    // This handles edge case where regeneration failed
    const mostRecentPlan = await prisma.storyPlan.findFirst({
      where: { childProfileId },
      orderBy: { createdAt: "desc" },
    });

    if (mostRecentPlan && mostRecentPlan.planStatus === "completed") {
      logger.warn(
        "[Plan Completion Service] Recovering orphaned child - restoring most recent plan to active status",
        {
          childProfileId,
          planId: mostRecentPlan.id,
          fromStatus: mostRecentPlan.planStatus,
        },
      );

      // Restore plan to active status
      await prisma.storyPlan.update({
        where: { id: mostRecentPlan.id },
        data: { planStatus: "active" },
      });

      // Record recovery event
      await prisma.planHistory.create({
        data: {
          storyPlanId: mostRecentPlan.id,
          event: "recovered",
          description: "Plan recovered from orphaned state during regeneration failure",
          metadata: {
            recoveryReason: "No active plan found",
            recoveredAt: new Date().toISOString(),
          },
        },
      });

      logger.info("[Plan Completion Service] Plan successfully recovered", {
        childProfileId,
        planId: mostRecentPlan.id,
      });

      return true;
    }

    logger.error(
      "[Plan Completion Service] CRITICAL: Cannot recover - no plans exist for child",
      {
        childProfileId,
      },
    );
    return false;
  } catch (error) {
    logger.error("[Plan Completion Service] Failed to validate/restore active plan", {
      childProfileId,
      error: String(error),
    });
    throw error;
  }
}

/**
 * RC-3 FIX: Atomic Plan Regeneration to Prevent Race Condition
 * E9 FIX: Transaction ensures new plan creation is atomic with old plan completion
 * 
 * This function prevents the race condition where two concurrent requests
 * both detect plan completion and attempt to regenerate a new plan.
 * 
 * RACE SCENARIO (VULNERABLE - fixed by this function):
 *   Request A: shouldGenerateNewPlan() → true
 *   Request B: shouldGenerateNewPlan() → true (same time)
 *   Request A: extractContext → generatePlan → completePlan ✓
 *   Request B: extractContext → generatePlan → completePlan (DUPLICATE!)
 * 
 * TRANSACTION GAP (E9 - also fixed by this function):
 *   Request A: generatePlan() creates new plan using global prisma (outside transaction)
 *   Request A: completePlan() happens inside transaction
 *   If failure between these: New plan exists, old plan still active (orphaned state)
 * 
 * SOLUTION: Use Prisma transaction to atomically:
 *   1. Re-check plan is actually complete (not already regenerated)
 *   2. Generate new plan (using transaction client for atomicity)
 *   3. Mark old plan completed
 *   4. Record regeneration link
 * 
 * If Request B executes after Request A, it will see the old plan is already
 * completed and skip regeneration, preventing duplicates.
 * 
 * All operations happen in same transaction - if new plan generation fails,
 * nothing is committed and old plan stays active for retry.
 * 
 * @param childProfileId - Child whose plan should be regenerated
 * @param generateNewPlanFn - Function to generate new plan with context AND transaction client
 * @returns Object with status and plan IDs { regenerated: boolean, oldPlanId, newPlanId }
 */
export async function attemptAtomicPlanRegeneration(
  childProfileId: string,
  generateNewPlanFn: (planContext: PlanContext, txClient: any) => Promise<any>,
): Promise<{
  regenerated: boolean;
  oldPlanId?: string;
  newPlanId?: string;
  reason?: string;
}> {
  const transactionStart = Date.now();

  try {
    logger.info("[Plan Completion Service] Starting atomic plan regeneration attempt", {
      childProfileId,
      reason: "E9 FIX: Atomic generation with transaction client",
    });

    // Use Prisma transaction to ensure atomicity
    // E9 FIX: Everything happens in same transaction
    const result = await prisma.$transaction(async (tx) => {
      // STEP 1: Re-check that plan is actually complete (inside transaction)
      // This is the key to preventing race conditions
      const plan = await tx.storyPlan.findFirst({
        where: {
          childProfileId,
          planStatus: { in: ["active", "generating"] }, // Only unfinished plans
        },
        orderBy: { createdAt: "desc" },
        include: {
          worlds: {
            include: {
              stories: true,
            },
          },
          childProfile: {
            include: {
              skillScores: true,
              narrativeMemory: {
                include: {
                  characters: true,
                },
              },
            },
          },
        },
      });

      // If no active plan found, regeneration already happened or plan doesn't exist
      if (!plan) {
        logger.debug(
          "[Plan Completion Service] No active plan found in transaction - regeneration may have already occurred",
          { childProfileId }
        );
        return {
          regenerated: false,
          reason: "No active plan found (already regenerated or not created)",
        };
      }

      // STEP 2: Double-check completion status
      let completedWorldCount = plan.worlds.filter(w => w.isCompleted).length;
      let completedStoryCount = 0;
      plan.worlds.forEach(world => {
        completedStoryCount += world.stories.filter(s => s.isCompleted).length;
      });

      const totalEstimatedStories = plan.worlds.reduce(
        (sum, w) => sum + w.estimatedStoryCount,
        0,
      );

      const completionPercentage =
        totalEstimatedStories > 0
          ? Math.round((completedStoryCount / totalEstimatedStories) * 100)
          : 0;

      const isFullyCompleted =
        completedWorldCount === plan.worlds.length &&
        completedStoryCount >= totalEstimatedStories * 0.95;

      if (!isFullyCompleted) {
        logger.debug(
          "[Plan Completion Service] Plan not fully complete in transaction - skipping regeneration",
          {
            childProfileId,
            completionPercentage,
            completedStories: completedStoryCount,
            totalEstimated: totalEstimatedStories,
          }
        );
        return {
          regenerated: false,
          reason: "Plan not fully complete",
        };
      }

      // STEP 3: Generate new plan with context
      logger.debug("[Plan Completion Service] Plan confirmed complete, extracting context for new plan", {
        childProfileId,
        oldPlanId: plan.id,
        completionPercentage,
      });

      const planContext = await extractPlanContextFromPlan(plan);
      
      let newPlan;
      try {
        // E9 FIX: Pass transaction client to generateNewPlanFn
        // This ensures new plan creation happens INSIDE the same transaction
        newPlan = await generateNewPlanFn(planContext, tx);
      } catch (generationError) {
        logger.error(
          "[Plan Completion Service] New plan generation failed in transaction",
          {
            childProfileId,
            error: String(generationError),
          }
        );
        // Re-throw to trigger transaction rollback
        throw new Error(
          `New plan generation failed: ${String(generationError)}`
        );
      }

      // STEP 4: Mark old plan as completed (still in transaction)
      // E9 FIX: This happens after new plan is created, but both are in same transaction
      // If this fails, both the new plan creation AND this update are rolled back
      const completedPlan = await tx.storyPlan.update({
        where: { id: plan.id },
        data: {
          planStatus: "completed",
          completedAt: new Date(),
          completedPercentage: 100,
        },
      });

      logger.debug("[Plan Completion Service] Old plan marked completed in transaction", {
        childProfileId,
        oldPlanId: plan.id,
      });

      // STEP 5: Record regeneration link in history (still in transaction)
      await tx.planHistory.create({
        data: {
          storyPlanId: plan.id,
          event: "regenerated",
          description: "Atomic plan regeneration completed with transaction client",
          metadata: {
            newPlanId: newPlan.id,
            regeneratedAt: new Date().toISOString(),
            transactionDuration: Date.now() - transactionStart,
            e9FixApplied: true, // E9 FIX marker
          },
        },
      });

      logger.info("[Plan Completion Service] Atomic plan regeneration completed", {
        childProfileId,
        oldPlanId: plan.id,
        newPlanId: newPlan.id,
        planVersion: newPlan.planVersion,
        transactionDurationMs: Date.now() - transactionStart,
        e9FixApplied: true,
      });

      return {
        regenerated: true,
        oldPlanId: plan.id,
        newPlanId: newPlan.id,
      };
    });

    return result;
  } catch (error) {
    logger.error(
      "[Plan Completion Service] Atomic plan regeneration failed - transaction rolled back",
      {
        childProfileId,
        error: String(error),
        transactionDurationMs: Date.now() - transactionStart,
      }
    );

    // Return failure status (don't throw, let caller decide what to do)
    return {
      regenerated: false,
      reason: `Transaction failed: ${String(error)}`,
    };
  }
}

/**
 * Helper function to extract context from an existing plan object
 * (used inside transaction where we already have the plan loaded)
 */
async function extractPlanContextFromPlan(plan: any): Promise<PlanContext> {
  const taughtThemes: string[] = plan.worlds.map((w: any) => w.theme);
  const taughtObjectives: string[] = [
    ...new Set(
      plan.worlds
        .flatMap((w: any) => w.stories.flatMap((s: any) => s.objectives))
        .filter((obj: any) => typeof obj === 'string')
    ),
  ] as string[];

  const skillScores = plan.childProfile.skillScores || [];
  const masteredSkills = skillScores
    .filter((s: any) => s.score >= 0.75)
    .map((s: any) => s.skillName);
  const needsDevelopmentSkills = skillScores
    .filter((s: any) => s.score < 0.6)
    .map((s: any) => s.skillName);

  const difficulties: number[] = plan.worlds
    .flatMap((w: any) => w.stories.map((s: any) => s.baseDifficulty))
    .filter((d: any) => d !== undefined);
  const startingDifficulty = difficulties[0] || 1;
  const endingDifficulty = difficulties[difficulties.length - 1] || 5;
  const averageDifficulty: number =
    difficulties.length > 0
      ? difficulties.reduce((a: number, b: number) => a + b, 0) / difficulties.length
      : 2.5;

  const startingReadingLevel = plan.childProfile.readingLevel;
  const endingReadingLevel = Math.min(
    5,
    startingReadingLevel + Math.floor(plan.planVersion / 2),
  );

  const characters = plan.childProfile.narrativeMemory?.characters || [];
  const frequentCharacters: string[] = characters
    .sort((a: any, b: any) => (b.appearances?.length || 0) - (a.appearances?.length || 0))
    .slice(0, 5)
    .map((c: any) => c.name);

  const worldThemes = taughtThemes;

  const avoid = {
    themes: taughtThemes.slice(0, Math.ceil(taughtThemes.length * 0.5)),
    objectives: taughtObjectives.slice(0, Math.ceil(taughtObjectives.length * 0.3)),
    conflicts: [] as string[],
  };

  const totalStoriesCompleted = plan.worlds.reduce((sum: number, w: any) => {
    return sum + w.stories.filter((s: any) => s.isCompleted).length;
  }, 0);

  return {
    childName: plan.childProfile.name,
    taughtThemes,
    taughtObjectives,
    masteredSkills,
    needsDevelopmentSkills,
    startingDifficulty,
    endingDifficulty,
    averageDifficulty,
    startingReadingLevel,
    endingReadingLevel,
    frequentCharacters,
    worldThemes,
    avoid,
    achievements: [
      `Completed ${plan.worlds.length} themed worlds`,
      `Mastered ${masteredSkills.length} reading skills`,
      `Progressed from reading level ${startingReadingLevel} to ${endingReadingLevel}`,
      `Engaged with ${frequentCharacters.length} memorable characters`,
    ],
    completedPlanId: plan.id,
    completedAt: plan.completedAt || new Date(),
    planVersion: plan.planVersion,
    totalStoriesCompleted,
    estimatedLearningGains: generateLearningGainsSummary(
      startingReadingLevel,
      endingReadingLevel,
      taughtObjectives.length,
    ),
  };
}

/**
 * Generate a summary of learning gains
 */
function generateLearningGainsSummary(
  startingLevel: number,
  endingLevel: number,
  objectiveCount: number,
): string {
  return `
Child has demonstrated progression in:
- Reading level: ${startingLevel} → ${endingLevel}
- Vocabulary mastery across ${objectiveCount} learning objectives
- Character comprehension and narrative understanding
- Complex plot reasoning and inference skills
Ready for: More sophisticated storytelling, deeper themes, greater autonomy
  `.trim();
}
