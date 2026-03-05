import { Request, Response } from "express";
import { RoadmapService } from "../services/roadmap.service";
import { sendSuccess, sendError } from "../utils/response";
import { logger } from "../utils/logger";
import { PrismaClient } from "@prisma/client";
import { ApiResponse, Roadmap, TranslationSourceType, ManualTranslationEdit } from "@shared/types";

const prisma = new PrismaClient();
const roadmapService = new RoadmapService(prisma);

export class RoadmapController {
  /**
   * Get all roadmaps or roadmaps by IDs (via query parameter)
   */
  async getRoadmaps(req: Request, res: Response<ApiResponse<Roadmap[]>>): Promise<void> {
    try {
      logger.info("Get roadmaps request", { query: req.query });

      // Check if IDs are provided in query params
      const { ids } = req.query;

      let roadmaps: Roadmap[];

      if (ids && typeof ids === "string") {
        // Parse comma-separated IDs
        const roadmapIds = ids
          .split(",")
          .map((id) => id.trim())
          .filter((id) => id.length > 0);

        if (roadmapIds.length === 0) {
          sendError(res, "Invalid IDs provided", 400);
          return;
        }

        logger.info("Fetching roadmaps by IDs", { roadmapIds });

        roadmaps = await roadmapService.getRoadmapsByIds(roadmapIds);
      } else {
        // Fetch all roadmaps
        roadmaps = await roadmapService.getRoadmaps();
      }

      sendSuccess(res, roadmaps, 200);
    } catch (error) {
      logger.error("Error in getRoadmaps controller", { error: String(error) });
      sendError(res, String(error), 500, "Failed to fetch roadmaps");
    }
  }

  /**
   * Get a single roadmap by ID
   */
  async getRoadmapById(req: Request, res: Response<ApiResponse<Roadmap>>): Promise<void> {
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
   */
  async getRoadmapsByAgeGroup(req: Request, res: Response<ApiResponse<Roadmap[]>>): Promise<void> {
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
   */
  async createRoadmap(req: Request, res: Response<ApiResponse<Roadmap>>): Promise<void> {
    try {
      const { ageGroupId, themeId, readingLevel, title, translationSource, translations } = req.body;

      logger.info("Create roadmap request", { ageGroupId, themeId, translationSource });

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

      // Validate title if provided
      if (title && title.trim() === "") {
        sendError(res, "Roadmap title cannot be empty", 400);
        return;
      }

      if (title && title.length < 2) {
        sendError(res, "Roadmap title must be at least 2 characters", 400);
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

      // Validate translation source if provided
      let validTranslationSource = translationSource;
      if (translationSource && !Object.values(TranslationSourceType).includes(translationSource)) {
        sendError(
          res,
          `Invalid translation source. Must be one of: ${Object.values(TranslationSourceType).join(", ")}`,
          400,
        );
        return;
      }

      // Validate translations array if provided
      let validTranslations: ManualTranslationEdit[] = [];
      if (translations && Array.isArray(translations)) {
        // Validate each translation has required title field
        for (const translation of translations) {
          if (!translation.languageCode) {
            sendError(res, "Each translation must have a languageCode", 400);
            return;
          }
          if (!translation.title || translation.title.trim() === "") {
            sendError(res, "Each translation must have a non-empty title field", 400);
            return;
          }
        }
        validTranslations = translations;
      }

      const roadmap = await roadmapService.createRoadmap({
        ageGroupId,
        themeId,
        readingLevel: readingLevel.toUpperCase(),
        title: title || null,
        translationSource: validTranslationSource,
        translations: validTranslations,
      });

      sendSuccess(res, roadmap, 201);
    } catch (error) {
      logger.error("Error in createRoadmap controller", { error: String(error) });
      sendError(res, String(error), 500, "Failed to create roadmap");
    }
  }

  /**
   * Update a roadmap
   */
  async updateRoadmap(req: Request, res: Response<ApiResponse<Roadmap>>): Promise<void> {
    try {
      const { id } = req.params;
      const { ageGroupId, readingLevel, title, translationSource, translations } = req.body;

      logger.info("Update roadmap request", { roadmapId: id, translationSource });

      if (!id) {
        sendError(res, "Roadmap ID is required", 400);
        return;
      }

      // Validate at least one field is provided
      if (!ageGroupId && !readingLevel && !title && !translationSource && !translations) {
        sendError(res, "At least one field (ageGroupId, readingLevel, title, translationSource, translations) must be provided", 400);
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

      if (title !== undefined && title !== null) {
        if (typeof title === "string" && title.trim() !== "") {
          if (title.length < 2) {
            sendError(res, "Roadmap title must be at least 2 characters", 400);
            return;
          }
          updateData.title = title;
        }
      }

      // Validate translation source if provided
      let validTranslationSource = translationSource;
      if (translationSource && !Object.values(TranslationSourceType).includes(translationSource)) {
        sendError(
          res,
          `Invalid translation source. Must be one of: ${Object.values(TranslationSourceType).join(", ")}`,
          400,
        );
        return;
      }

      // Validate translations array if provided
      let validTranslations: ManualTranslationEdit[] = [];
      if (translations && Array.isArray(translations)) {
        // Validate each translation has required title field
        for (const translation of translations) {
          if (!translation.languageCode) {
            sendError(res, "Each translation must have a languageCode", 400);
            return;
          }
          if (!translation.title || translation.title.trim() === "") {
            sendError(res, "Each translation must have a non-empty title field", 400);
            return;
          }
        }
        validTranslations = translations;
      }

      const updatedRoadmap = await roadmapService.updateRoadmap(
        id,
        updateData,
        validTranslationSource,
        validTranslations,
      );

      sendSuccess(res, updatedRoadmap, 200);
    } catch (error) {
      logger.error("Error in updateRoadmap controller", { error: String(error) });
      sendError(res, String(error), 500, "Failed to update roadmap");
    }
  }

  /**
   * Delete a roadmap
   */
  async deleteRoadmap(req: Request, res: Response<ApiResponse<{id: string}>>): Promise<void> {
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
        { id: deletedRoadmap.id },
        200
      );
    } catch (error) {
      logger.error("Error in deleteRoadmap controller", { error: String(error) });
      sendError(res, String(error), 500, "Failed to delete roadmap");
    }
  }
}

export const roadmapController = new RoadmapController();
