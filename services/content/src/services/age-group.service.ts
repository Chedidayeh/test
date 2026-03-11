import { AgeGroupStatus, PrismaClient, LanguageCode } from "@prisma/client";
import { logger } from "../utils/logger";
import type { AgeGroup } from "../types";
import { getTranslationService } from "../translations/translation.service";
import { TranslationSourceType, ManualTranslationEdit } from "@shared/src/types";
import {
  TRANSLATION_CONFIG,
  TRANSLATION_STRATEGIES,
} from "../config/translation-config";

export class AgeGroupService {
  private prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  /**
   * Get all age groups
   */
  async getAgeGroupsForAdmin(): Promise<AgeGroup[]> {
    try {
      const ageGroups = await this.prisma.ageGroup.findMany({
        include: {
          translations: true,
          roadmaps: {
            include: {
              translations: true,
              worlds: {
                include: {
                  translations: true,
                  stories: true,
                },
              },
              theme: {
                include: {
                  translations: true,
                },
              },
              ageGroup: true,
            },
          },
        },
      });

      logger.info("Age groups retrieved successfully", {
        count: ageGroups.length,
      });

      return ageGroups as AgeGroup[];
    } catch (error) {
      logger.error("Error fetching age groups", { error: String(error) });
      throw error;
    }
  }

  /**
   * Get all age groups
   */
  async getAgeGroups(): Promise<AgeGroup[]> {
    try {
      const ageGroups = await this.prisma.ageGroup.findMany({
        where: { status: AgeGroupStatus.ACTIVE },
        include: {
          translations: true,
          roadmaps: {
            include: {
              translations: true,
              worlds: {
                include: {
                  translations: true,
                  stories: true,
                },
              },
              theme: {
                include: {
                  translations: true,
                },
              },
              ageGroup: {
                include:{
                  translations: true,
                }
              },
            },
          },
        },
      });

      logger.info("Age groups retrieved successfully", {
        count: ageGroups.length,
      });

      return ageGroups as AgeGroup[];
    } catch (error) {
      logger.error("Error fetching age groups", { error: String(error) });
      throw error;
    }
  }

  /**
   * Get a single age group
   */
  async getAgeGroupById(ageGroupId: string): Promise<AgeGroup | null> {
    try {
      const ageGroup = await this.prisma.ageGroup.findUnique({
        where: { id: ageGroupId },
        include: {
          roadmaps: {
            include: {
              worlds: true,
            },
          },
        },
      });

      if (!ageGroup) {
        logger.warn("Age group not found", { ageGroupId });
        return null;
      }

      logger.info("Age group retrieved successfully", { ageGroupId });
      return ageGroup as AgeGroup;
    } catch (error) {
      logger.error("Error fetching age group", {
        ageGroupId,
        error: String(error),
      });
      throw error;
    }
  }

  /**
   * Get age group by name (for duplicate checking)
   */
  async getAgeGroupByName(name: string): Promise<AgeGroup | null> {
    try {
      const ageGroup = await this.prisma.ageGroup.findUnique({
        where: { name },
        include: {
          roadmaps: true,
        },
      });

      return ageGroup as AgeGroup | null;
    } catch (error) {
      logger.error("Error fetching age group by name", {
        name,
        error: String(error),
      });
      throw error;
    }
  }

  /**
   * Create a new age group
   */
  async createAgeGroup(data: {
    name: string;
    minAge: number;
    maxAge: number;
    status: AgeGroupStatus;
    translationSource?: string;
    translations?: ManualTranslationEdit[];
  }): Promise<AgeGroup> {
    try {
      logger.info("Creating age group", {
        name: data.name,
        translationSource: data.translationSource,
      });

      const { name, minAge, maxAge, status, translationSource, translations } =
        data;

      // Create age group and translations in a transaction
      const ageGroup = await this.prisma.$transaction(async (tx) => {
        // Create the age group first
        const newAgeGroup = await tx.ageGroup.create({
          data: {
            name,
            minAge,
            maxAge,
            status,
          },
          include: {
            roadmaps: true,
          },
        });

        logger.info("Age group created successfully", {
          ageGroupId: newAgeGroup.id,
          name: newAgeGroup.name,
        });

        // Handle translations if translation source is provided
        if (translationSource && TRANSLATION_CONFIG.ENABLE_AUTO_TRANSLATION) {
          try {
            const translationRecords = await this.handleTranslations(
              tx,
              newAgeGroup.id,
              "ageGroupTranslation",
              translationSource,
              name, // Only name field for AgeGroup
              translations,
            );

            logger.info("Translations created successfully", {
              ageGroupId: newAgeGroup.id,
              count: translationRecords.length,
            });
          } catch (translationError) {
            logger.error("Error creating translations", {
              ageGroupId: newAgeGroup.id,
              error: String(translationError),
            });
            // Log but don't fail - age group is created
          }
        }

        return newAgeGroup;
      });

      return ageGroup as AgeGroup;
    } catch (error) {
      logger.error("Error creating age group", {
        data,
        error: String(error),
      });
      throw error;
    }
  }

  /**
   * Update an existing age group
   */
  async updateAgeGroup(
    ageGroupId: string,
    data: Partial<{
      name: string;
      minAge: number;
      maxAge: number;
      status: AgeGroupStatus;
    }>,
    translationSource?: string,
    translations?: ManualTranslationEdit[],
  ): Promise<AgeGroup> {
    try {
      logger.info("Updating age group", { ageGroupId, translationSource });

      const ageGroup = await this.prisma.$transaction(async (tx) => {
        // Update the age group
        const updatedAgeGroup = await tx.ageGroup.update({
          where: { id: ageGroupId },
          data,
          include: {
            roadmaps: {
              include: {
                worlds: true,
              },
            },
          },
        });

        logger.info("Age group updated successfully", { ageGroupId });

        // Handle translations if translation source is provided
        if (translationSource && TRANSLATION_CONFIG.ENABLE_AUTO_TRANSLATION) {
          try {
            // Delete old translations
            await tx.ageGroupTranslation.deleteMany({
              where: { ageGroupId },
            });

            logger.info("Old translations deleted", { ageGroupId });

            // Get the name field - use updated name if provided, otherwise keep existing
            const nameForTranslations = data.name || updatedAgeGroup.name;

            // Create new translations
            const translationRecords = await this.handleTranslations(
              tx,
              ageGroupId,
              "ageGroupTranslation",
              translationSource,
              nameForTranslations,
              translations,
            );

            logger.info("Translations updated successfully", {
              ageGroupId,
              count: translationRecords.length,
            });
          } catch (translationError) {
            logger.error("Error updating translations", {
              ageGroupId,
              error: String(translationError),
            });
            // Log but don't fail - age group is updated
          }
        }

        return updatedAgeGroup;
      });

      logger.info("Age group updated successfully", { ageGroupId });
      return ageGroup as AgeGroup;
    } catch (error) {
      logger.error("Error updating age group", {
        ageGroupId,
        error: String(error),
      });
      throw error;
    }
  }

  /**
   * Delete an age group (cascades to roadmaps, worlds, stories)
   */
  async deleteAgeGroup(ageGroupId: string): Promise<AgeGroup> {
    try {
      logger.info("Deleting age group", { ageGroupId });

      const ageGroup = await this.prisma.ageGroup.delete({
        where: { id: ageGroupId },
      });

      logger.info("Age group deleted successfully", {
        ageGroupId,
        name: ageGroup.name,
      });

      return ageGroup as AgeGroup;
    } catch (error) {
      logger.error("Error deleting age group", {
        ageGroupId,
        error: String(error),
      });
      throw error;
    }
  }

  /**
   * Handle translations for age group (both MANUAL and AUTO modes)
   */
  private async handleTranslations(
    tx: any, // Prisma transaction
    ageGroupId: string,
    modelName: "ageGroupTranslation",
    translationSource: string,
    sourceText: string,
    manualTranslations?: ManualTranslationEdit[],
  ): Promise<any[]> {
    if (
      translationSource === TranslationSourceType.MANUAL &&
      manualTranslations
    ) {
      // MANUAL mode: use provided translations
      logger.info("[AgeGroupService] Processing MANUAL translations", {
        ageGroupId,
        count: manualTranslations.length,
      });

      const translationRecords = await tx.ageGroupTranslation.createMany({
        data: manualTranslations.map((t) => ({
          ageGroupId,
          languageCode: t.languageCode as LanguageCode,
          name: t.name || sourceText,
        })),
        skipDuplicates: true,
      });

      return translationRecords;
    } else if (
      translationSource === TranslationSourceType.EN_TO_FR_AR ||
      translationSource === TranslationSourceType.FR_TO_AR_EN
    ) {
      // AUTO mode: use translation service
      logger.info("[AgeGroupService] Processing AUTO translations", {
        ageGroupId,
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
            ageGroupId,
            languageCode: strategy.sourceLanguage,
            name: sourceText,
          },
          ...Array.from(translations.entries()).map(([lang, text]) => ({
            ageGroupId,
            languageCode: lang,
            name: text,
          })),
        ];

        const translationRecords = await tx.ageGroupTranslation.createMany({
          data: translationData,
          skipDuplicates: true,
        });

        logger.info("[AgeGroupService] AUTO translations created", {
          ageGroupId,
          count: translationRecords.count,
        });

        return translationRecords || [];
      } catch (error) {
        logger.error("[AgeGroupService] Error in AUTO translation", {
          ageGroupId,
          error: String(error),
        });
        throw error;
      }
    }

    return [];
  }
}
