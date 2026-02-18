import { PrismaClient } from "@prisma/client";
import { logger } from "../utils/logger";
import type { Roadmap } from "../types";

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
              stories: true,
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
}
