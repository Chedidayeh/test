import { PrismaClient } from "@prisma/client";
import { logger } from "../utils/logger";
import type {
  Chapter,
  ContentServicePayload,
  GeneratedStory,
  Story,
} from "@shared/src/types";
import { ChallengeType } from "@shared/src/types";
import { StoryQuery } from "../types";

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
      whereClause.isStorytellingStory = false;
      

      const [stories, total] = await Promise.all([
        this.prisma.story.findMany({
          where: whereClause,
          include: {
            chapters: {
              select: {
                id: true,
                storyId: true,
                content: true,
                imageUrl: true,
                audioUrl: true,
                order: true,
                createdAt: true,
                updatedAt: true,
                challenge: true,
              },
            },
            translations: true,
            world: true,
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
          world: {
            include: { roadmap: true },
          },
          translations: true,
          chapters: {
            include: {
              translations: true,
              challenge: {
                include: {
                  translations: true,
                  answers: {
                    include: { translations: true },
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
          translations: true,
          chapters: {
            select: {
              id: true,
              storyId: true,
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
   * Get multiple stories by their IDs
   * More efficient than making multiple individual getStoryById() calls
   */
  async getStoriesByIds(storyIds: string[]): Promise<Story[]> {
    try {
      if (!storyIds || storyIds.length === 0) {
        return [];
      }

      // Remove duplicates
      const uniqueIds = Array.from(new Set(storyIds));

      const stories = await this.prisma.story.findMany({
        where: {
          id: { in: uniqueIds },
        },
        include: {
          translations: true,
          world: {
            include: { roadmap: true },
          },
          chapters: {
            include: {
              translations: true,
              challenge: {
                include: {
                  translations: true,
                  answers: {
                    include: { translations: true },
                    orderBy: { order: "asc" },
                  },
                },
              },
            },
            orderBy: { order: "asc" },
          },
        },
        orderBy: { order: "asc" },
      });

      logger.info("Stories by IDs retrieved", {
        requestedCount: uniqueIds.length,
        foundCount: stories.length,
      });

      return stories as Story[];
    } catch (error) {
      logger.error("Error fetching stories by IDs", {
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

  /**
   * Check if order is already used in a world
   */
  async isOrderUsedInWorld(
    worldId: string,
    order: number,
    excludeStoryId?: string,
  ): Promise<boolean> {
    try {
      const story = await this.prisma.story.findFirst({
        where: {
          worldId,
          order,
          ...(excludeStoryId && { NOT: { id: excludeStoryId } }),
        },
      });

      return !!story;
    } catch (error) {
      logger.error("Error checking order in world", {
        worldId,
        order,
        error: String(error),
      });
      throw error;
    }
  }

  /**
   * Create a new story
   */
  async createStory(data: {
    worldId: string;
    title: string;
    description?: string | null;
    difficulty: number;
    order: number;
  }): Promise<Story> {
    try {
      logger.info("Creating story", {
        worldId: data.worldId,
        title: data.title,
        order: data.order,
      });

      const story = await this.prisma.story.create({
        data,
        include: {
          chapters: {
            include: {
              challenge: {
                include: {
                  answers: true,
                },
              },
            },
          },
          world: true,
        },
      });

      logger.info("Story created successfully", {
        storyId: story.id,
        worldId: data.worldId,
      });

      return story as Story;
    } catch (error) {
      logger.error("Error creating story", {
        data,
        error: String(error),
      });
      throw error;
    }
  }

  /**
   * Update an existing story
   */
  async updateStory(
    storyId: string,
    data: Partial<{
      title: string;
      description: string | null;
      difficulty: number;
      order: number;
    }>,
  ): Promise<Story> {
    try {
      logger.info("Updating story", { storyId });

      const story = await this.prisma.story.update({
        where: { id: storyId },
        data,
        include: {
          chapters: {
            include: {
              challenge: {
                include: {
                  answers: true,
                },
              },
            },
          },
          world: true,
        },
      });

      logger.info("Story updated successfully", { storyId });
      return story as Story;
    } catch (error) {
      logger.error("Error updating story", {
        storyId,
        error: String(error),
      });
      throw error;
    }
  }

  /**
   * Create a story from AI Service generated story
   * Converts GeneratedStory to CreateStoryWithChaptersInput and creates atomically
   */
  async createStoryFromGeneratedStory(
    generatedStory: GeneratedStory,
  ): Promise<Story> {
    try {
      // Validate generated story
      if (
        !generatedStory?.id ||
        !generatedStory?.title ||
        !generatedStory?.content
      ) {
        throw new Error(
          "Invalid generated story: missing id, title, or content",
        );
      }


      // Extract chapters from generated story content
      const storyContent =
        generatedStory.content as unknown as ContentServicePayload; // Assuming content has chapters array
      if (!storyContent.chapters || !Array.isArray(storyContent.chapters)) {
        throw new Error("Generated story content must have chapters array");
      }

      // Build story creation input from generated story
      const storyInput = {
        title: generatedStory.title,
        description: generatedStory.planItem.summary || null,
        difficulty: generatedStory.planItem.world.baseDifficulty,
        order: generatedStory.planItem?.sequenceOrder || 0,
        chapters: storyContent.chapters.map((chapter) => ({
          content: chapter.content,
          order: chapter.order,
          challenge: chapter.challenge
            ? {
                type: chapter.challenge.type,
                question: chapter.challenge.question,
                order: 0, // Each chapter has one challenge at order 0
                hints: chapter.challenge.hints || [],
                baseStars: chapter.challenge.baseStars || 20,
                answers: chapter.challenge.answers.map((answer) => ({
                  text: answer.text,
                  isCorrect: answer.isCorrect,
                  order: answer.order,
                })),
              }
            : undefined,
        })),
      };

      logger.info("Creating story from generated story", {
        aiGeneratedStoryId: generatedStory.id,
        title: storyInput.title,
        chaptersCount: storyInput.chapters.length,
      });

      // Create story with all chapters
      const story = await this.prisma.story.create({
        data: {
          title: storyInput.title,
          description: storyInput.description,
          order: storyInput.order,
          difficulty: storyInput.difficulty,
          isStorytellingStory: true,
          generatedStoryId: generatedStory.id,
          chapters: {
            create: storyInput.chapters.map((chapter) => ({
              content: chapter.content,
              order: chapter.order,
              challenge: chapter.challenge
                ? {
                    create: {
                      type: chapter.challenge.type as ChallengeType,
                      question: chapter.challenge.question,
                      order: chapter.challenge.order,
                      hints: chapter.challenge.hints,
                      baseStars: chapter.challenge.baseStars,
                      answers: {
                        create: chapter.challenge.answers,
                      },
                    },
                  }
                : undefined,
            })),
          },
        },
        include: {
          chapters: {
            include: {
              challenge: {
                include: {
                  answers: true,
                },
              },
            },
            orderBy: { order: "asc" },
          },
          world: true,
          translations: true,
        },
      });

      logger.info("Story created from generated story successfully", {
        storyId: story.id,
      });

      return story as Story;
    } catch (error) {
      logger.error("Error creating story from generated story", {
        error: String(error),
      });
      throw error;
    }
  }

  /**
   * Delete a story by ID (cascades to chapters, challenges, answers)
   */
  async deleteStory(storyId: string) {
    try {
      logger.info("Deleting story", { storyId });

      const story = await this.prisma.story.delete({
        where: { id: storyId },
        include: {
          chapters: {
            include: {
              challenge: {
                include: {
                  answers: true,
                },
              },
            },
          },
          world: true,
        },
      });

      logger.info("Story deleted successfully", {
        storyId,
        chaptersDeleted: story.chapters.length,
      });

      return true;
    } catch (error) {
      logger.error("Error deleting story", {
        storyId,
        error: String(error),
      });
      throw error;
    }
  }
}
