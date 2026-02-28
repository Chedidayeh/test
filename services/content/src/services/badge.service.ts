import { PrismaClient, Badge } from "@prisma/client";
import { logger } from "../utils/logger";

export class BadgeService {
  private prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  /**
   * Get all badges
   */
  async getAllBadges(): Promise<Badge[]> {
    try {
      const badges = await this.prisma.badge.findMany({
        include: {
          level: true,
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
   * Create a new badge
   */
  async createBadge(data: {
    levelId: string;
    name: string;
    description?: string | null;
    iconUrl?: string | null;
  }): Promise<Badge> {
    try {
      logger.info("Creating badge", { levelId: data.levelId, name: data.name });

      const badge = await this.prisma.badge.create({
        data,
        include: {
          level: true,
        },
      });

      logger.info("Badge created successfully", { badgeId: badge.id });
      return badge;
    } catch (error) {
      logger.error("Error creating badge", { data, error: String(error) });
      throw error;
    }
  }

  /**
   * Update an existing badge
   */
  async updateBadge(
    badgeId: string,
    data: Partial<{
      name: string;
      description: string | null;
      iconUrl: string | null;
    }>
  ): Promise<Badge> {
    try {
      logger.info("Updating badge", { badgeId });

      const badge = await this.prisma.badge.update({
        where: { id: badgeId },
        data,
        include: {
          level: true,
        },
      });

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
