import { Request, Response } from "express";
import { RoadmapService } from "../services/roadmap.service";
import { sendSuccess, sendError } from "../utils/response";
import { logger } from "../utils/logger";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const roadmapService = new RoadmapService(prisma);

export class RoadmapController {
  /**
   * Get all roadmaps
   * GET /api/roadmaps
   */
  async getRoadmaps(req: Request, res: Response): Promise<void> {
    try {
      logger.info("Get roadmaps request");

      const roadmaps = await roadmapService.getRoadmaps();

      sendSuccess(res, roadmaps, 200);
    } catch (error) {
      logger.error("Error in getRoadmaps controller", { error: String(error) });
      sendError(res, String(error), 500, "Failed to fetch roadmaps");
    }
  }

  /**
   * Get a single roadmap by ID
   * GET /api/roadmaps/:id
   */
  async getRoadmapById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      logger.info("Get roadmap by ID request", { roadmapId: id });

      if (!id) {
        sendError(res, "Roadmap ID is required", 400);
        return;
      }

      const roadmap = await roadmapService.getRoadmapById(id);

      if (!roadmap) {
        sendError(res, "Roadmap not found", 404, `Roadmap with ID ${id} not found`);
        return;
      }

      sendSuccess(res, roadmap, 200);
    } catch (error) {
      logger.error("Error in getRoadmapById controller", { error: String(error) });
      sendError(res, String(error), 500, "Failed to fetch roadmap");
    }
  }

  /**
   * Get roadmaps by age group
   * GET /api/roadmaps/age-group/:ageGroupId
   */
  async getRoadmapsByAgeGroup(req: Request, res: Response): Promise<void> {
    try {
      const { ageGroupId } = req.params;

      logger.info("Get roadmaps by age group request", { ageGroupId });

      if (!ageGroupId) {
        sendError(res, "Age group ID is required", 400);
        return;
      }

      const roadmaps = await roadmapService.getRoadmapsByAgeGroup(ageGroupId);

      sendSuccess(res, roadmaps, 200);
    } catch (error) {
      logger.error("Error in getRoadmapsByAgeGroup controller", {
        error: String(error),
      });
      sendError(res, String(error), 500, "Failed to fetch roadmaps");
    }
  }

  /**
   * Create a new roadmap
   * POST /api/roadmaps
   */
  async createRoadmap(req: Request, res: Response): Promise<void> {
    try {
      const { ageGroupId, themeId, readingLevel } = req.body;

      logger.info("Create roadmap request", { ageGroupId, themeId });

      // Validate required fields
      if (!ageGroupId || ageGroupId.trim() === "") {
        sendError(res, "Age group ID is required", 400);
        return;
      }

      if (!themeId || themeId.trim() === "") {
        sendError(res, "Theme ID is required", 400);
        return;
      }

      if (!readingLevel || readingLevel.trim() === "") {
        sendError(res, "Reading level is required", 400);
        return;
      }

      // Validate reading level enum
      const validReadingLevels = ["BEGINNER", "EASY", "MEDIUM", "HARD", "ADVANCED"];
      if (!validReadingLevels.includes(readingLevel.toUpperCase())) {
        sendError(
          res,
          `Invalid reading level. Must be one of: ${validReadingLevels.join(", ")}`,
          400
        );
        return;
      }

      // Check if age group exists
      const ageGroup = await prisma.ageGroup.findUnique({
        where: { id: ageGroupId },
      });
      if (!ageGroup) {
        sendError(
          res,
          `Age group with ID '${ageGroupId}' not found`,
          400,
          "INVALID_AGE_GROUP"
        );
        return;
      }

      // Check if theme exists
      const theme = await prisma.theme.findUnique({
        where: { id: themeId },
      });
      if (!theme) {
        sendError(
          res,
          `Theme with ID '${themeId}' not found`,
          400,
          "INVALID_THEME"
        );
        return;
      }

      // Check if theme is already assigned to another roadmap
      const existingRoadmapWithTheme = await roadmapService.getRoadmapByThemeId(themeId);
      if (existingRoadmapWithTheme) {
        sendError(
          res,
          `Theme '${theme.name}' is already assigned to another roadmap`,
          409,
          "THEME_ALREADY_ASSIGNED"
        );
        return;
      }

      const roadmap = await roadmapService.createRoadmap({
        ageGroupId,
        themeId,
        readingLevel: readingLevel.toUpperCase(),
      });

      sendSuccess(res, roadmap, 201);
    } catch (error) {
      logger.error("Error in createRoadmap controller", { error: String(error) });
      sendError(res, String(error), 500, "Failed to create roadmap");
    }
  }

  /**
   * Update a roadmap
   * PUT /api/roadmaps/:id
   */
  async updateRoadmap(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { ageGroupId, readingLevel } = req.body;

      logger.info("Update roadmap request", { roadmapId: id });

      if (!id) {
        sendError(res, "Roadmap ID is required", 400);
        return;
      }

      // Validate at least one field is provided
      if (!ageGroupId && !readingLevel) {
        sendError(res, "At least one field (ageGroupId, readingLevel) must be provided", 400);
        return;
      }

      // Check if roadmap exists
      const roadmap = await roadmapService.getRoadmapById(id);
      if (!roadmap) {
        sendError(res, "Roadmap not found", 404, `Roadmap with ID ${id} not found`);
        return;
      }

      const updateData: any = {};

      if (ageGroupId !== undefined) {
        if (!ageGroupId || ageGroupId.trim() === "") {
          sendError(res, "Age group ID cannot be empty", 400);
          return;
        }

        // Check if age group exists
        const ageGroup = await prisma.ageGroup.findUnique({
          where: { id: ageGroupId },
        });
        if (!ageGroup) {
          sendError(
            res,
            `Age group with ID '${ageGroupId}' not found`,
            400,
            "INVALID_AGE_GROUP"
          );
          return;
        }

        updateData.ageGroupId = ageGroupId;
      }

      if (readingLevel !== undefined) {
        if (!readingLevel || readingLevel.trim() === "") {
          sendError(res, "Reading level cannot be empty", 400);
          return;
        }

        const validReadingLevels = ["BEGINNER", "EASY", "MEDIUM", "HARD", "ADVANCED"];
        if (!validReadingLevels.includes(readingLevel.toUpperCase())) {
          sendError(
            res,
            `Invalid reading level. Must be one of: ${validReadingLevels.join(", ")}`,
            400
          );
          return;
        }

        updateData.readingLevel = readingLevel.toUpperCase();
      }

      const updatedRoadmap = await roadmapService.updateRoadmap(id, updateData);

      sendSuccess(res, updatedRoadmap, 200);
    } catch (error) {
      logger.error("Error in updateRoadmap controller", { error: String(error) });
      sendError(res, String(error), 500, "Failed to update roadmap");
    }
  }

  /**
   * Delete a roadmap
   * DELETE /api/roadmaps/:id
   */
  async deleteRoadmap(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      logger.info("Delete roadmap request", { roadmapId: id });

      if (!id) {
        sendError(res, "Roadmap ID is required", 400);
        return;
      }

      // Check if roadmap exists
      const roadmap = await roadmapService.getRoadmapById(id);
      if (!roadmap) {
        sendError(res, "Roadmap not found", 404, `Roadmap with ID ${id} not found`);
        return;
      }

      const deletedRoadmap = await roadmapService.deleteRoadmap(id);

      sendSuccess(
        res,
        {
          success: true,
          deletedId: deletedRoadmap.id,
          ageGroupId: deletedRoadmap.ageGroupId,
          themeId: deletedRoadmap.themeId,
        },
        200
      );
    } catch (error) {
      logger.error("Error in deleteRoadmap controller", { error: String(error) });
      sendError(res, String(error), 500, "Failed to delete roadmap");
    }
  }
}

export const roadmapController = new RoadmapController();
