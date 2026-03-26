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
 * Check if plan needs extension and trigger if needed
 * Returns true if extension was triggered
 */
export async function checkPlanExtension(
  childProfileId: string,
): Promise<boolean> {
  try {
    const plan = await prisma.storyPlan.findUnique({
      where: { childProfileId },
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
    await prisma.storyPlan.update({
      where: { childProfileId },
      data: { isExtensionPending: false },
    });

    logger.info("[Plan Extension] Extension completed", { childProfileId });
  } catch (error) {
    logger.error("[Plan Extension] Failed to complete extension", {
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
    const plan = await prisma.storyPlan.findUnique({
      where: { childProfileId },
      include: {
        worlds: {
          include: {
            stories: { select: { status: true } },
          },
        },
      },
    });

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
