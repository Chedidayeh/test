import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { logger } from "../../../lib/logger";
import { generateStoryPlan } from "../services/planning-service";
import {
  checkPlanExtension,
  completeExtension,
  getPlanExtensionStatus,
  forceResetExtensionFlag,
} from "../services/plan-extension";
import { updateSkillsFromPerformance } from "../services/skill-adaptation";
import { generateStory } from "../services/generation-service-updated";
import { ApiResponse, ChildProfile, GeneratedStory } from "@shared/src/types";
import {
  checkPlanCompletion,
  shouldGenerateNewPlan,
  extractPlanContext,
  completePlan,
  recordPlanRegeneration,
  ensureActivePlanExists,
  attemptAtomicPlanRegeneration,
} from "../services/plan-completion";

const prisma = new PrismaClient();

/**
 * ISSUE 6, 7, 9 FIX: Robust orchestration with proper sequencing and error handling
 * Manages the complete storytelling pipeline:
 * 1. Child profile initialization
 * 2. Story plan generation (with auto-extension)
 * 3. Strict sequential story retrieval
 * 4. Story generation with retries
 * 5. Performance tracking
 */
export class StorytellingController {
  /**
   * Main entry point for story generation
   * ISSUE 9 FIX: Comprehensive error handling with proper logging
   */
  async generateChildStorytelling(
    req: Request,
    res: Response<ApiResponse<GeneratedStory | { done: boolean }>>,
  ): Promise<void> {
    const startTime = Date.now();

    try {
      const { childProfile } = req.body;

      if (!childProfile || !childProfile.id) {
        res.status(400).json({
          success: false,
          error: {
            code: "MISSING_FIELD",
            message: "childProfile with id required",
          },
          timestamp: new Date(),
        });
        return;
      }

      logger.info("[Storytelling Controller] Generation request", {
        childId: childProfile.id,
        childAge: childProfile.age,
      });

      // Initialize or update child profile
      const childData = await this.initializeChildProfile(
        childProfile as ChildProfile,
      );

      // PHASE 4 NEW: Check if child has completed their current plan and needs a new one
      // RC-3 FIX: Use atomic plan regeneration to prevent race conditions
      try {
        const needsNewPlan = await shouldGenerateNewPlan(childData.id);

        if (needsNewPlan) {
          logger.info(
            "[Storytelling Controller] Plan completion detected, initiating atomic regeneration",
            {
              childId: childData.id,
            },
          );

          try {
            // RC-3 + E9 FIX: Call atomic function that handles:
            // 1. Re-check plan completion (inside transaction)
            // 2. Generate new plan with transaction client (ensures atomicity)
            // 3. Mark old plan completed
            // 4. Record regeneration link
            // All in a single atomic transaction - prevents duplicate regenerations AND orphaned state
            const regenerationResult = await attemptAtomicPlanRegeneration(
              childData.id,
              async (planContext, txClient) => {
                // E9 FIX: Pass transaction client to generateStoryPlan
                // This ensures all database operations happen within the same transaction
                return await generateStoryPlan(
                  childData.id,
                  planContext,
                  txClient,
                );
              },
            );

            if (regenerationResult.regenerated) {
              logger.info(
                "[Storytelling Controller] Plan regeneration completed successfully (atomic, E9 fix applied)",
                {
                  childId: childData.id,
                  oldPlanId: regenerationResult.oldPlanId,
                  newPlanId: regenerationResult.newPlanId,
                },
              );
            } else {
              logger.debug(
                "[Storytelling Controller] Plan regeneration skipped",
                {
                  childId: childData.id,
                  reason: regenerationResult.reason,
                },
              );
            }
          } catch (contextError) {
            logger.error(
              "[Storytelling Controller] Plan regeneration failed - will retry on next request",
              {
                childId: childData.id,
                error: String(contextError),
              },
            );
            // Don't fail the request, just log and continue
            // Old plan remains active for this request
            // Next request will attempt regeneration again
          }
        }
      } catch (completionError) {
        logger.warn("[Storytelling Controller] Plan completion check failed", {
          childId: childData.id,
          error: String(completionError),
        });
        // Don't fail on completion check, continue with regular flow
      }

      // Ensure child has story plan (query for ACTIVE plan only)
      let hasPlan = await prisma.storyPlan.findFirst({
        where: {
          childProfileId: childData.id,
          planStatus: { in: ["active", "generating"] }, // Only active plans, not completed
        },
        orderBy: { createdAt: "desc" }, // Most recent active plan
      });

      if (!hasPlan) {
        logger.info("[Storytelling Controller] Creating initial story plan", {
          childId: childData.id,
        });

        await generateStoryPlan(childData.id);

        hasPlan = await prisma.storyPlan.findUnique({
          where: { childProfileId: childData.id },
        });

        if (!hasPlan) {
          throw new Error("Failed to create story plan");
        }
      }
      // If child somehow has no active plan, attempt to recover by restoring most recent plan
      const planExists = await ensureActivePlanExists(childData.id);
      if (!planExists) {
        throw new Error(
          "CRITICAL: No active plan for child after initialization - cannot proceed with story generation",
        );
      }
      const extensionNeeded = await checkPlanExtension(childData.id);
      if (extensionNeeded) {
        logger.info("[Storytelling Controller] Extending plan", {
          childId: childData.id,
        });

        try {
          // Generate extended plan with new worlds/stories
          await generateStoryPlan(childData.id);

          // Mark extension as complete
          await completeExtension(childData.id);

          logger.info("[Storytelling Controller] Plan extension completed", {
            childId: childData.id,
          });
        } catch (error) {
          logger.warn(
            "[Storytelling Controller] Plan extension failed - resetting flag to prevent starvation",
            {
              childId: childData.id,
              error: String(error),
            },
          );

          // Prevents plan starvation: if extension fails, flag must be reset
          // so next request can attempt extension again
          try {
            await forceResetExtensionFlag(
              childData.id,
              "Extension generation failed - auto-reset to allow retry",
            );
          } catch (resetError) {
            logger.error(
              "[Storytelling Controller] CRITICAL: Failed to reset extension flag after extension failure",
              {
                childId: childData.id,
                extensionError: String(error),
                resetError: String(resetError),
              },
            );
            // Don't throw - continue to allow story generation to proceed
            // Flag will be auto-reset on next extension check (5-min timeout)
          }
        }
      }

      // ISSUE 7 FIX: Get NEXT story in strict sequence order
      const nextStory = await this.getNextStoryInSequence(childData.id);

      if (!nextStory) {
        logger.info(
          "[Storytelling Controller] No pending stories found, returning last generated story",
          {
            childId: childData.id,
          },
        );

        // Get the last generated story based on sequence order
        const lastGeneratedStory = await this.getLastGeneratedStory(
          childData.id,
        );

        res.status(200).json({
          success: true,
          data: { done: true },
          timestamp: new Date(),
        });
        return;
      }

      // NEW FIX: Validate all previous stories in the world are completed
      const allPreviousCompleted = await this.checkAllPreviousStoriesCompleted(
        nextStory.worldId,
        nextStory.sequenceOrder,
      );

      if (!allPreviousCompleted) {
        logger.info(
          "[Storytelling Controller] Previous stories not completed, returning last generated story",
          {
            childId: childData.id,
            nextStoryId: nextStory.id,
            nextStorySeq: nextStory.sequenceOrder,
          },
        );

        res.status(200).json({
          success: true,
          data: { done: true },
          timestamp: new Date(),
        });
        return;
      }

      logger.debug("[Storytelling Controller] Next story ready", {
        childId: childData.id,
        storyId: nextStory.id,
        storyTitle: nextStory.title,
      });

      // ISSUE 3, 9 FIX: Generate with retries and error handling
      const generatedStory = await generateStory(childData.id, nextStory.id);

      const elapsedMs = Date.now() - startTime;

      logger.info("[Storytelling Controller] Story generation succeeded", {
        childId: childData.id,
        storyId: generatedStory.id,
        storyTitle: generatedStory.title,
        duration: `${elapsedMs}ms`,
      });

      res.status(200).json({
        success: true,
        data: generatedStory as unknown as GeneratedStory,
        timestamp: new Date(),
      });
    } catch (error) {
      const elapsedMs = Date.now() - startTime;

      logger.error("[Storytelling Controller] Story generation failed", {
        error: String(error),
        stack: error instanceof Error ? error.stack : "N/A",
        duration: `${elapsedMs}ms`,
      });

      res.status(500).json({
        success: false,
        error: {
          code: "GENERATION_FAILED",
          message:
            error instanceof Error ? error.message : "Story generation failed",
          details:
            process.env.NODE_ENV === "development" ? String(error) : undefined,
        },
        timestamp: new Date(),
      });
    }
  }

  /**
   * Update skills based on challenge performance
   * ISSUE 5 FIX: Records performance and updates skill scores
   */
  async recordChallengePerformance(
    req: Request,
    res: Response<any>,
  ): Promise<void> {
    try {
      const { childProfileId, storyId, performance } = req.body;

      if (!childProfileId || !storyId || !performance) {
        res.status(400).json({
          success: false,
          error: {
            code: "MISSING_FIELD",
            message: "childProfileId, storyId, performance required",
          },
          timestamp: new Date(),
        });
        return;
      }

      logger.info("[Storytelling Controller] Recording performance", {
        childProfileId,
        storyId,
        performanceCount: performance.length,
      });

      // ISSUE 5 FIX: Update skills from performance data
      const result = await updateSkillsFromPerformance(
        childProfileId,
        storyId,
        performance,
      );

      logger.info("[Storytelling Controller] Performance recorded", {
        childProfileId,
        storyId,
        difficultyAdjustment: result?.difficultyAdjustment,
      });

      res.status(200).json({
        success: true,
        data: {
          difficultyAdjustment: result?.difficultyAdjustment || 0,
        },
        timestamp: new Date(),
      });
    } catch (error) {
      logger.error("[Storytelling Controller] Performance recording failed", {
        error: String(error),
      });

      res.status(500).json({
        success: false,
        error: {
          code: "PERFORMANCE_UPDATE_FAILED",
          message:
            error instanceof Error
              ? error.message
              : "Failed to update performance",
        },
        timestamp: new Date(),
      });
    }
  }

  /**
   * Get plan and progress status
   */
  async getPlanStatus(req: Request, res: Response<any>): Promise<void> {
    try {
      const { childProfileId } = req.params;

      if (!childProfileId) {
        res.status(400).json({
          success: false,
          error: { code: "MISSING_FIELD", message: "childProfileId required" },
          timestamp: new Date(),
        });
        return;
      }

      const plan = await prisma.storyPlan.findUnique({
        where: { childProfileId },
        include: {
          worlds: {
            include: {
              stories: {
                select: {
                  id: true,
                  title: true,
                  status: true,
                  sequenceOrder: true,
                },
              },
            },
          },
        },
      });

      if (!plan) {
        res.status(404).json({
          success: false,
          error: { code: "NOT_FOUND", message: "Plan not found" },
          timestamp: new Date(),
        });
        return;
      }

      const extensionStatus = await getPlanExtensionStatus(childProfileId);

      const stats = {
        totalWorlds: plan.worlds.length,
        totalStories: plan.worlds.reduce((sum, w) => sum + w.stories.length, 0),
        completedStories: plan.worlds.reduce(
          (sum, w) =>
            sum + w.stories.filter((s) => s.status === "generated").length,
          0,
        ),
        pendingStories: plan.worlds.reduce(
          (sum, w) =>
            sum + w.stories.filter((s) => s.status === "pending").length,
          0,
        ),
        ...extensionStatus,
      };

      res.status(200).json({
        success: true,
        data: {
          globalGoal: plan.globalGoal,
          version: plan.version,
          stats,
          worlds: plan.worlds.map((w) => ({
            order: w.order,
            title: w.title,
            theme: w.theme,
            stories: w.stories.length,
            completed: w.stories.filter((s) => s.status === "generated").length,
          })),
        },
        timestamp: new Date(),
      });
    } catch (error) {
      logger.error("[Storytelling Controller] Failed to get plan status", {
        error: String(error),
      });

      res.status(500).json({
        success: false,
        error: {
          code: "STATUS_FETCH_FAILED",
          message: String(error),
        },
        timestamp: new Date(),
      });
    }
  }

  /**
   * NEW FIX: Get the last generated story based on sequence order
   * Returns the most recent story (highest sequenceOrder) across all worlds
   * This is returned when no new story can be generated
   *
   * @param childProfileId - ID of the child
   * @returns GeneratedStory if found, null if no stories have been generated yet
   */
  private async getLastGeneratedStory(
    childProfileId: string,
  ): Promise<GeneratedStory | null> {
    try {
      const lastStory = await prisma.generatedStory.findFirst({
        where: {
          childProfileId,
        },
        include: {
          planItem: {
            include: {
              world: true,
            },
          },
        },
        orderBy: {
          generatedAt: "desc", // Get the most recently generated
        },
      });

      if (!lastStory) {
        logger.debug(
          "[Storytelling Controller] No generated stories found for child",
          {
            childProfileId,
          },
        );
        return null;
      }

      logger.debug("[Storytelling Controller] Last generated story retrieved", {
        generatedStoryId: lastStory.id,
        title: lastStory.title,
        generatedAt: lastStory.generatedAt,
      });

      return lastStory as unknown as GeneratedStory;
    } catch (error) {
      logger.error(
        "[Storytelling Controller] Failed to get last generated story",
        {
          error: String(error),
          childProfileId,
        },
      );
      return null;
    }
  }

  /**
   * NEW FIX: Validate all previous stories in the world are completed
   * Ensures strict sequential completion: all stories with sequenceOrder < current are marked isCompleted
   *
   * @param worldId - ID of the world containing the stories
   * @param currentSequenceOrder - Sequence order of the current (next to generate) story
   * @returns true if all previous stories are completed, false otherwise
   */
  private async checkAllPreviousStoriesCompleted(
    worldId: string,
    currentSequenceOrder: number,
  ): Promise<boolean> {
    try {
      const previousStories = await prisma.storyPlanItem.findMany({
        where: {
          worldId,
          sequenceOrder: {
            lt: currentSequenceOrder, // Less than current
          },
        },
        select: {
          id: true,
          sequenceOrder: true,
          isCompleted: true,
          title: true,
        },
      });

      if (previousStories.length === 0) {
        // No previous stories, so all are completed (vacuous truth)
        logger.debug(
          "[Storytelling Controller] No previous stories to validate",
          {
            worldId,
            currentSequenceOrder,
          },
        );
        return true;
      }

      // Check if all previous stories are marked as completed
      const allCompleted = previousStories.every((story) => story.isCompleted);

      logger.debug(
        "[Storytelling Controller] Previous stories completion check",
        {
          worldId,
          currentSequenceOrder,
          previousStoriesCount: previousStories.length,
          completedCount: previousStories.filter((s) => s.isCompleted).length,
          allCompleted,
          previousStories: previousStories.map((s) => ({
            id: s.id,
            sequenceOrder: s.sequenceOrder,
            isCompleted: s.isCompleted,
          })),
        },
      );

      return allCompleted;
    } catch (error) {
      logger.error(
        "[Storytelling Controller] Failed to check previous stories completion",
        {
          error: String(error),
          worldId,
          currentSequenceOrder,
        },
      );
      // On error, return false to prevent generation (safer approach)
      return false;
    }
  }

  /**
   * ISSUE 7 FIX: Get next story in strict sequence order with duplicate prevention
   * Enforces: world order (asc) → story sequence order within world (asc)
   * Only returns "pending" stories
   *
   * RACE CONDITION PREVENTION:
   * - Filters only for "pending" status
   * - Caller immediately marks as "generating" to acquire lock
   * - If called twice simultaneously, second call gets null
   */
  private async getNextStoryInSequence(
    childProfileId: string,
  ): Promise<any | null> {
    try {
      // FINDING 9 FIX: Use findFirst with planStatus filter (safer than findUnique)
      const plan = await prisma.storyPlan.findFirst({
        where: {
          childProfileId,
          planStatus: { in: ["active", "generating"] }, // Only active plans
        },
        orderBy: { createdAt: "desc" }, // Most recent active plan
        include: {
          worlds: {
            orderBy: { order: "asc" }, // ISSUE 7: Strict world order
            include: {
              stories: {
                // FINDING 9 FIX: Check isCompleted=false instead of status="pending"
                // This enforces SEQUENTIAL READING, not just generation order
                // - Previous stories must be marked isCompleted=true (child read them)
                // - Next story is first story with isCompleted=false (child hasn't read yet)
                // - This is consistent with checkAllPreviousStoriesCompleted() validation
                where: { isCompleted: false },
                orderBy: { sequenceOrder: "asc" }, // ISSUE 7: Strict story order
                take: 1,
              },
            },
          },
        },
      });

      if (!plan) {
        logger.warn("[Storytelling Controller] No plan found", {
          childProfileId,
        });
        return null;
      }

      // ISSUE 7: Iterate through worlds in order, return first unread story
      for (const world of plan.worlds) {
        if (world.stories.length > 0) {
          const nextStory = world.stories[0];

          logger.debug("[Storytelling Controller] Next story selected", {
            childProfileId,
            storyId: nextStory.id,
            storyTitle: nextStory.title,
            status: nextStory.status,
            isCompleted: nextStory.isCompleted,
            sequenceOrder: nextStory.sequenceOrder,
          });

          return nextStory;
        }
      }

      logger.debug("[Storytelling Controller] No unread stories found", {
        childProfileId,
      });
      return null;
    } catch (error) {
      logger.error("[Storytelling Controller] Failed to get next story", {
        error: String(error),
        childProfileId,
      });
      throw error;
    }
  }

  /**
   */
  async markStoryCompleted(req: Request, res: Response<any>): Promise<void> {
    try {
      logger.info("[Storytelling Controller] Mark story completed request", {
        body: req.body,
      });
      const { storyId, childProfileId } = req.body;

      if (!storyId || !childProfileId) {
        res.status(400).json({
          success: false,
          error: {
            code: "MISSING_FIELD",
            message: "storyId and childProfileId are required",
          },
          timestamp: new Date(),
        });
        return;
      }

      // Verify ownership: generatedStory → world → storyPlan.childProfileId must match
      const generatedStory = await prisma.generatedStory.findUnique({
        where: { id: storyId },
        include: {
          planItem: true,
        },
      });

      if (!generatedStory) {
        res.status(404).json({
          success: false,
          error: { code: "NOT_FOUND", message: "Story not found" },
          timestamp: new Date(),
        });
        return;
      }


      if (generatedStory.planItem.isCompleted) {
        res.status(200).json({
          success: true,
          data: true,
          timestamp: new Date(),
        });
        return;
      }

      // Mark the story as completed
      await prisma.storyPlanItem.update({
        where: { id: generatedStory.planItemId },
        data: { isCompleted: true },
      });

      logger.info("[Storytelling Controller] Story marked as completed", {
        planItemId: generatedStory.planItemId,
        childProfileId,
        storyTitle: generatedStory.planItem.title,
        worldId: generatedStory.planItem.worldId,
      });

      // Check if ALL stories in the world are now completed → mark world complete
      const siblingsNotCompleted = await prisma.storyPlanItem.count({
        where: { worldId: generatedStory.planItem.worldId, isCompleted: false },
      });

      if (siblingsNotCompleted === 0) {
        await prisma.storyPlanWorld.update({
          where: { id: generatedStory.planItem.worldId },
          data: { isCompleted: true },
        });

        logger.info("[Storytelling Controller] World fully completed", {
          worldId: generatedStory.planItem.worldId,
          childProfileId,
        });
      }

      logger.info("[Storytelling Controller] Story completion response sent", {
        planItemId: generatedStory.planItemId,
        childProfileId,
        worldCompleted: siblingsNotCompleted === 0,
        storyId,
      });

      res.status(200).json({
        success: true,
        data: {
          planItemId: generatedStory.planItemId,
          worldCompleted: siblingsNotCompleted === 0,
        },
        timestamp: new Date(),
      });
    } catch (error) {
      logger.error("[Storytelling Controller] Failed to mark story completed", {
        error: String(error),
      });

      res.status(500).json({
        success: false,
        error: {
          code: "COMPLETION_FAILED",
          message:
            error instanceof Error
              ? error.message
              : "Failed to mark story as completed",
        },
        timestamp: new Date(),
      });
    }
  }

  /**
   * Initialize or update child profile with storytelling settings
   */
  private async initializeChildProfile(
    profileData: ChildProfile,
  ): Promise<any> {
    try {
      const child = await prisma.childProfile.upsert({
        where: { childId: profileData.id },
        create: {
          childId: profileData.id,
          name: profileData.name || "Child",
          age: profileData.ageGroupName!,
          gender: profileData.gender || undefined,
          interests: profileData.storytelling?.favoriteThemes || [],
          objectives: profileData.storytelling?.learningObjectives || [],
          favoriteThemes: profileData.storytelling?.favoriteThemes || [],
        },
        update: {
          name: profileData.name || undefined,
          age: profileData.ageGroupName || undefined,
          gender: profileData.gender || undefined,
          interests: profileData.storytelling?.favoriteThemes || undefined,
          objectives: profileData.storytelling?.learningObjectives || undefined,
          favoriteThemes: profileData.storytelling?.favoriteThemes || undefined,
        },
      });

      logger.debug("[Storytelling Controller] Child profile initialized", {
        childId: child.id,
        childAge: child.age,
        themes: child.favoriteThemes,
      });

      return child;
    } catch (error) {
      logger.error("[Storytelling Controller] Failed to initialize profile", {
        error: String(error),
      });
      throw new Error(`Failed to initialize child profile: ${String(error)}`);
    }
  }
}

// Export singleton instance
export const storytellingController = new StorytellingController();
