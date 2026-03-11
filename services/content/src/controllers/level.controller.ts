import { Request, Response } from "express";
import { LevelService } from "../services/level.service";
import { BadgeService } from "../services/badge.service";
import { sendSuccess, sendError, sendPaginated } from "../utils/response";
import { logger } from "../utils/logger";
import { PrismaClient, LanguageCode } from "@prisma/client";
import { ApiResponse, Level } from "@shared/src/types";
import { getTranslationStrategy } from "../config/translation-config";

const prisma = new PrismaClient();
const levelService = new LevelService(prisma);
const badgeService = new BadgeService(prisma);

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
   * Create a new level with badge (consolidated)
   */
  async createLevel(req: Request, res: Response<ApiResponse<Level>>): Promise<void> {
    try {
      const { levelNumber, requiredStars, badge, autoTranslateBadge, translationSource, translations } = req.body;

      logger.info("Create level with badge request", { levelNumber, autoTranslateBadge, translationSource });

      // Determine source and target languages based on translation source
      let sourceLanguage: LanguageCode = LanguageCode.EN;
      let targetLanguages: LanguageCode[] = [];

      if (autoTranslateBadge && translationSource) {
        try {
          const strategy = getTranslationStrategy(translationSource as any);
          sourceLanguage = strategy.sourceLanguage as LanguageCode;
          targetLanguages = strategy.targetLanguages as LanguageCode[];
          logger.info("Translation strategy determined", { sourceLanguage, targetLanguages });
        } catch (error) {
          logger.warn("Invalid translation source, using defaults", { translationSource, error: String(error) });
          sourceLanguage = LanguageCode.EN;
          targetLanguages = [LanguageCode.FR, LanguageCode.AR];
        }
      }

      // Validation
      if (typeof levelNumber !== "number" || typeof requiredStars !== "number") {
        sendError(res, "levelNumber and requiredStars are required and must be numbers", 400);
        return;
      }

      if (levelNumber < 1 || !Number.isInteger(levelNumber)) {
        sendError(res, "levelNumber must be a positive integer", 400);
        return;
      }

      if (requiredStars < 0 || !Number.isInteger(requiredStars)) {
        sendError(res, "requiredStars must be a non-negative integer", 400);
        return;
      }

      // Check if level number already exists
      const existing = await levelService.getLevelByNumber(levelNumber);
      if (existing) {
        sendError(res, `Level ${levelNumber} already exists`, 409);
        return;
      }

      // Validate badge data if provided
      if (badge && typeof badge === "object") {
        if (!badge.name || typeof badge.name !== "string") {
          sendError(res, "Badge name is required and must be a string", 400);
          return;
        }

        if (badge.name.trim().length === 0) {
          sendError(res, "Badge name cannot be empty", 400);
          return;
        }
      }

      // Create level
      const level = await levelService.createLevel({
        levelNumber,
        requiredStars,
      });

      logger.info("Level created", { levelId: level.id });

      // Create badge if provided
      if (badge && badge.name) {
        try {
          await badgeService.createBadge(
            {
              levelId: level.id,
              name: badge.name.trim(),
              description: badge.description ? badge.description.trim() : null,
              iconUrl: badge.iconUrl ? badge.iconUrl.trim() : null,
            },
            autoTranslateBadge === true,
            sourceLanguage,
            targetLanguages,
          );

          logger.info("Badge created for level", { levelId: level.id, badgeName: badge.name });

          // Create translations manually if provided and not auto-translating
          if (!autoTranslateBadge && translations && Array.isArray(translations) && translations.length > 0) {
            const badgeData = await badgeService.getBadgeByLevelId(level.id);
            
            if (badgeData) {
              for (const t of translations) {
                if (!t.languageCode || !t.name) {
                  logger.warn("Skipping invalid translation", { translation: t });
                  continue;
                }

                await prisma.badgeTranslation.create({
                  data: {
                    badgeId: badgeData.id,
                    languageCode: t.languageCode as any,
                    name: t.name.trim(),
                    description: t.description ? t.description.trim() : null,
                  },
                });
              }

              logger.info("Badge translations created", {
                levelId: level.id,
                badgeId: badgeData.id,
                translationCount: translations.length,
              });
            }
          }
        } catch (badgeError) {
          logger.error("Badge creation failed, but level was created", {
            levelId: level.id,
            error: String(badgeError),
          });
          // Badge creation failure is not critical - level was created successfully
          // Return level without badge since creation failed
        }
      }

      // Return level with badge included
      const levelWithBadge = await levelService.getLevelById(level.id);

      logger.info("Level with badge created successfully", { levelId: level.id });

      sendSuccess(res, levelWithBadge, 201);
    } catch (error) {
      logger.error("Error in createLevel controller", { error: String(error) });
      sendError(res, String(error), 500, "Failed to create level");
    }
  }

  /**
   * Update a level with badge (consolidated)
   */
  async updateLevel(req: Request, res: Response<ApiResponse<Level>>): Promise<void> {
    try {
      const { id } = req.params;
      const { levelNumber, requiredStars, badge, autoTranslateBadge, translationSource, translations } = req.body;

      logger.info("Update level with badge request", { levelId: id, autoTranslateBadge, translationSource });

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

      // Validate input data if provided
      if (levelNumber !== undefined) {
        if (typeof levelNumber !== "number" || levelNumber < 1 || !Number.isInteger(levelNumber)) {
          sendError(res, "levelNumber must be a positive integer", 400);
          return;
        }
      }

      if (requiredStars !== undefined) {
        if (typeof requiredStars !== "number" || requiredStars < 0 || !Number.isInteger(requiredStars)) {
          sendError(res, "requiredStars must be a non-negative integer", 400);
          return;
        }
      }

      // Check if new level number is unique (if updating)
      if (levelNumber && levelNumber !== level.levelNumber) {
        const existing = await levelService.getLevelByNumber(levelNumber);
        if (existing) {
          sendError(res, `Level ${levelNumber} already exists`, 409);
          return;
        }
      }

      // Validate badge data if provided
      if (badge && typeof badge === "object") {
        if (badge.name && typeof badge.name !== "string") {
          sendError(res, "Badge name must be a string", 400);
          return;
        }

        if (badge.name && badge.name.trim().length === 0) {
          sendError(res, "Badge name cannot be empty", 400);
          return;
        }

        if (!badge.id) {
          sendError(res, "Badge ID is required for update", 400);
          return;
        }
      }

      // Update level only if data is provided
      let updateData: any = {};
      if (levelNumber !== undefined) updateData.levelNumber = levelNumber;
      if (requiredStars !== undefined) updateData.requiredStars = requiredStars;

      if (Object.keys(updateData).length > 0) {
        await levelService.updateLevel(id, updateData);
        logger.info("Level updated", { levelId: id });
      }

      // Update badge if provided
      if (badge && badge.id) {
        try {
          // Prepare badge update data
          const badgeUpdateData: any = {};
          if (badge.name !== undefined) badgeUpdateData.name = badge.name.trim();
          if (badge.description !== undefined) badgeUpdateData.description = badge.description ? badge.description.trim() : null;
          if (badge.iconUrl !== undefined) badgeUpdateData.iconUrl = badge.iconUrl ? badge.iconUrl.trim() : null;

          if (Object.keys(badgeUpdateData).length > 0) {
            // Determine source and target languages based on translation source
            let sourceLanguage: LanguageCode = LanguageCode.EN;
            let targetLanguages: LanguageCode[] = [];
            if (autoTranslateBadge && translationSource) {
              const strategy = getTranslationStrategy(translationSource as any);
              sourceLanguage = strategy.sourceLanguage as LanguageCode;
              targetLanguages = strategy.targetLanguages as LanguageCode[];
            }

            await badgeService.updateBadge(
              badge.id,
              badgeUpdateData,
              autoTranslateBadge === true,
              sourceLanguage,
              targetLanguages
            );

            logger.info("Badge updated for level", { 
              levelId: id, 
              badgeId: badge.id,
              sourceLanguage,
              targetLanguages
            });
          }

          // Update translations manually if provided and not auto-translating
          if (!autoTranslateBadge && translations && Array.isArray(translations) && translations.length > 0) {
            for (const t of translations) {
              if (!t.languageCode || !t.name) {
                logger.warn("Skipping invalid translation", { translation: t });
                continue;
              }

              await prisma.badgeTranslation.upsert({
                where: {
                  badgeId_languageCode: {
                    badgeId: badge.id,
                    languageCode: t.languageCode as any,
                  },
                },
                update: {
                  name: t.name.trim(),
                  description: t.description ? t.description.trim() : null,
                },
                create: {
                  badgeId: badge.id,
                  languageCode: t.languageCode as any,
                  name: t.name.trim(),
                  description: t.description ? t.description.trim() : null,
                },
              });
            }

            logger.info("Badge translations updated", {
              levelId: id,
              badgeId: badge.id,
              translationCount: translations.length,
            });
          }
        } catch (badgeError) {
          logger.error("Badge update failed", { levelId: id, error: String(badgeError) });
          sendError(res, String(badgeError), 500, "Failed to update badge");
          return;
        }
      }

      // Return updated level with badge
      const levelWithBadge = await levelService.getLevelById(id);

      logger.info("Level with badge updated successfully", { levelId: id });

      sendSuccess(res, levelWithBadge, 200);
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
