import { PrismaClient } from "@prisma/client";
import { logger } from "../utils/logger";
import type { World } from "../types";

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
          stories: true,
        },
        orderBy: { order: "asc" },
      });

      logger.info("Worlds retrieved successfully", { count: worlds.length });
      return worlds as World[];
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
          stories: true,
        },
      });

      if (!world) {
        logger.warn("World not found", { worldId });
        return null;
      }

      logger.info("World retrieved successfully", { worldId });
      return world as World;
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
          stories: true,
        },
        orderBy: { order: "asc" },
      });

      logger.info("Worlds for roadmap retrieved", {
        roadmapId,
        count: worlds.length,
      });

      return worlds as World[];
    } catch (error) {
      logger.error("Error fetching worlds by roadmap", {
        roadmapId,
        error: String(error),
      });
      throw error;
    }
  }
}
