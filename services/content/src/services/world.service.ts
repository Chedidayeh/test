import { PrismaClient, LanguageCode } from "@prisma/client";
import { logger } from "../utils/logger";
import { getTranslationService } from "../translations/translation.service";
import { TranslationSourceType, ManualTranslationEdit, World } from "@shared/src/types";
import { TRANSLATION_CONFIG, TRANSLATION_STRATEGIES } from "../config/translation-config";

export class WorldService {
  private prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  /**
   * Get all worlds
   */
  async getWorlds(): Promise<World[]> {
    try {
      const worlds = await this.prisma.world.findMany({
        include: {
          stories: {
            include:{
              translations: true,
            }
          },
        },
        orderBy: { order: "asc" },
      });

      logger.info("Worlds retrieved successfully", { count: worlds.length });
      return worlds
    } catch (error) {
      logger.error("Error fetching worlds", { error: String(error) });
      throw error;
    }
  }

  /**
   * Get a single world with stories
   */
  async getWorldById(worldId: string): Promise<World | null> {
    try {
      const world = await this.prisma.world.findUnique({
        where: { id: worldId },
        include: {
          stories: {
            include:{
              translations: true,
            }
          },
        },
      });

      if (!world) {
        logger.warn("World not found", { worldId });
        return null;
      }

      logger.info("World retrieved successfully", { worldId });
      return world
    } catch (error) {
      logger.error("Error fetching world", { worldId, error: String(error) });
      throw error;
    }
  }

  /**
   * Get worlds by roadmap
   */
  async getWorldsByRoadmap(roadmapId: string): Promise<World[]> {
    try {
      const worlds = await this.prisma.world.findMany({
        where: { roadmapId },
        include: {
          stories: {
            include:{
              translations: true,
            }
          },
        },
        orderBy: { order: "asc" },
      });

      logger.info("Worlds for roadmap retrieved", {
        roadmapId,
        count: worlds.length,
      });

      return worlds
    } catch (error) {
      logger.error("Error fetching worlds by roadmap", {
        roadmapId,
        error: String(error),
      });
      throw error;
    }
  }

  /**
   * Check if order is already used in a roadmap
   */
  async isOrderUsedInRoadmap(
    roadmapId: string,
    order: number,
    excludeWorldId?: string
  ): Promise<boolean> {
    try {
      const world = await this.prisma.world.findFirst({
        where: {
          roadmapId,
          order,
          ...(excludeWorldId && { NOT: { id: excludeWorldId } }),
        },
      });

      return !!world;
    } catch (error) {
      logger.error("Error checking order in roadmap", {
        roadmapId,
        order,
        error: String(error),
      });
      throw error;
    }
  }

  /**
   * Create a new world
   */
  async createWorld(data: {
    roadmapId: string;
    name: string;
    description?: string | null;
    imageUrl?: string | null;
    order: number;
    translationSource?: string;
    translations?: ManualTranslationEdit[];
  }): Promise<World> {
    try {
      logger.info("Creating world", {
        roadmapId: data.roadmapId,
        name: data.name,
        order: data.order,
        translationSource: data.translationSource,
      });

      const { roadmapId, name, description, imageUrl, order, translationSource, translations } = data;

      // Create world and translations in a transaction
      const world = await this.prisma.$transaction(async (tx) => {
        // Create the world first
        const newWorld = await tx.world.create({
          data: {
            roadmapId,
            name,
            description: description || null,
            imageUrl: imageUrl || null,
            order,
          },
          include: {
            stories: true,
          },
        });

        logger.info("World created successfully", {
          worldId: newWorld.id,
          roadmapId: data.roadmapId,
        });

        // Handle translations if translation source is provided
        if (translationSource && TRANSLATION_CONFIG.ENABLE_AUTO_TRANSLATION) {
          try {
            const translationRecords = await this.handleTranslations(
              tx,
              newWorld.id,
              "worldTranslation",
              translationSource,
              name, // name field for World translation
              description || "", // description field for World translation
              translations,
            );

            logger.info("Translations created successfully", {
              worldId: newWorld.id,
              count: translationRecords.length,
            });
          } catch (translationError) {
            logger.error("Error creating translations", {
              worldId: newWorld.id,
              error: String(translationError),
            });
            // Log but don't fail - world is created
          }
        }

        return newWorld;
      });

      return world
    } catch (error) {
      logger.error("Error creating world", {
        data,
        error: String(error),
      });
      throw error;
    }
  }

  /**
   * Update an existing world
   */
  async updateWorld(
    worldId: string,
    data: Partial<{
      name: string;
      description: string | null;
      imageUrl: string | null;
      order: number;
    }>,
    translationSource?: string,
    translations?: ManualTranslationEdit[],
  ): Promise<World> {
    try {
      logger.info("Updating world", { worldId, translationSource });

      const world = await this.prisma.$transaction(async (tx) => {
        // Update the world
        const updatedWorld = await tx.world.update({
          where: { id: worldId },
          data,
          include: {
            stories: true,
          },
        });

        logger.info("World updated successfully", { worldId });

        // Handle translations if translation source is provided
        if (translationSource && TRANSLATION_CONFIG.ENABLE_AUTO_TRANSLATION) {
          try {
            // Delete old translations
            await tx.worldTranslation.deleteMany({
              where: { worldId },
            });

            logger.info("Old translations deleted", { worldId });

            // Get the fields for translation - use updated values if provided
            const nameForTranslations = data.name || updatedWorld.name;
            const descriptionForTranslations = data.description !== undefined ? data.description || "" : (updatedWorld.description || "");

            // Create new translations
            const translationRecords = await this.handleTranslations(
              tx,
              worldId,
              "worldTranslation",
              translationSource,
              nameForTranslations,
              descriptionForTranslations,
              translations,
            );

            logger.info("Translations updated successfully", {
              worldId,
              count: translationRecords.length,
            });
          } catch (translationError) {
            logger.error("Error updating translations", {
              worldId,
              error: String(translationError),
            });
            // Log but don't fail - world is updated
          }
        }

        return updatedWorld;
      });

      return world
    } catch (error) {
      logger.error("Error updating world", {
        worldId,
        error: String(error),
      });
      throw error;
    }
  }

  /**
   * Delete a world (cascades to stories, chapters, challenges)
   */
  async deleteWorld(worldId: string): Promise<World> {
    try {
      logger.info("Deleting world", { worldId });

      const world = await this.prisma.world.delete({
        where: { id: worldId },
      });

      logger.info("World deleted successfully", {
        worldId,
        name: world.name,
        roadmapId: world.roadmapId,
      });

      return world
    } catch (error) {
      logger.error("Error deleting world", {
        worldId,
        error: String(error),
      });
      throw error;
    }
  }

  /**
   * Handle translations for world (both MANUAL and AUTO modes)
   * World has dual fields: name and description
   */
  private async handleTranslations(
    tx: any, // Prisma transaction
    worldId: string,
    modelName: "worldTranslation",
    translationSource: string,
    sourceName: string,
    sourceDescription: string,
    manualTranslations?: ManualTranslationEdit[],
  ): Promise<any[]> {
    if (translationSource === TranslationSourceType.MANUAL && manualTranslations) {
      // MANUAL mode: use provided translations
      logger.info("[WorldService] Processing MANUAL translations", {
        worldId,
        count: manualTranslations.length,
      });

      const translationRecords = await tx.worldTranslation.createMany({
        data: manualTranslations.map((t) => ({
          worldId,
          languageCode: t.languageCode,
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
      logger.info("[WorldService] Processing AUTO translations", {
        worldId,
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
            worldId,
            languageCode: strategy.sourceLanguage,
            name: sourceName,
            description: sourceDescription,
          },
          ...Array.from(nameTranslations.entries()).map(([lang, translatedName]) => ({
            worldId,
            languageCode: lang,
            name: translatedName,
            description: descriptionTranslations.get(lang) || sourceDescription,
          })),
        ];

        const translationRecords = await tx.worldTranslation.createMany({
          data: translationData,
          skipDuplicates: true,
        });

        logger.info("[WorldService] AUTO translations created", {
          worldId,
          count: translationRecords.count,
        });

        return translationRecords || [];
      } catch (error) {
        logger.error("[WorldService] Error in AUTO translation", {
          worldId,
          error: String(error),
        });
        throw error;
      }
    }

    return [];
  }
}
