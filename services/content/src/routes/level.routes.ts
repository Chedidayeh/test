import { Router, Request, Response } from "express";
import { PrismaClient, Level } from "@prisma/client";
import { logger } from "../utils/logger";
import type { ApiResponse } from "@shared/types";

const router = Router();
const prisma = new PrismaClient();

/**
 * GET /api/levels
 * Fetch all levels
 */
router.get("/", async (req: Request, res: Response<ApiResponse<Level[]>>) => {
  try {
    const levels = await prisma.level.findMany({
      include: {
        badges: true,
      },
      orderBy: {
        levelNumber: "asc",
      },
    });

    res.status(200).json({
      success: true,
      data: levels,
    } as ApiResponse<Level[]>);
  } catch (error) {
    logger.error("Error fetching levels", { error: String(error) });
    res.status(500).json({
      success: false,
      error: {
        code: "FETCH_LEVELS_ERROR",
        message: "Failed to fetch levels",
      },
    } as ApiResponse<Level[]>);
  }
});

/**
 * GET /api/levels/:id
 * Fetch a single level by ID
 */
router.get("/:id", async (req: Request, res: Response<ApiResponse<Level>>) => {
  try {
    const { id } = req.params;

    const level = await prisma.level.findUnique({
      where: { id },
      include: {
        badges: true,
      },
    });

    if (!level) {
      res.status(404).json({
        success: false,
        error: {
          code: "LEVEL_NOT_FOUND",
          message: "Level not found",
        },
      } as ApiResponse<Level>);
      return;
    }

    res.status(200).json({
      success: true,
      data: level,
    } as ApiResponse<Level>);
  } catch (error) {
    logger.error("Error fetching level", { error: String(error), id: req.params.id });
    res.status(500).json({
      success: false,
      error: {
        code: "FETCH_LEVEL_ERROR",
        message: "Failed to fetch level",
      },
    } as ApiResponse<Level>);
  }
});

/**
 * GET /api/levels/number/:levelNumber
 * Fetch a level by level number
 */
router.get("/number/:levelNumber", async (req: Request, res: Response<ApiResponse<Level>>) => {
  try {
    const { levelNumber } = req.params;
    const parsedLevelNumber = parseInt(levelNumber, 10);

    if (isNaN(parsedLevelNumber)) {
      res.status(400).json({
        success: false,
        error: {
          code: "INVALID_LEVEL_NUMBER",
          message: "Invalid level number",
        },
      } as ApiResponse<Level>);
      return;
    }

    const level = await prisma.level.findUnique({
      where: { levelNumber: parsedLevelNumber },
      include: {
        badges: true,
      },
    });

    if (!level) {
      res.status(404).json({
        success: false,
        error: {
          code: "LEVEL_NOT_FOUND",
          message: "Level not found",
        },
      } as ApiResponse<Level>);
      return;
    }

    res.status(200).json({
      success: true,
      data: level,
    } as ApiResponse<Level>);
  } catch (error) {
    logger.error("Error fetching level by number", {
      error: String(error),
      levelNumber: req.params.levelNumber,
    });
    res.status(500).json({
      success: false,
      error: {
        code: "FETCH_LEVEL_ERROR",
        message: "Failed to fetch level",
      },
    } as ApiResponse<Level>);
  }
});

export default router;
