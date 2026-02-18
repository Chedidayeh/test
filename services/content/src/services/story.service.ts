import { PrismaClient } from "@prisma/client";
import { logger } from "../utils/logger";
import type { Story, StoryQuery } from "../types";

export class StoryService {
  private prisma: PrismaClient;
  private readonly DEFAULT_LIMIT = 20;
  private readonly MAX_LIMIT = 100;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  /**
   * Get all stories with pagination and filters
   */
  async getStories(query: StoryQuery): Promise<{
    stories: Story[];
    total: number;
  }> {
    try {
      const limit = Math.min(query.limit || this.DEFAULT_LIMIT, this.MAX_LIMIT);
      const offset = query.offset || 0;

      // Build where clause based on filters
      const whereClause: any = {};
      if (query.worldId) whereClause.worldId = query.worldId;
      if (query.difficulty) whereClause.difficulty = query.difficulty;
      if (query.isMandatory !== undefined) whereClause.isMandatory = query.isMandatory;

      const [stories, total] = await Promise.all([
        this.prisma.story.findMany({
          where: whereClause,
          include: {
            chapters: {
              select: {
                id: true,
                storyId: true,
                title: true,
                content: true,
                imageUrl: true,
                audioUrl: true,
                order: true,
                createdAt: true,
                updatedAt: true,
                challenge : true,
              },
            },
            world : true,
          },
          orderBy: { order: "asc" },
          take: limit,
          skip: offset,
        }),
        this.prisma.story.count({ where: whereClause }),
      ]);

      logger.info("Stories retrieved successfully", {
        total,
        returned: stories.length,
        limit,
        offset,
      });

      return { stories: stories as Story[], total };
    } catch (error) {
      logger.error("Error fetching stories", { error: String(error) });
      throw error;
    }
  }

  /**
   * Get a single story with all details
   */
  async getStoryById(storyId: string): Promise<Story | null> {
    try {
      const story = await this.prisma.story.findUnique({
        where: { id: storyId },
        include: {
          world: true,
          chapters: {
            include: {
              challenge: {
                include: {
                  answers: {
                    orderBy: { order: "asc" },
                  },
                },
              },
            },
            orderBy: { order: "asc" },
          },
        },
      });

      if (!story) {
        logger.warn("Story not found", { storyId });
        return null;
      }

      logger.info("Story retrieved successfully", { storyId });
      return story as Story;
    } catch (error) {
      logger.error("Error fetching story", { storyId, error: String(error) });
      throw error;
    }
  }

  /**
   * Get stories by world ID
   */
  async getStoriesByWorld(worldId: string): Promise<Story[]> {
    try {
      const stories = await this.prisma.story.findMany({
        where: { worldId },
        include: {
          world: true,
          chapters: {
            select: {
              id: true,
              storyId: true,
              title: true,
              content: true,
              imageUrl: true,
              audioUrl: true,
              order: true,
              createdAt: true,
              updatedAt: true,
            },
          },
        },
        orderBy: { order: "asc" },
      });

      logger.info("Stories for world retrieved", {
        worldId,
        count: stories.length,
      });

      return stories as Story[];
    } catch (error) {
      logger.error("Error fetching stories by world", {
        worldId,
        error: String(error),
      });
      throw error;
    }
  }

  /**
   * Count total stories
   */
  async countStories(): Promise<number> {
    try {
      const count = await this.prisma.story.count();
      return count;
    } catch (error) {
      logger.error("Error counting stories", { error: String(error) });
      throw error;
    }
  }
}
