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
  }): Promise<World> {
    try {
      logger.info("Creating world", {
        roadmapId: data.roadmapId,
        name: data.name,
        order: data.order,
      });

      const world = await this.prisma.world.create({
        data,
        include: {
          stories: true,
        },
      });

      logger.info("World created successfully", {
        worldId: world.id,
        roadmapId: data.roadmapId,
      });

      return world as World;
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
    }>
  ): Promise<World> {
    try {
      logger.info("Updating world", { worldId });

      const world = await this.prisma.world.update({
        where: { id: worldId },
        data,
        include: {
          stories: true,
        },
      });

      logger.info("World updated successfully", { worldId });
      return world as World;
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

      return world as World;
    } catch (error) {
      logger.error("Error deleting world", {
        worldId,
        error: String(error),
      });
      throw error;
    }
  }
}
