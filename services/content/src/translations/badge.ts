import { PrismaClient, BadgeTranslation, LanguageCode } from "@prisma/client";
import { logger } from "../utils/logger";
import { getTranslationService } from "./translation.service";
import { TRANSLATION_CONFIG } from "../config/translation-config";

/**
 * BadgeTranslationService
 * Dedicated service for managing badge translations
 * Handles CRUD operations for BadgeTranslation model
 */
export class BadgeTranslationService {
  private prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  /**
   * Get the global TranslationService instance
   */
  private getTranslationService() {
    return getTranslationService(this.prisma);
  }

  /**
   * Create badge translations for multiple languages
   * Uses TranslationService to translate content, then persists to database
   * @param badgeId - Badge ID to create translations for
   * @param content - Badge content (name, description)
   * @param sourceLanguage - Source language for translation (defaults to EN)
   * @param targetLanguages - Languages to translate to (defaults to FR, AR)
   * @returns Array of created BadgeTranslation records
   */
  async createBadgeTranslations(
    badgeId: string,
    content: { name: string; description?: string },
    sourceLanguage: LanguageCode = TRANSLATION_CONFIG.SOURCE_LANGUAGE,
    targetLanguages: LanguageCode[] = TRANSLATION_CONFIG.TARGET_LANGUAGES,
  ): Promise<BadgeTranslation[]> {
    logger.info("[BadgeTranslationService] Creating badge translations", {
      badgeId,
      sourceLanguage,
      targetLanguages,
    });

    try {
      const translations: BadgeTranslation[] = [];
      const translationService = this.getTranslationService();

      // Create translation record for source language
      const sourceTranslation = await this.prisma.badgeTranslation.create({
        data: {
          badgeId,
          languageCode: sourceLanguage,
          name: content.name,
          description: content.description || null,
        },
      });

      translations.push(sourceTranslation);

      logger.info("[BadgeTranslationService] Source language translation created", {
        badgeId,
        language: sourceLanguage,
        translationId: sourceTranslation.id,
      });

      // Translate name
      const nameTranslations = await translationService.translateContent(
        content.name,
        sourceLanguage,
        targetLanguages,
      );

      // Translate description if provided
      let descriptionTranslations = new Map<LanguageCode, string>();
      if (content.description && content.description.trim().length > 0) {
        descriptionTranslations = await translationService.translateContent(
          content.description,
          sourceLanguage,
          targetLanguages,
        );
      }

      // Create database records for each target language
      for (const language of targetLanguages) {
        const translatedName = nameTranslations.get(language) || content.name;
        const translatedDescription =
          descriptionTranslations.get(language) || content.description;

        const badgeTranslation = await this.prisma.badgeTranslation.create({
          data: {
            badgeId,
            languageCode: language,
            name: translatedName,
            description: translatedDescription || null,
          },
        });

        translations.push(badgeTranslation);

        logger.info("[BadgeTranslationService] Badge translation created", {
          badgeId,
          language,
          translationId: badgeTranslation.id,
          sourceName: content.name,
          translatedName,
          sourceDescription: content.description,
          translatedDescription,
          nameChanged: translatedName !== content.name,
          descriptionChanged: translatedDescription !== content.description,
        });
      }

      return translations;
    } catch (error) {
      logger.error(
        "[BadgeTranslationService] Failed to create badge translations",
        {
          badgeId,
          error: error instanceof Error ? error.message : String(error),
        },
      );
      throw error;
    }
  }

  /**
   * Update badge translations for modified content
   * Updates existing or creates new BadgeTranslation records (upsert)
   * @param badgeId - Badge ID to update translations for
   * @param content - Updated badge content
   * @param sourceLanguage - Source language for translation (defaults to EN)
   * @param targetLanguages - Languages to update (defaults to FR, AR)
   * @returns Array of updated BadgeTranslation records
   */
  async updateBadgeTranslations(
    badgeId: string,
    content: { name?: string; description?: string },
    sourceLanguage: LanguageCode = TRANSLATION_CONFIG.SOURCE_LANGUAGE,
    targetLanguages: LanguageCode[] = TRANSLATION_CONFIG.TARGET_LANGUAGES,
  ): Promise<BadgeTranslation[]> {
    logger.info("[BadgeTranslationService] Updating badge translations", {
      badgeId,
      sourceLanguage,
      targetLanguages,
    });

    try {
      const translations: BadgeTranslation[] = [];
      const translationService = this.getTranslationService();

      // Update source language first
      const sourceUpdateData: any = {};

      if (content.name) {
        sourceUpdateData.name = content.name;
      }

      if (content.description !== undefined) {
        sourceUpdateData.description = content.description || null;
      }

      if (Object.keys(sourceUpdateData).length > 0) {
        const sourceTranslation = await this.prisma.badgeTranslation.upsert({
          where: {
            badgeId_languageCode: {
              badgeId,
              languageCode: sourceLanguage,
            },
          },
          update: sourceUpdateData,
          create: {
            badgeId,
            languageCode: sourceLanguage,
            name: content.name || "Unknown",
            description: content.description || null,
          },
        });

        translations.push(sourceTranslation);

        logger.info("[BadgeTranslationService] Source language translation updated", {
          badgeId,
          language: sourceLanguage,
          translationId: sourceTranslation.id,
        });
      }

      // Only translate fields that were provided
      const nameTranslations = content.name
        ? await translationService.translateContent(
            content.name,
            sourceLanguage,
            targetLanguages,
          )
        : new Map();

      const descriptionTranslations =
        content.description && content.description.trim().length > 0
          ? await translationService.translateContent(
              content.description,
              sourceLanguage,
              targetLanguages,
            )
          : new Map();

      // Update or create records for each target language
      for (const language of targetLanguages) {
        const updateData: any = {};

        if (content.name) {
          updateData.name = nameTranslations.get(language) || content.name;
        }

        if (content.description !== undefined) {
          updateData.description =
            descriptionTranslations.get(language) ||
            content.description ||
            null;
        }

        const badgeTranslation = await this.prisma.badgeTranslation.upsert({
          where: {
            badgeId_languageCode: {
              badgeId,
              languageCode: language,
            },
          },
          update: updateData,
          create: {
            badgeId,
            languageCode: language,
            name: nameTranslations.get(language) || content.name || "Unknown",
            description:
              descriptionTranslations.get(language) ||
              content.description ||
              null,
          },
        });

        translations.push(badgeTranslation);

        logger.info("[BadgeTranslationService] Badge translation updated", {
          badgeId,
          language,
          translationId: badgeTranslation.id,
          sourceName: content.name,
          updatedName: updateData.name,
          sourceDescription: content.description,
          updatedDescription: updateData.description,
          nameChanged: updateData.name !== content.name,
          descriptionChanged: updateData.description !== content.description,
        });
      }

      return translations;
    } catch (error) {
      logger.error(
        "[BadgeTranslationService] Failed to update badge translations",
        {
          badgeId,
          error: error instanceof Error ? error.message : String(error),
        },
      );
      throw error;
    }
  }

}

/**
 * Global BadgeTranslationService instance
 * Initialized with Prisma client when needed
 */
let badgeTranslationServiceInstance: BadgeTranslationService | null = null;

/**
 * Get or initialize the global BadgeTranslationService instance
 * @param prisma - Prisma client instance
 * @returns Global BadgeTranslationService instance
 */
export function getBadgeTranslationService(
  prisma: PrismaClient,
): BadgeTranslationService {
  if (!badgeTranslationServiceInstance) {
    badgeTranslationServiceInstance = new BadgeTranslationService(prisma);
  }
  return badgeTranslationServiceInstance;
}

