import { PrismaClient } from "@prisma/client";
import { logger } from "../utils/logger";
import { Challenge, ChallengeQuery, ChallengeType } from "../types";

export class ChallengeService {
  private prisma: PrismaClient;
  private readonly DEFAULT_LIMIT = 20;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  /**
   * Get challenges with pagination and filters
   */
  async getChallenges(query: ChallengeQuery): Promise<{
    challenges: Challenge[];
    total: number;
  }> {
    try {
      const limit = query.limit || this.DEFAULT_LIMIT;
      const offset = query.offset || 0;

      const whereClause: any = {};
      if (query.chapterId) whereClause.chapterId = query.chapterId;
      if (query.storyId) {
        // Get all chapters for the story first
        const chapters = await this.prisma.chapter.findMany({
          where: { storyId: query.storyId },
          select: { id: true },
        });
        if (chapters.length > 0) {
          whereClause.chapterId = { in: chapters.map((c) => c.id) };
        }
      }
      if (query.type) whereClause.type = query.type;

      const [challenges, total] = await Promise.all([
        this.prisma.challenge.findMany({
          where: whereClause,
          include: {
            answers: {
              orderBy: { order: "asc" },
            },
          },
          orderBy: { order: "asc" },
          take: limit,
          skip: offset,
        }),
        this.prisma.challenge.count({ where: whereClause }),
      ]);

      logger.info("Challenges retrieved successfully", {
        total,
        returned: challenges.length,
      });

      return { challenges: challenges as Challenge[], total };
    } catch (error) {
      logger.error("Error fetching challenges", { error: String(error) });
      throw error;
    }
  }

  /**
   * Get a single challenge with answers
   */
  async getChallengeById(challengeId: string): Promise<Challenge | null> {
    try {
      const challenge = await this.prisma.challenge.findUnique({
        where: { id: challengeId },
        include: {
          answers: {
            orderBy: { order: "asc" },
          },
        },
      });

      if (!challenge) {
        logger.warn("Challenge not found", { challengeId });
        return null;
      }

      logger.info("Challenge retrieved successfully", { challengeId });
      return challenge as Challenge;
    } catch (error) {
      logger.error("Error fetching challenge", {
        challengeId,
        error: String(error),
      });
      throw error;
    }
  }

  /**
   * Get challenges by chapter
   */
  async getChallengesByChapter(chapterId: string): Promise<Challenge[]> {
    try {
      const challenges = await this.prisma.challenge.findMany({
        where: { chapterId },
        include: {
          answers: {
            orderBy: { order: "asc" },
          },
        },
        orderBy: { order: "asc" },
      });

      logger.info("Challenges for chapter retrieved", {
        chapterId,
        count: challenges.length,
      });

      return challenges as Challenge[];
    } catch (error) {
      logger.error("Error fetching challenges by chapter", {
        chapterId,
        error: String(error),
      });
      throw error;
    }
  }

  /**
   * Create a new challenge
   */
  async createChallenge(data: {
    chapterId: string;
    type: ChallengeType;
    question: string;
    description?: string | null;
    baseStars?: number;
    order: number;
    hints?: string[];
  }): Promise<Challenge> {
    try {
      logger.info("Creating challenge", {
        chapterId: data.chapterId,
        type: data.type,
        order: data.order,
      });

      const challenge = await this.prisma.challenge.create({
        data: {
          chapterId: data.chapterId,
          type: data.type,
          question: data.question,
          description: data.description || null,
          baseStars: data.baseStars || 20,
          order: data.order,
          hints: data.hints || [],
        },
        include: {
          answers: {
            orderBy: { order: "asc" },
          },
        },
      });

      logger.info("Challenge created successfully", {
        challengeId: challenge.id,
        chapterId: data.chapterId,
      });

      return challenge as Challenge;
    } catch (error) {
      logger.error("Error creating challenge", {
        data,
        error: String(error),
      });
      throw error;
    }
  }

  /**
   * Update an existing challenge
   */
  async updateChallenge(
    challengeId: string,
    data: Partial<{
      type: ChallengeType;
      question: string;
      description: string | null;
      baseStars: number;
      order: number;
      hints: string[];
    }>
  ): Promise<Challenge> {
    try {
      logger.info("Updating challenge", { challengeId });

      const challenge = await this.prisma.challenge.update({
        where: { id: challengeId },
        data,
        include: {
          answers: {
            orderBy: { order: "asc" },
          },
        },
      });

      logger.info("Challenge updated successfully", { challengeId });
      return challenge as Challenge;
    } catch (error) {
      logger.error("Error updating challenge", {
        challengeId,
        error: String(error),
      });
      throw error;
    }
  }
}
