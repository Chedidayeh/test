import { Request, Response } from "express";
import { BadgeService } from "../services/badge.service";
import { sendSuccess, sendError, sendPaginated } from "../utils/response";
import { logger } from "../utils/logger";
import { PrismaClient } from "@prisma/client";
import { ApiResponse, Badge } from "@shared/types";

const prisma = new PrismaClient();
const badgeService = new BadgeService(prisma);

export class BadgeController {
  /**
   * Get all badges
 
   */
  async getAllBadges(req: Request, res: Response<ApiResponse<Badge[]>>): Promise<void> {
    try {
      logger.info("Get all badges request");

      const badges = await badgeService.getAllBadges();

      sendSuccess(res, badges, 200);
    } catch (error) {
      logger.error("Error in getAllBadges controller", { error: String(error) });
      sendError(res, String(error), 500, "Failed to fetch badges");
    }
  }

  /**
   * Get a single badge by ID
   */
  async getBadgeById(req: Request, res: Response<ApiResponse<Badge>>): Promise<void> {
    try {
      const { id } = req.params;

      logger.info("Get badge by ID request", { badgeId: id });

      if (!id) {
        sendError(res, "Badge ID is required", 400);
        return;
      }

      const badge = await badgeService.getBadgeById(id);

      if (!badge) {
        sendError(res, `Badge with ID '${id}' not found`, 404);
        return;
      }

      sendSuccess(res, badge, 200);
    } catch (error) {
      logger.error("Error in getBadgeById controller", { error: String(error) });
      sendError(res, String(error), 500, "Failed to fetch badge");
    }
  }

  /**
   * Get badge by level number
   */
  async getBadgeByLevelNumber(req: Request, res: Response<ApiResponse<Badge>>): Promise<void> {
    try {
      const { levelNumber } = req.params;

      logger.info("Get badge by level number request", { levelNumber });

      const parsedLevelNumber = parseInt(levelNumber, 10);

      if (isNaN(parsedLevelNumber)) {
        sendError(res, "Invalid level number", 400);
        return;
      }

      const badge = await badgeService.getBadgeByLevelNumber(parsedLevelNumber);

      if (!badge) {
        sendError(res, `Badge not found for level ${levelNumber}`, 404);
        return;
      }

      sendSuccess(res, badge, 200);
    } catch (error) {
      logger.error("Error in getBadgeByLevelNumber controller", {
        error: String(error),
      });
      sendError(res, String(error), 500, "Failed to fetch badge");
    }
  }

  /**
   * Create a new badge with optional auto-translation
   */
  async createBadge(req: Request, res: Response<ApiResponse<any>>): Promise<void> {
    try {
      const { levelId, name, description, iconUrl, autoTranslate } = req.body;

      logger.info("Create badge request", { levelId, name, autoTranslate });

      // Validation
      if (!levelId || !name) {
        sendError(res, "levelId and name are required", 400);
        return;
      }

      // Check if level exists
      const level = await prisma.level.findUnique({
        where: { id: levelId },
      });

      if (!level) {
        sendError(res, `Level with ID '${levelId}' not found`, 404);
        return;
      }

      // Check if badge already exists for this level
      const existing = await badgeService.getBadgeByLevelId(levelId);
      if (existing) {
        sendError(res, `Badge already exists for this level`, 409);
        return;
      }

      const badge = await badgeService.createBadge(
        {
          levelId,
          name,
          description: description || null,
          iconUrl: iconUrl || null,
        },
        autoTranslate === true,
      );

      logger.info("Badge created successfully", {
        badgeId: badge.id,
        autoTranslateEnabled: autoTranslate,
      });

      sendSuccess(res, badge, 201);
    } catch (error) {
      logger.error("Error in createBadge controller", {
        error: String(error),
        message: error instanceof Error ? error.message : "Unknown error",
      });
      sendError(res, String(error), 500, "Failed to create badge");
    }
  }

  /**
   * Update a badge with optional auto-translation
   */
  async updateBadge(req: Request, res: Response<ApiResponse<Badge>>): Promise<void> {
    try {
      const { id } = req.params;
      const { name, description, iconUrl, autoTranslate } = req.body;

      logger.info("Update badge request", {
        badgeId: id,
        autoTranslate,
      });

      if (!id) {
        sendError(res, "Badge ID is required", 400);
        return;
      }

      // Check if badge exists
      const badge = await badgeService.getBadgeById(id);
      if (!badge) {
        sendError(res, `Badge with ID '${id}' not found`, 404);
        return;
      }

      const updated = await badgeService.updateBadge(
        id,
        {
          name: name || undefined,
          description: description !== undefined ? description : undefined,
          iconUrl: iconUrl !== undefined ? iconUrl : undefined,
        },
        autoTranslate === true,
      );

      logger.info("Badge updated successfully", {
        badgeId: id,
        autoTranslateEnabled: autoTranslate,
      });

      sendSuccess(res, updated, 200);
    } catch (error) {
      logger.error("Error in updateBadge controller", {
        error: String(error),
        message: error instanceof Error ? error.message : "Unknown error",
      });
      sendError(res, String(error), 500, "Failed to update badge");
    }
  }

  /**
   * Update badge translations manually
   */
  async updateBadgeTranslations(req: Request, res: Response<ApiResponse<Badge>>): Promise<void> {
    try {
      const { id } = req.params;
      const { translations } = req.body;

      logger.info("Update badge translations request", { badgeId: id });

      if (!id) {
        sendError(res, "Badge ID is required", 400);
        return;
      }

      // Validate badge exists
      const badge = await badgeService.getBadgeById(id);
      if (!badge) {
        sendError(res, `Badge with ID '${id}' not found`, 404);
        return;
      }

      if (!Array.isArray(translations) || translations.length === 0) {
        sendError(res, "translations must be a non-empty array", 400);
        return;
      }

      const upserted: any[] = [];

      for (const t of translations) {
        const { languageCode, name, description } = t as {
          languageCode: string;
          name: string;
          description?: string;
        };

        if (!languageCode || !name) {
          sendError(res, "Each translation must include languageCode and name", 400);
          return;
        }

        const badgeTranslation = await prisma.badgeTranslation.upsert({
          where: {
            badgeId_languageCode: {
              badgeId: id,
              languageCode: languageCode as any,
            },
          },
          update: {
            name,
            description: description ?? null,
          },
          create: {
            badgeId: id,
            languageCode: languageCode as any,
            name,
            description: description ?? null,
          },
        });

        upserted.push(badgeTranslation);
      }

      // Return the updated badge with translations
      const updatedBadge = await badgeService.getBadgeById(id);

      logger.info("Badge translations updated successfully", { badgeId: id, count: upserted.length });

      sendSuccess(res, updatedBadge, 200);
    } catch (error) {
      logger.error("Error in updateBadgeTranslations controller", { error: String(error) });
      sendError(res, String(error), 500, "Failed to update badge translations");
    }
  }

  /**
   * Delete a badge
   */
  async deleteBadge(req: Request, res: Response<ApiResponse<{id: string}>>): Promise<void> {
    try {
      const { id } = req.params;

      logger.info("Delete badge request", { badgeId: id });

      if (!id) {
        sendError(res, "Badge ID is required", 400);
        return;
      }

      // Check if badge exists
      const badge = await badgeService.getBadgeById(id);
      if (!badge) {
        sendError(res, `Badge with ID '${id}' not found`, 404);
        return;
      }

      await badgeService.deleteBadge(id);

      logger.info("Badge deleted successfully", { badgeId: id });

      sendSuccess(res, { id }, 200);
    } catch (error) {
      logger.error("Error in deleteBadge controller", { error: String(error) });
      sendError(res, String(error), 500, "Failed to delete badge");
    }
  }
}

export const badgeController = new BadgeController();
