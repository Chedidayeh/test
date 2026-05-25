import { PrismaClient } from "@prisma/client";
import { logger } from "../utils/logger";
import type { Challenge } from "@shared/src/types";

export class ChallengeService {
  private prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  /**
   * Get multiple challenges by their IDs
   * Efficiently fetch challenge metadata with type information
   * Used for enriching analytics data with challenge types
   */
  async getChallengesByIds(challengeIds: string[]): Promise<Challenge[]> {
    try {
      if (!challengeIds || challengeIds.length === 0) {
        return [];
      }

      // Remove duplicates
      const uniqueIds = Array.from(new Set(challengeIds));

      const challenges = await this.prisma.challenge.findMany({
        where: {
          id: { in: uniqueIds },
        },
        include: {
          translations: true,
          answers: {
            include: { translations: true },
            orderBy: { order: "asc" },
          },
        },
        orderBy: { order: "asc" },
      });

      logger.info("Challenges by IDs retrieved", {
        requestedCount: uniqueIds.length,
        foundCount: challenges.length,
      });

      return challenges;
    } catch (error) {
      logger.error("Error fetching challenges by IDs", {
        requestedCount: challengeIds?.length,
        error: String(error),
      });
      throw error;
    }
  }

  /**
   * Get a single challenge by ID
   */
  async getChallengeById(challengeId: string): Promise<Challenge | null> {
    try {
      const challenge = await this.prisma.challenge.findUnique({
        where: { id: challengeId },
        include: {
          translations: true,
          answers: {
            include: { translations: true },
            orderBy: { order: "asc" },
          },
        },
      });

      if (!challenge) {
        logger.warn("Challenge not found", { challengeId });
        return null;
      }

      logger.info("Challenge retrieved successfully", { challengeId });
      return challenge;
    } catch (error) {
      logger.error("Error fetching challenge", { challengeId, error: String(error) });
      throw error;
    }
  }

  /**
   * Get challenges by chapter ID
   */
  async getChallengesByChapterId(chapterId: string): Promise<Challenge[]> {
    try {
      const challenges = await this.prisma.challenge.findMany({
        where: { chapterId },
        include: {
          translations: true,
          answers: {
            include: { translations: true },
            orderBy: { order: "asc" },
          },
        },
        orderBy: { order: "asc" },
      });

      logger.info("Challenges for chapter retrieved", {
        chapterId,
        count: challenges.length,
      });

      return challenges;
    } catch (error) {
      logger.error("Error fetching challenges by chapter", {
        chapterId,
        error: String(error),
      });
      throw error;
    }
  }
}
