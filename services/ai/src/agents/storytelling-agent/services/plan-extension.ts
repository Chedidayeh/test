import { PrismaClient } from "@prisma/client";
import { logger } from "../../../lib/logger";

const prisma = new PrismaClient();

/**
 * ISSUE 6 FIX: Automatic plan extension trigger
 * When remaining stories <= threshold, extend the plan with new worlds/stories
 *
 * This ensures the child always has stories available without manual intervention
 */

/**
 * FIX: Check if extension flag is stuck and reset if timeout exceeded
 * FINDING 5 FIX: Prevents plan starvation if extension fails
 * 
 * @param plan - StoryPlan to check
 * @returns true if flag should be reset, false otherwise
 */
function shouldResetExtensionFlag(plan: any): boolean {
  if (!plan.isExtensionPending || !plan.lastExtendedAt) {
    return false;
  }

  // Extension timeout: 5 minutes
  // If extension was triggered but not completed in 5 min, something failed
  const EXTENSION_TIMEOUT_MS = 5 * 60 * 1000;
  const timeSinceExtension = Date.now() - new Date(plan.lastExtendedAt).getTime();
  const isStuck = timeSinceExtension > EXTENSION_TIMEOUT_MS;

  if (isStuck) {
    logger.warn("[Plan Extension] Extension flag stuck for 5+ minutes", {
      planId: plan.id,
      lastExtendedAt: plan.lastExtendedAt,
      timeStuckMs: timeSinceExtension,
    });
    return true;
  }

  return false;
}

/**
 * Check if plan needs extension and trigger if needed
 * Returns true if extension was triggered
 * FINDING 5 FIX: Detects and auto-resets stuck extension flags
 */
export async function checkPlanExtension(
  childProfileId: string,
): Promise<boolean> {
  try {
    // FIX: Query for ACTIVE plan only (not completed/archived)
    const plan = await prisma.storyPlan.findFirst({
      where: { 
        childProfileId,
        planStatus: { in: ["active", "generating"] } // Only active plans
      },
      orderBy: { createdAt: "desc" }, // Most recent active plan
      include: {
        worlds: {
          include: {
            stories: { select: { status: true } },
          },
        },
      },
    });

    if (!plan) {
      logger.debug("[Plan Extension] No plan found", { childProfileId });
      return false;
    }

    // FINDING 5 FIX: Check if extension flag is stuck and reset if needed
    if (shouldResetExtensionFlag(plan)) {
      logger.warn("[Plan Extension] Resetting stuck extension flag", {
        childProfileId,
        planId: plan.id,
      });

      await prisma.storyPlan.update({
        where: { id: plan.id },
        data: {
          isExtensionPending: false,
        },
      });

      // Re-fetch plan with updated flag
      const refreshedPlan = await prisma.storyPlan.findFirst({
        where: { 
          childProfileId,
          planStatus: { in: ["active", "generating"] }
        },
        orderBy: { createdAt: "desc" },
        include: {
          worlds: {
            include: {
              stories: { select: { status: true } },
            },
          },
        },
      });

      if (refreshedPlan) {
        return checkPlanExtension(childProfileId); // Retry check with fresh flag
      }
    }

    // ISSUE 6 FIX: Count remaining stories (pending status)
    const totalRemaining = plan.worlds.reduce(
      (sum, w) =>
        sum + w.stories.filter((s) => s.status === "pending").length,
      0
    );

    const threshold = parseInt(
      process.env.PLAN_EXTENSION_THRESHOLD || "2"
    );

    const shouldExtend =
      totalRemaining <= threshold && !plan.isExtensionPending;

    logger.debug("[Plan Extension] Extension check", {
      childProfileId,
      remainingStories: totalRemaining,
      threshold,
      isExtensionPending: plan.isExtensionPending,
      shouldExtend,
    });

    if (shouldExtend) {
      // Mark as pending extension
      const updatedPlan = await prisma.storyPlan.update({
        where: { id: plan.id },
        data: {
          isExtensionPending: true,
          version: plan.version + 1,
          lastExtendedAt: new Date(),
        },
      });

      logger.info("[Plan Extension] Extension triggered", {
        childProfileId,
        planId: updatedPlan.id,
        remainingStories: totalRemaining,
        threshold,
        newVersion: updatedPlan.version,
      });

      return true;
    }

    return false;
  } catch (error) {
    logger.error("[Plan Extension] Failed to check extension", {
      error: String(error),
      childProfileId,
    });
    throw error;
  }
}

/**
 * Mark extension as complete after new stories are generated
 */
export async function completeExtension(childProfileId: string): Promise<void> {
  try {
    // FIX: Find first active plan instead of unique by childProfileId
    const plan = await prisma.storyPlan.findFirst({
      where: { 
        childProfileId,
        planStatus: { in: ["active", "generating"] }
      },
      orderBy: { createdAt: "desc" },
    });

    if (!plan) {
      logger.warn("[Plan Extension] No active plan found to complete extension", {
        childProfileId,
      });
      return;
    }

    await prisma.storyPlan.update({
      where: { id: plan.id },
      data: { isExtensionPending: false },
    });

    logger.info("[Plan Extension] Extension completed", { 
      childProfileId,
      planId: plan.id,
    });
  } catch (error) {
    logger.error("[Plan Extension] Failed to complete extension", {
      error: String(error),
      childProfileId,
    });
    throw error;
  }
}

/**
 * FIX: Force reset extension flag for a child
 * FINDING 5 FIX: Emergency recovery for stuck extension flags
 */
export async function forceResetExtensionFlag(
  childProfileId: string,
  reason: string = "Extension generation failed",
): Promise<void> {
  try {
    const plan = await prisma.storyPlan.findFirst({
      where: { 
        childProfileId,
        planStatus: { in: ["active", "generating"] }
      },
      orderBy: { createdAt: "desc" },
    });

    if (!plan) {
      logger.debug("[Plan Extension] No active plan to reset extension flag", {
        childProfileId,
      });
      return;
    }

    if (!plan.isExtensionPending) {
      logger.debug("[Plan Extension] Extension flag not pending, no reset needed", {
        childProfileId,
        planId: plan.id,
      });
      return;
    }

    await prisma.storyPlan.update({
      where: { id: plan.id },
      data: { isExtensionPending: false },
    });

    logger.warn("[Plan Extension] Extension flag forcefully reset", {
      childProfileId,
      planId: plan.id,
      reason,
    });
  } catch (error) {
    logger.error("[Plan Extension] Failed to force reset extension flag", {
      error: String(error),
      childProfileId,
    });
    throw error;
  }
}

/**
 * Get plan extension status
 */
export async function getPlanExtensionStatus(
  childProfileId: string
): Promise<{
  remainingStories: number;
  threshold: number;
  needsExtension: boolean;
  isExtensionPending: boolean;
}> {
  try {
    // FIX: Query for ACTIVE plan only
    let plan = await prisma.storyPlan.findFirst({
      where: { 
        childProfileId,
        planStatus: { in: ["active", "generating"] } // Only active plans
      },
      orderBy: { createdAt: "desc" }, // Most recent active plan
      include: {
        worlds: {
          include: {
            stories: { select: { status: true } },
          },
        },
      },
    });

    // FINDING 5 FIX: Check if extension flag is stuck and reset if needed
    if (plan && shouldResetExtensionFlag(plan)) {
      logger.warn("[Plan Extension] Resetting stuck extension flag in status check", {
        childProfileId,
        planId: plan.id,
      });

      await prisma.storyPlan.update({
        where: { id: plan.id },
        data: { isExtensionPending: false },
      });

      // Re-fetch with updated flag
      plan = await prisma.storyPlan.findFirst({
        where: { 
          childProfileId,
          planStatus: { in: ["active", "generating"] }
        },
        orderBy: { createdAt: "desc" },
        include: {
          worlds: {
            include: {
              stories: { select: { status: true } },
            },
          },
        },
      });
    }

    if (!plan) {
      return {
        remainingStories: 0,
        threshold: parseInt(process.env.PLAN_EXTENSION_THRESHOLD || "2"),
        needsExtension: false,
        isExtensionPending: false,
      };
    }

    const totalRemaining = plan.worlds.reduce(
      (sum, w) =>
        sum + w.stories.filter((s) => s.status === "pending").length,
      0
    );
    const threshold = parseInt(
      process.env.PLAN_EXTENSION_THRESHOLD || "2"
    );

    return {
      remainingStories: totalRemaining,
      threshold,
      needsExtension: totalRemaining <= threshold,
      isExtensionPending: plan.isExtensionPending,
    };
  } catch (error) {
    logger.error("[Plan Extension] Failed to get status", {
      error: String(error),
      childProfileId,
    });
    throw error;
  }
}
