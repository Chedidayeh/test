import { Router, Request, Response } from "express";
import { PrismaClient, Badge } from "@prisma/client";
import { logger } from "../utils/logger";
import type { ApiResponse } from "@shared/types";

const router = Router();
const prisma = new PrismaClient();

/**
 * GET /api/badges
 * Fetch all badges
 */
router.get("/", async (req: Request, res: Response<ApiResponse<Badge[]>>) => {
  try {
    const badges = await prisma.badge.findMany({
      include: {
        level: true,
      },
      orderBy: {
        level: {
          levelNumber: "asc",
        },
      },
    });

    res.status(200).json({
      success: true,
      data: badges,
    } as ApiResponse<Badge[]>);
  } catch (error) {
    logger.error("Error fetching badges", { error: String(error) });
    res.status(500).json({
      success: false,
      error: {
        code: "FETCH_BADGES_ERROR",
        message: "Failed to fetch badges",
      },
    } as ApiResponse<Badge[]>);
  }
});

/**
 * GET /api/badges/:id
 * Fetch a single badge by ID
 */
router.get("/:id", async (req: Request, res: Response<ApiResponse<Badge>>) => {
  try {
    const { id } = req.params;

    const badge = await prisma.badge.findUnique({
      where: { id },
      include: {
        level: true,
      },
    });

    if (!badge) {
      res.status(404).json({
        success: false,
        error: {
          code: "BADGE_NOT_FOUND",
          message: "Badge not found",
        },
      } as ApiResponse<Badge>);
      return;
    }

    res.status(200).json({
      success: true,
      data: badge,
    } as ApiResponse<Badge>);
  } catch (error) {
    logger.error("Error fetching badge", { error: String(error), id: req.params.id });
    res.status(500).json({
      success: false,
      error: {
        code: "FETCH_BADGE_ERROR",
        message: "Failed to fetch badge",
      },
    } as ApiResponse<Badge>);
  }
});

/**
 * GET /api/badges/level/:levelId
 * Fetch badge by level ID
 */
router.get("/level/:levelNumber", async (req: Request, res: Response<ApiResponse<Badge>>) => {
  try {
    const { levelNumber } = req.params;

    const level = await prisma.level.findUnique({
      where: { levelNumber : parseInt(levelNumber) },
    });

    const badge = await prisma.badge.findUnique({
      where: { levelId: level?.id },
      include: {
        level: true,
      },
    });

    if (!badge) {
      res.status(404).json({
        success: false,
        error: {
          code: "BADGE_NOT_FOUND",
          message: "Badge not found for this level",
        },
      } as ApiResponse<Badge>);
      return;
    }

    res.status(200).json({
      success: true,
      data: badge,
    } as ApiResponse<Badge>);
  } catch (error) {
    logger.error("Error fetching badge by level", {
      error: String(error),
      levelNumber: req.params.levelNumber,
    });
    res.status(500).json({
      success: false,
      error: {
        code: "FETCH_BADGE_ERROR",
        message: "Failed to fetch badge",
      },
    } as ApiResponse<Badge>);
  }
});

export default router;
