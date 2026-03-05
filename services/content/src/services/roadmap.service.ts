import { PrismaClient, ReadingLevel, LanguageCode } from "@prisma/client";
import { logger } from "../utils/logger";
import type { Roadmap } from "../types";
import { AgeGroupStatus, TranslationSourceType, ManualTranslationEdit } from "@shared/types";
import { getTranslationService } from "../translations/translation.service";
import { TRANSLATION_CONFIG, TRANSLATION_STRATEGIES } from "../config/translation-config";

export class RoadmapService {
  private prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  /**
   * Get all roadmaps
   */
  async getRoadmaps(): Promise<Roadmap[]> {
    try {
      const roadmaps = await this.prisma.roadmap.findMany({
        where: { ageGroup: { status: AgeGroupStatus.ACTIVE } },
        include: {
          theme: true,
          ageGroup: true,
          worlds: {
            include: {
              stories: true,
            },
            orderBy: { order: "asc" },
          },
        },
      });

      logger.info("Roadmaps retrieved successfully", {
        count: roadmaps.length,
      });

      return roadmaps as Roadmap[];
    } catch (error) {
      logger.error("Error fetching roadmaps", { error: String(error) });
      throw error;
    }
  }

  /**
   * Get a single roadmap with all details
   */
  async getRoadmapById(roadmapId: string): Promise<Roadmap | null> {
    try {
      const roadmap = await this.prisma.roadmap.findUnique({
        where: { id: roadmapId },
        include: {
          theme: true,
          worlds: {
            include: {
              stories: true,
            },
            orderBy: { order: "asc" },
          },
        },
      });

      if (!roadmap) {
        logger.warn("Roadmap not found", { roadmapId });
        return null;
      }

      logger.info("Roadmap retrieved successfully", { roadmapId });
      return roadmap as Roadmap;
    } catch (error) {
      logger.error("Error fetching roadmap", {
        roadmapId,
        error: String(error),
      });
      throw error;
    }
  }

  /**
   * Get roadmaps by age group
   */
  async getRoadmapsByAgeGroup(ageGroupId: string): Promise<Roadmap[]> {
    try {
      const roadmaps = await this.prisma.roadmap.findMany({
        where: { ageGroupId },
        include: {
          theme: true,
          worlds: {
            include: {
              stories: {
                include: { chapters: { include: { challenge: true } } },
              },
            },
            orderBy: { order: "asc" },
          },
        },
      });

      logger.info("Roadmaps for age group retrieved", {
        ageGroupId,
        count: roadmaps.length,
      });

      return roadmaps as Roadmap[];
    } catch (error) {
      logger.error("Error fetching roadmaps by age group", {
        ageGroupId,
        error: String(error),
      });
      throw error;
    }
  }

  /**
   * Get multiple roadmaps by their IDs
   * Efficiently fetches multiple roadmaps in a single database query
   */
  async getRoadmapsByIds(roadmapIds: string[]): Promise<Roadmap[]> {
    try {
      if (!roadmapIds || roadmapIds.length === 0) {
        logger.info("Empty roadmap IDs provided");
        return [];
      }

      const roadmaps = await this.prisma.roadmap.findMany({
        where: {
          id: {
            in: roadmapIds,
          },
        },
        include: {
          translations: true,
          theme: true,
          ageGroup: true,
          worlds: {
            include: {
              translations: true,
              stories: {
                include: {
                  translations: true,
                  chapters: { include: { challenge: true } },
                },
              },
            },
            orderBy: { order: "asc" },
          },
        },
      });

      logger.info("Roadmaps by IDs retrieved successfully", {
        requestedCount: roadmapIds.length,
        foundCount: roadmaps.length,
      });

      return roadmaps as Roadmap[];
    } catch (error) {
      logger.error("Error fetching roadmaps by IDs", {
        roadmapIds,
        error: String(error),
      });
      throw error;
    }
  }

  /**
   * Get roadmap by theme ID (for uniqueness validation)
   */
  async getRoadmapByThemeId(themeId: string): Promise<Roadmap[]> {
    try {
      const roadmap = await this.prisma.roadmap.findMany({
        where: { themeId },
        include: {
          theme: true,
          ageGroup: true,
        },
      });

      return roadmap as Roadmap[];
    } catch (error) {
      logger.error("Error fetching roadmap by theme ID", {
        themeId,
        error: String(error),
      });
      throw error;
    }
  }

  /**
   * Create a new roadmap
   */
  async createRoadmap(data: {
    ageGroupId: string;
    themeId: string;
    readingLevel: ReadingLevel;
    title?: string | null;
    translationSource?: string;
    translations?: ManualTranslationEdit[];
  }): Promise<Roadmap> {
    try {
      logger.info("Creating roadmap", {
        ageGroupId: data.ageGroupId,
        themeId: data.themeId,
        translationSource: data.translationSource,
      });

      const { ageGroupId, themeId, readingLevel, title, translationSource, translations } = data;

      // Create roadmap and translations in a transaction
      const roadmap = await this.prisma.$transaction(async (tx) => {
        // Create the roadmap first
        const newRoadmap = await tx.roadmap.create({
          data: {
            ageGroupId,
            themeId,
            readingLevel,
            title: title || null,
          },
          include: {
            theme: true,
            ageGroup: true,
            worlds: {
              include: {
                stories: true,
              },
              orderBy: { order: "asc" },
            },
          },
        });

        logger.info("Roadmap created successfully", {
          roadmapId: newRoadmap.id,
          ageGroupId: data.ageGroupId,
        });

        // Handle translations if translation source is provided
        if (translationSource && TRANSLATION_CONFIG.ENABLE_AUTO_TRANSLATION) {
          try {
            const translationRecords = await this.handleTranslations(
              tx,
              newRoadmap.id,
              "roadmapTranslation",
              translationSource,
              title || newRoadmap.title || "", // Only title field for Roadmap
              translations,
            );

            logger.info("Translations created successfully", {
              roadmapId: newRoadmap.id,
              count: translationRecords.length,
            });
          } catch (translationError) {
            logger.error("Error creating translations", {
              roadmapId: newRoadmap.id,
              error: String(translationError),
            });
            // Log but don't fail - roadmap is created
          }
        }

        return newRoadmap;
      });

      return roadmap as Roadmap;
    } catch (error) {
      logger.error("Error creating roadmap", {
        data,
        error: String(error),
      });
      throw error;
    }
  }

  /**
   * Update an existing roadmap
   */
  async updateRoadmap(
    roadmapId: string,
    data: Partial<{
      ageGroupId: string;
      readingLevel: ReadingLevel;
      title: string;
    }>,
    translationSource?: string,
    translations?: ManualTranslationEdit[],
  ): Promise<Roadmap> {
    try {
      logger.info("Updating roadmap", { roadmapId, translationSource });

      const roadmap = await this.prisma.$transaction(async (tx) => {
        // Update the roadmap
        const updatedRoadmap = await tx.roadmap.update({
          where: { id: roadmapId },
          data,
          include: {
            theme: true,
            ageGroup: true,
            worlds: {
              include: {
                stories: true,
              },
              orderBy: { order: "asc" },
            },
          },
        });

        logger.info("Roadmap updated successfully", { roadmapId });

        // Handle translations if translation source is provided
        if (translationSource && TRANSLATION_CONFIG.ENABLE_AUTO_TRANSLATION) {
          try {
            // Delete old translations
            await tx.roadmapTranslation.deleteMany({
              where: { roadmapId },
            });

            logger.info("Old translations deleted", { roadmapId });

            // Get the title field for translation - use updated title if provided
            const titleForTranslations = data.title || updatedRoadmap.title || "";

            // Create new translations
            const translationRecords = await this.handleTranslations(
              tx,
              roadmapId,
              "roadmapTranslation",
              translationSource,
              titleForTranslations,
              translations,
            );

            logger.info("Translations updated successfully", {
              roadmapId,
              count: translationRecords.length,
            });
          } catch (translationError) {
            logger.error("Error updating translations", {
              roadmapId,
              error: String(translationError),
            });
            // Log but don't fail - roadmap is updated
          }
        }

        return updatedRoadmap;
      });

      return roadmap as Roadmap;
    } catch (error) {
      logger.error("Error updating roadmap", {
        roadmapId,
        error: String(error),
      });
      throw error;
    }
  }

  /**
   * Delete a roadmap (cascades to worlds, stories, chapters, challenges)
   */
  async deleteRoadmap(roadmapId: string): Promise<Roadmap> {
    try {
      logger.info("Deleting roadmap", { roadmapId });

      const roadmap = await this.prisma.roadmap.delete({
        where: { id: roadmapId },
        include: {
          theme: true,
          ageGroup: true,
        },
      });

      logger.info("Roadmap deleted successfully", {
        roadmapId,
        ageGroupId: roadmap.ageGroupId,
        themeId: roadmap.themeId,
      });

      return roadmap as Roadmap;
    } catch (error) {
      logger.error("Error deleting roadmap", {
        roadmapId,
        error: String(error),
      });
      throw error;
    }
  }

  /**
   * Handle translations for roadmap (both MANUAL and AUTO modes)
   * Roadmap has single field: title
   */
  private async handleTranslations(
    tx: any, // Prisma transaction
    roadmapId: string,
    modelName: "roadmapTranslation",
    translationSource: string,
    sourceText: string,
    manualTranslations?: ManualTranslationEdit[],
  ): Promise<any[]> {
    if (translationSource === TranslationSourceType.MANUAL && manualTranslations) {
      // MANUAL mode: use provided translations
      logger.info("[RoadmapService] Processing MANUAL translations", {
        roadmapId,
        count: manualTranslations.length,
      });

      const translationRecords = await tx.roadmapTranslation.createMany({
        data: manualTranslations.map((t) => ({
          roadmapId,
          languageCode: t.languageCode as LanguageCode,
          title: t.title || sourceText,
        })),
        skipDuplicates: true,
      });

      return translationRecords;
    } else if (
      translationSource === TranslationSourceType.EN_TO_FR_AR ||
      translationSource === TranslationSourceType.FR_TO_AR_EN
    ) {
      // AUTO mode: use translation service
      logger.info("[RoadmapService] Processing AUTO translations", {
        roadmapId,
        translationSource,
      });

      const strategy = TRANSLATION_STRATEGIES[translationSource];
      const translationService = getTranslationService(this.prisma);

      try {
        const translations = await translationService.translateContent(
          sourceText,
          strategy.sourceLanguage,
          strategy.targetLanguages,
        );

        // Include source language + target languages
        const translationData = [
          {
            roadmapId,
            languageCode: strategy.sourceLanguage,
            title: sourceText,
          },
          ...Array.from(translations.entries()).map(([lang, text]) => ({
            roadmapId,
            languageCode: lang,
            title: text,
          })),
        ];

        const translationRecords = await tx.roadmapTranslation.createMany({
          data: translationData,
          skipDuplicates: true,
        });

        logger.info("[RoadmapService] AUTO translations created", {
          roadmapId,
          count: translationRecords.count,
        });

        return translationRecords || [];
      } catch (error) {
        logger.error("[RoadmapService] Error in AUTO translation", {
          roadmapId,
          error: String(error),
        });
        throw error;
      }
    }

    return [];
  }
}
