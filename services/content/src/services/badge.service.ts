import { PrismaClient, Badge, LanguageCode } from "@prisma/client";
import { logger } from "../utils/logger";
import { getBadgeTranslationService } from "../translations/badge";
import { TRANSLATION_CONFIG } from "../config/translation-config";

export class BadgeService {
  private prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  /**
   * Get the global BadgeTranslationService instance
   */
  private getBadgeTranslationService() {
    return getBadgeTranslationService(this.prisma);
  }

  /**
   * Get all badges
   */
  async getAllBadges(): Promise<Badge[]> {
    try {
      const badges = await this.prisma.badge.findMany({
        include: {
          level: true,
          translations: true,
        },
        orderBy: {
          level: {
            levelNumber: "asc",
          },
        },
      });

      logger.info("All badges retrieved successfully", {
        count: badges.length,
      });

      return badges;
    } catch (error) {
      logger.error("Error fetching badges", { error: String(error) });
      throw error;
    }
  }

  /**
   * Get a single badge by ID
   */
  async getBadgeById(badgeId: string): Promise<Badge | null> {
    try {
      const badge = await this.prisma.badge.findUnique({
        where: { id: badgeId },
        include: {
          level: true,
          translations: true,
        },
      });

      if (!badge) {
        logger.warn("Badge not found", { badgeId });
        return null;
      }

      logger.info("Badge retrieved successfully", { badgeId });
      return badge;
    } catch (error) {
      logger.error("Error fetching badge", { badgeId, error: String(error) });
      throw error;
    }
  }

  /**
   * Get badge by level ID
   */
  async getBadgeByLevelId(levelId: string): Promise<Badge | null> {
    try {
      const badge = await this.prisma.badge.findUnique({
        where: { levelId },
        include: {
          level: true,
          translations: true,
        },
      });

      if (!badge) {
        logger.warn("Badge not found for level", { levelId });
        return null;
      }

      logger.info("Badge retrieved by level", { levelId });
      return badge;
    } catch (error) {
      logger.error("Error fetching badge by level", { levelId, error: String(error) });
      throw error;
    }
  }

  /**
   * Get badge by level number
   */
  async getBadgeByLevelNumber(levelNumber: number): Promise<Badge | null> {
    try {
      const level = await this.prisma.level.findUnique({
        where: { levelNumber },
      });

      if (!level) {
        logger.warn("Level not found", { levelNumber });
        return null;
      }

      const badge = await this.prisma.badge.findUnique({
        where: { levelId: level.id },
        include: {
          level: true,
          translations: true,
        },
      });

      if (!badge) {
        logger.warn("Badge not found for level number", { levelNumber });
        return null;
      }

      logger.info("Badge retrieved by level number", { levelNumber });
      return badge;
    } catch (error) {
      logger.error("Error fetching badge by level number", {
        levelNumber,
        error: String(error),
      });
      throw error;
    }
  }

  /**
   * Create a new badge with optional auto-translation
   * @param data - Badge data (name, description, levelId, iconUrl)
   * @param autoTranslate - Enable auto-translation
   * @param sourceLanguage - Source language for translation (defaults to EN)
   * @param targetLanguages - Target languages for translation (defaults to FR, AR)
   * @returns Created badge
   */
  async createBadge(
    data: {
      levelId: string;
      name: string;
      description?: string | null;
      iconUrl?: string | null;
    },
    autoTranslate: boolean = false,
    sourceLanguage: LanguageCode = TRANSLATION_CONFIG.SOURCE_LANGUAGE,
    targetLanguages: LanguageCode[] = TRANSLATION_CONFIG.TARGET_LANGUAGES,
  ): Promise<Badge> {
    try {
      logger.info("Creating badge", {
        levelId: data.levelId,
        name: data.name,
        autoTranslate,
        sourceLanguage,
        targetLanguages,
      });

      const badge = await this.prisma.badge.create({
        data,
        include: {
          level: true,
        },
      });

      // Auto-translate if requested and feature is enabled
      if (
        autoTranslate &&
        TRANSLATION_CONFIG.ENABLE_AUTO_TRANSLATION
      ) {
        try {
          logger.info("Starting auto-translation for new badge", {
            badgeId: badge.id,
            sourceLanguage,
            targetLanguages,
          });

          await this.getBadgeTranslationService().createBadgeTranslations(
            badge.id,
            {
              name: data.name,
              description: data.description || undefined,
            },
            sourceLanguage,
            targetLanguages,
          );

          logger.info("Badge translations created successfully", {
            badgeId: badge.id,
          });
        } catch (translationError) {
          logger.error("Failed to auto-translate badge", {
            badgeId: badge.id,
            error:
              translationError instanceof Error
                ? translationError.message
                : String(translationError),
          });

          // Re-throw to fail the operation (strict mode as per requirements)
          throw new Error(
            `Failed to create translations: ${
              translationError instanceof Error
                ? translationError.message
                : "Unknown error"
            }`,
          );
        }
      }

      logger.info("Badge created successfully", { badgeId: badge.id });
      return badge;
    } catch (error) {
      logger.error("Error creating badge", { data, error: String(error) });
      throw error;
    }
  }

  /**
   * Update an existing badge with optional auto-translation
   * @param badgeId - Badge ID to update
   * @param data - Partial badge data to update
   * @param autoTranslate - Enable auto-translation of updated fields
   * @param sourceLanguage - Source language for translation (defaults to EN)
   * @param targetLanguages - Target languages for translation (defaults to FR, AR)
   * @returns Updated badge
   */
  async updateBadge(
    badgeId: string,
    data: Partial<{
      name: string;
      description: string | null;
      iconUrl: string | null;
    }>,
    autoTranslate: boolean = false,
    sourceLanguage: LanguageCode = TRANSLATION_CONFIG.SOURCE_LANGUAGE,
    targetLanguages: LanguageCode[] = TRANSLATION_CONFIG.TARGET_LANGUAGES,
  ): Promise<Badge> {
    try {
      logger.info("Updating badge", { badgeId, autoTranslate, sourceLanguage, targetLanguages });

      const badge = await this.prisma.badge.update({
        where: { id: badgeId },
        data,
        include: {
          level: true,
        },
      });

      // Auto-translate if requested and feature is enabled
      if (
        autoTranslate &&
        TRANSLATION_CONFIG.ENABLE_AUTO_TRANSLATION &&
        (data.name || data.description !== undefined)
      ) {
        try {
          logger.info("Starting auto-translation for updated badge", {
            badgeId,
            sourceLanguage,
            targetLanguages,
          });

          await this.getBadgeTranslationService().updateBadgeTranslations(
            badgeId,
            {
              name: data.name,
              description: data.description !== undefined ? data.description || undefined : undefined,
            },
            sourceLanguage,
            targetLanguages,
          );

          logger.info("Badge translations updated successfully", {
            badgeId,
          });
        } catch (translationError) {
          // Re-throw to fail the operation (strict mode)
          logger.error("Failed to auto-translate updated badge", {
            badgeId,
            error:
              translationError instanceof Error
                ? translationError.message
                : String(translationError),
          });

          throw new Error(
            `Failed to update translations: ${
              translationError instanceof Error
                ? translationError.message
                : "Unknown error"
            }`,
          );
        }
      }

      logger.info("Badge updated successfully", { badgeId });
      return badge;
    } catch (error) {
      logger.error("Error updating badge", { badgeId, error: String(error) });
      throw error;
    }
  }

  /**
   * Delete a badge by ID
   */
  async deleteBadge(badgeId: string): Promise<Badge> {
    try {
      logger.info("Deleting badge", { badgeId });

      const badge = await this.prisma.badge.delete({
        where: { id: badgeId },
        include: {
          level: true,
        },
      });

      logger.info("Badge deleted successfully", { badgeId });
      return badge;
    } catch (error) {
      logger.error("Error deleting badge", { badgeId, error: String(error) });
      throw error;
    }
  }
}
