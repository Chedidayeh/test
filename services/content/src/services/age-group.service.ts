import { PrismaClient } from "@prisma/client";
import { logger } from "../utils/logger";
import type { AgeGroup } from "../types";

export class AgeGroupService {
  private prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  /**
   * Get all age groups
   */
  async getAgeGroups(): Promise<AgeGroup[]> {
    try {
      const ageGroups = await this.prisma.ageGroup.findMany({
        include: {
          roadmaps: {
            include: {
              worlds: true,
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
}
