import { AgeGroupStatus, PrismaClient } from "@prisma/client";
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
  async getAgeGroupsForAdmin(): Promise<AgeGroup[]> {
    try {
      const ageGroups = await this.prisma.ageGroup.findMany({
        include: {
          roadmaps: {
            include: {
              worlds: {
                include: {
                  stories: true,
                },
              },
              theme: true
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
          roadmaps: {
            include: {
              ageGroup: true,
              worlds: true,
              theme: true
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
  }): Promise<AgeGroup> {
    try {
      logger.info("Creating age group", { name: data.name });

      const ageGroup = await this.prisma.ageGroup.create({
        data,
        include: {
          roadmaps: true,
        },
      });

      logger.info("Age group created successfully", {
        ageGroupId: ageGroup.id,
        name: ageGroup.name,
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
    }>
  ): Promise<AgeGroup> {
    try {
      logger.info("Updating age group", { ageGroupId });

      const ageGroup = await this.prisma.ageGroup.update({
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
}
