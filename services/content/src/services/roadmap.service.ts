import { PrismaClient, ReadingLevel } from "@prisma/client";
import { logger } from "../utils/logger";
import type { Roadmap } from "../types";
import { AgeGroupStatus } from "@shared/types";

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
        where:{ ageGroup: { status: AgeGroupStatus.ACTIVE } },
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
          theme: true,
          ageGroup: true,
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
    readingLevel: ReadingLevel
    title?: string;
  }): Promise<Roadmap> {
    try {
      logger.info("Creating roadmap", {
        ageGroupId: data.ageGroupId,
        themeId: data.themeId,
      });

      const roadmap = await this.prisma.roadmap.create({
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

      logger.info("Roadmap created successfully", {
        roadmapId: roadmap.id,
        ageGroupId: data.ageGroupId,
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
    }>
  ): Promise<Roadmap> {
    try {
      logger.info("Updating roadmap", { roadmapId });

      const roadmap = await this.prisma.roadmap.update({
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
}
