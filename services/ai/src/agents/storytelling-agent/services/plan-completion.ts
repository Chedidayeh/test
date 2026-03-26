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
