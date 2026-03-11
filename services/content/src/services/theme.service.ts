import { PrismaClient, LanguageCode } from "@prisma/client";
import { logger } from "../utils/logger";
import type { Theme } from "../types";
import { getTranslationService } from "../translations/translation.service";
import { TranslationSourceType, ManualTranslationEdit } from "@shared/src/types";
import { TRANSLATION_CONFIG, TRANSLATION_STRATEGIES } from "../config/translation-config";

export class ThemeService {
  private prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  /**
   * Get all themes
   */
  async getThemes(): Promise<Theme[]> {
    try {
      const themes = await this.prisma.theme.findMany({
        include: {
          roadmaps: true,
        },
      });

      logger.info("Themes retrieved successfully", {
        count: themes.length,
      });

      return themes as Theme[];
    } catch (error) {
      logger.error("Error fetching themes", { error: String(error) });
      throw error;
    }
  }

  /**
   * Get a single theme by ID
   */
  async getThemeById(themeId: string): Promise<Theme | null> {
    try {
      const theme = await this.prisma.theme.findUnique({
        where: { id: themeId },
        include: {
          roadmaps: true,
        },
      });

      if (!theme) {
        logger.warn("Theme not found", { themeId });
        return null;
      }

      logger.info("Theme retrieved successfully", { themeId });
      return theme as Theme;
    } catch (error) {
      logger.error("Error fetching theme", { error: String(error), themeId });
      throw error;
    }
  }

  /**
   * Get theme by name (for duplicate checking)
   */
  async getThemeByName(name: string): Promise<Theme | null> {
    try {
      const theme = await this.prisma.theme.findUnique({
        where: { name },
        include: {
          roadmaps: true,
        },
      });

      return theme as Theme | null;
    } catch (error) {
      logger.error("Error fetching theme by name", {
        name,
        error: String(error),
      });
      throw error;
    }
  }

  /**
   * Create a new theme
   */
  async createTheme(data: {
    name: string;
    description: string;
    imageUrl?: string | null;
    translationSource?: string;
    translations?: ManualTranslationEdit[];
  }): Promise<Theme> {
    try {
      logger.info("Creating theme", { name: data.name, translationSource: data.translationSource });

      const { name, description, imageUrl, translationSource, translations } = data;

      // Create theme and translations in a transaction
      const theme = await this.prisma.$transaction(async (tx) => {
        // Create the theme first
        const newTheme = await tx.theme.create({
          data: {
            name,
            description,
            imageUrl: imageUrl || null,
          },
          include: {
            roadmaps: true,
          },
        });

        logger.info("Theme created successfully", {
          themeId: newTheme.id,
          name: newTheme.name,
        });

        // Handle translations if translation source is provided
        if (translationSource && TRANSLATION_CONFIG.ENABLE_AUTO_TRANSLATION) {
          try {
            const translationRecords = await this.handleTranslations(
              tx,
              newTheme.id,
              "themeTranslation",
              translationSource,
              name, // name field for Theme translation
              description, // description field for Theme translation
              translations,
            );

            logger.info("Translations created successfully", {
              themeId: newTheme.id,
              count: translationRecords.length,
            });
          } catch (translationError) {
            logger.error("Error creating translations", {
              themeId: newTheme.id,
              error: String(translationError),
            });
            // Log but don't fail - theme is created
          }
        }

        return newTheme;
      });

      return theme as Theme;
    } catch (error) {
      logger.error("Error creating theme", {
        data,
        error: String(error),
      });
      throw error;
    }
  }

  /**
   * Update an existing theme
   */
  async updateTheme(
    themeId: string,
    data: Partial<{
      name: string;
      description: string;
      imageUrl: string | null;
    }>,
    translationSource?: string,
    translations?: ManualTranslationEdit[],
  ): Promise<Theme> {
    try {
      logger.info("Updating theme", { themeId, translationSource });

      const theme = await this.prisma.$transaction(async (tx) => {
        // Update the theme
        const updatedTheme = await tx.theme.update({
          where: { id: themeId },
          data,
          include: {
            roadmaps: true,
          },
        });

        logger.info("Theme updated successfully", { themeId });

        // Handle translations if translation source is provided
        if (translationSource && TRANSLATION_CONFIG.ENABLE_AUTO_TRANSLATION) {
          try {
            // Delete old translations
            await tx.themeTranslation.deleteMany({
              where: { themeId },
            });

            logger.info("Old translations deleted", { themeId });

            // Get the fields for translation - use updated values if provided
            const nameForTranslations = data.name || updatedTheme.name;
            const descriptionForTranslations = data.description || updatedTheme.description;

            // Create new translations
            const translationRecords = await this.handleTranslations(
              tx,
              themeId,
              "themeTranslation",
              translationSource,
              nameForTranslations,
              descriptionForTranslations,
              translations,
            );

            logger.info("Translations updated successfully", {
              themeId,
              count: translationRecords.length,
            });
          } catch (translationError) {
            logger.error("Error updating translations", {
              themeId,
              error: String(translationError),
            });
            // Log but don't fail - theme is updated
          }
        }

        return updatedTheme;
      });

      return theme as Theme;
    } catch (error) {
      logger.error("Error updating theme", {
        themeId,
        error: String(error),
      });
      throw error;
    }
  }

  /**
   * Delete a theme (cascades roadmap if it has dependent data)
   */
  async deleteTheme(themeId: string): Promise<Theme> {
    try {
      logger.info("Deleting theme", { themeId });

      const theme = await this.prisma.theme.delete({
        where: { id: themeId },
      });

      logger.info("Theme deleted successfully", {
        themeId,
        name: theme.name,
      });

      return theme as Theme;
    } catch (error) {
      logger.error("Error deleting theme", {
        themeId,
        error: String(error),
      });
      throw error;
    }
  }

  /**
   * Handle translations for theme (both MANUAL and AUTO modes)
   * Theme has dual fields: name and description
   */
  private async handleTranslations(
    tx: any, // Prisma transaction
    themeId: string,
    modelName: "themeTranslation",
    translationSource: string,
    sourceName: string,
    sourceDescription: string,
    manualTranslations?: ManualTranslationEdit[],
  ): Promise<any[]> {
    if (translationSource === TranslationSourceType.MANUAL && manualTranslations) {
      // MANUAL mode: use provided translations
      logger.info("[ThemeService] Processing MANUAL translations", {
        themeId,
        count: manualTranslations.length,
      });

      const translationRecords = await tx.themeTranslation.createMany({
        data: manualTranslations.map((t) => ({
          themeId,
          languageCode: t.languageCode as LanguageCode,
          name: t.name || sourceName,
          description: t.description || sourceDescription,
        })),
        skipDuplicates: true,
      });

      return translationRecords;
    } else if (
      translationSource === TranslationSourceType.EN_TO_FR_AR ||
      translationSource === TranslationSourceType.FR_TO_AR_EN
    ) {
      // AUTO mode: use translation service
      logger.info("[ThemeService] Processing AUTO translations", {
        themeId,
        translationSource,
      });

      const strategy = TRANSLATION_STRATEGIES[translationSource];
      const translationService = getTranslationService(this.prisma);

      try {
        // Translate name field
        const nameTranslations = await translationService.translateContent(
          sourceName,
          strategy.sourceLanguage,
          strategy.targetLanguages,
        );

        // Translate description field
        const descriptionTranslations = await translationService.translateContent(
          sourceDescription,
          strategy.sourceLanguage,
          strategy.targetLanguages,
        );

        // Include source language + target languages
        const translationData = [
          {
            themeId,
            languageCode: strategy.sourceLanguage,
            name: sourceName,
            description: sourceDescription,
          },
          ...Array.from(nameTranslations.entries()).map(([lang, translatedName]) => ({
            themeId,
            languageCode: lang,
            name: translatedName,
            description: descriptionTranslations.get(lang) || sourceDescription,
          })),
        ];

        const translationRecords = await tx.themeTranslation.createMany({
          data: translationData,
          skipDuplicates: true,
        });

        logger.info("[ThemeService] AUTO translations created", {
          themeId,
          count: translationRecords.count,
        });

        return translationRecords || [];
      } catch (error) {
        logger.error("[ThemeService] Error in AUTO translation", {
          themeId,
          error: String(error),
        });
        throw error;
      }
    }

    return [];
  }
}
