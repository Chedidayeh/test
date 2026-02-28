import { PrismaClient, Level } from "@prisma/client";
import { logger } from "../utils/logger";

export class LevelService {
  private prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  /**
   * Get all levels
   */
  async getAllLevels(): Promise<Level[]> {
    try {
      const levels = await this.prisma.level.findMany({
        include: {
          badges: true,
        },
        orderBy: {
          levelNumber: "asc",
        },
      });

      logger.info("All levels retrieved successfully", {
        count: levels.length,
      });

      return levels;
    } catch (error) {
      logger.error("Error fetching levels", { error: String(error) });
      throw error;
    }
  }

  /**
   * Get a single level by ID
   */
  async getLevelById(levelId: string): Promise<Level | null> {
    try {
      const level = await this.prisma.level.findUnique({
        where: { id: levelId },
        include: {
          badges: true,
        },
      });

      if (!level) {
        logger.warn("Level not found", { levelId });
        return null;
      }

      logger.info("Level retrieved successfully", { levelId });
      return level;
    } catch (error) {
      logger.error("Error fetching level", { levelId, error: String(error) });
      throw error;
    }
  }

  /**
   * Get a level by level number
   */
  async getLevelByNumber(levelNumber: number): Promise<Level | null> {
    try {
      const level = await this.prisma.level.findUnique({
        where: { levelNumber },
        include: {
          badges: true,
        },
      });

      if (!level) {
        logger.warn("Level not found by number", { levelNumber });
        return null;
      }

      logger.info("Level retrieved by number", { levelNumber });
      return level;
    } catch (error) {
      logger.error("Error fetching level by number", {
        levelNumber,
        error: String(error),
      });
      throw error;
    }
  }

  /**
   * Create a new level
   */
  async createLevel(data: {
    levelNumber: number;
    requiredStars: number;
  }): Promise<Level> {
    try {
      logger.info("Creating level", { levelNumber: data.levelNumber });

      const level = await this.prisma.level.create({
        data,
        include: {
          badges: true,
        },
      });

      logger.info("Level created successfully", { levelId: level.id });
      return level;
    } catch (error) {
      logger.error("Error creating level", { data, error: String(error) });
      throw error;
    }
  }

  /**
   * Update an existing level
   */
  async updateLevel(
    levelId: string,
    data: Partial<{
      levelNumber: number;
      requiredStars: number;
    }>
  ): Promise<Level> {
    try {
      logger.info("Updating level", { levelId });

      const level = await this.prisma.level.update({
        where: { id: levelId },
        data,
        include: {
          badges: true,
        },
      });

      logger.info("Level updated successfully", { levelId });
      return level;
    } catch (error) {
      logger.error("Error updating level", { levelId, error: String(error) });
      throw error;
    }
  }

  /**
   * Delete a level by ID
   */
  async deleteLevel(levelId: string): Promise<Level> {
    try {
      logger.info("Deleting level", { levelId });

      const level = await this.prisma.level.delete({
        where: { id: levelId },
        include: {
          badges: true,
        },
      });

      logger.info("Level deleted successfully", { levelId });
      return level;
    } catch (error) {
      logger.error("Error deleting level", { levelId, error: String(error) });
      throw error;
    }
  }
}
