import { Request, Response } from "express";
import { LevelService } from "../services/level.service";
import { sendSuccess, sendError, sendPaginated } from "../utils/response";
import { logger } from "../utils/logger";
import { PrismaClient } from "@prisma/client";
import { ApiResponse, Level } from "@shared/types";

const prisma = new PrismaClient();
const levelService = new LevelService(prisma);

export class LevelController {
  /**
   * Get all levels
   */
  async getAllLevels(req: Request, res: Response<ApiResponse<Level[]>>): Promise<void> {
    try {
      logger.info("Get all levels request");

      const levels = await levelService.getAllLevels();

      sendSuccess(res, levels, 200);
    } catch (error) {
      logger.error("Error in getAllLevels controller", { error: String(error) });
      sendError(res, String(error), 500, "Failed to fetch levels");
    }
  }

  /**
   * Get a single level by ID
   */
  async getLevelById(req: Request, res: Response<ApiResponse<Level>>): Promise<void> {
    try {
      const { id } = req.params;

      logger.info("Get level by ID request", { levelId: id });

      if (!id) {
        sendError(res, "Level ID is required", 400);
        return;
      }

      const level = await levelService.getLevelById(id);

      if (!level) {
        sendError(res, `Level with ID '${id}' not found`, 404);
        return;
      }

      sendSuccess(res, level, 200);
    } catch (error) {
      logger.error("Error in getLevelById controller", { error: String(error) });
      sendError(res, String(error), 500, "Failed to fetch level");
    }
  }

  /**
   * Get a level by level number
   */
  async getLevelByNumber(req: Request, res: Response<ApiResponse<Level>>): Promise<void> {
    try {
      const { levelNumber } = req.params;

      logger.info("Get level by number request", { levelNumber });

      const parsedLevelNumber = parseInt(levelNumber, 10);

      if (isNaN(parsedLevelNumber)) {
        sendError(res, "Invalid level number", 400);
        return;
      }

      const level = await levelService.getLevelByNumber(parsedLevelNumber);

      if (!level) {
        sendError(res, `Level ${levelNumber} not found`, 404);
        return;
      }

      sendSuccess(res, level, 200);
    } catch (error) {
      logger.error("Error in getLevelByNumber controller", {
        error: String(error),
      });
      sendError(res, String(error), 500, "Failed to fetch level");
    }
  }

  /**
   * Create a new level
   */
  async createLevel(req: Request, res: Response<ApiResponse<Level>>): Promise<void> {
    try {
      const { levelNumber, requiredStars } = req.body;

      logger.info("Create level request", { levelNumber, requiredStars });

      // Validation
      if (typeof levelNumber !== "number" || typeof requiredStars !== "number") {
        sendError(res, "levelNumber and requiredStars are required", 400);
        return;
      }

      // Check if level number already exists
      const existing = await levelService.getLevelByNumber(levelNumber);
      if (existing) {
        sendError(res, `Level ${levelNumber} already exists`, 409);
        return;
      }

      const level = await levelService.createLevel({
        levelNumber,
        requiredStars,
      });

      logger.info("Level created successfully", { levelId: level.id });

      sendSuccess(res, level, 201);
    } catch (error) {
      logger.error("Error in createLevel controller", { error: String(error) });
      sendError(res, String(error), 500, "Failed to create level");
    }
  }

  /**
   * Update a level
   */
  async updateLevel(req: Request, res: Response<ApiResponse<Level>>): Promise<void> {
    try {
      const { id } = req.params;
      const { levelNumber, requiredStars } = req.body;

      logger.info("Update level request", { levelId: id });

      if (!id) {
        sendError(res, "Level ID is required", 400);
        return;
      }

      // Check if level exists
      const level = await levelService.getLevelById(id);
      if (!level) {
        sendError(res, `Level with ID '${id}' not found`, 404);
        return;
      }

      // Check if new level number is unique (if updating)
      if (levelNumber && levelNumber !== level.levelNumber) {
        const existing = await levelService.getLevelByNumber(levelNumber);
        if (existing) {
          sendError(res, `Level ${levelNumber} already exists`, 409);
          return;
        }
      }

      const updated = await levelService.updateLevel(id, {
        levelNumber: levelNumber || undefined,
        requiredStars: requiredStars !== undefined ? requiredStars : undefined,
      });

      logger.info("Level updated successfully", { levelId: id });

      sendSuccess(res, updated, 200);
    } catch (error) {
      logger.error("Error in updateLevel controller", { error: String(error) });
      sendError(res, String(error), 500, "Failed to update level");
    }
  }

  /**
   * Delete a level
   */
  async deleteLevel(req: Request, res: Response<ApiResponse<{id: string}>>): Promise<void> {
    try {
      const { id } = req.params;

      logger.info("Delete level request", { levelId: id });

      if (!id) {
        sendError(res, "Level ID is required", 400);
        return;
      }

      // Check if level exists
      const level = await levelService.getLevelById(id);
      if (!level) {
        sendError(res, `Level with ID '${id}' not found`, 404);
        return;
      }

      await levelService.deleteLevel(id);

      logger.info("Level deleted successfully", { levelId: id });

      sendSuccess(res, { id }, 200);
    } catch (error) {
      logger.error("Error in deleteLevel controller", { error: String(error) });
      sendError(res, String(error), 500, "Failed to delete level");
    }
  }
}

export const levelController = new LevelController();
