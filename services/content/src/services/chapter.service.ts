import { PrismaClient } from "@prisma/client";
import { logger } from "../utils/logger";
import type { Chapter } from "../types";

export class ChapterService {
  private prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  /**
   * Get all chapters with optional filters
   */
  async getChapters(): Promise<Chapter[]> {
    try {
      const chapters = await this.prisma.chapter.findMany({
        include: {
          story: true,
          challenge: {
            include: {
              answers: {
                orderBy: { order: "asc" },
              },
            },
          },
        },
        orderBy: { order: "asc" },
      });

      logger.info("Chapters retrieved successfully", { count: chapters.length });
      return chapters as Chapter[];
    } catch (error) {
      logger.error("Error fetching chapters", { error: String(error) });
      throw error;
    }
  }

  /**
   * Get a single chapter with all details
   */
  async getChapterById(chapterId: string): Promise<Chapter | null> {
    try {
      const chapter = await this.prisma.chapter.findUnique({
        where: { id: chapterId },
        include: {
          story: {
            include: {
              world: true,
            },
          },
          challenge: {
            include: {
              answers: {
                orderBy: { order: "asc" },
              },
            },
          },
        },
      });

      if (!chapter) {
        logger.warn("Chapter not found", { chapterId });
        return null;
      }

      logger.info("Chapter retrieved successfully", { chapterId });
      return chapter as Chapter;
    } catch (error) {
      logger.error("Error fetching chapter", { chapterId, error: String(error) });
      throw error;
    }
  }

  /**
   * Get chapters by story ID
   */
  async getChaptersByStory(storyId: string): Promise<Chapter[]> {
    try {
      const chapters = await this.prisma.chapter.findMany({
        where: { storyId },
        include: {
          story: true,
          challenge: {
            include: {
              answers: {
                orderBy: { order: "asc" },
              },
            },
          },
        },
        orderBy: { order: "asc" },
      });

      logger.info("Chapters for story retrieved", {
        storyId,
        count: chapters.length,
      });

      return chapters as Chapter[];
    } catch (error) {
      logger.error("Error fetching chapters by story", {
        storyId,
        error: String(error),
      });
      throw error;
    }
  }

  /**
   * Check if order is already used in a story
   */
  async isOrderUsedInStory(
    storyId: string,
    order: number,
    excludeChapterId?: string
  ): Promise<boolean> {
    try {
      const chapter = await this.prisma.chapter.findFirst({
        where: {
          storyId,
          order,
          ...(excludeChapterId && { NOT: { id: excludeChapterId } }),
        },
      });

      return !!chapter;
    } catch (error) {
      logger.error("Error checking order in story", {
        storyId,
        order,
        error: String(error),
      });
      throw error;
    }
  }

  /**
   * Create a new chapter
   */
  async createChapter(data: {
    storyId: string;
    title: string;
    content: string;
    imageUrl?: string | null;
    audioUrl?: string | null;
    order: number;
  }): Promise<Chapter> {
    try {
      logger.info("Creating chapter", {
        storyId: data.storyId,
        title: data.title,
        order: data.order,
      });

      const chapter = await this.prisma.chapter.create({
        data,
        include: {
          story: true,
          challenge: {
            include: {
              answers: {
                orderBy: { order: "asc" },
              },
            },
          },
        },
      });

      logger.info("Chapter created successfully", {
        chapterId: chapter.id,
        storyId: data.storyId,
      });

      return chapter as Chapter;
    } catch (error) {
      logger.error("Error creating chapter", {
        data,
        error: String(error),
      });
      throw error;
    }
  }

  /**
   * Update an existing chapter
   */
  async updateChapter(
    chapterId: string,
    data: Partial<{
      title: string;
      content: string;
      imageUrl: string | null;
      audioUrl: string | null;
      order: number;
    }>
  ): Promise<Chapter> {
    try {
      logger.info("Updating chapter", { chapterId });

      const chapter = await this.prisma.chapter.update({
        where: { id: chapterId },
        data,
        include: {
          story: true,
          challenge: {
            include: {
              answers: {
                orderBy: { order: "asc" },
              },
            },
          },
        },
      });

      logger.info("Chapter updated successfully", { chapterId });
      return chapter as Chapter;
    } catch (error) {
      logger.error("Error updating chapter", {
        chapterId,
        error: String(error),
      });
      throw error;
    }
  }

  /**
   * Delete a chapter (cascades to challenge and answers)
   */
  async deleteChapter(chapterId: string): Promise<Chapter> {
    try {
      logger.info("Deleting chapter", { chapterId });

      const chapter = await this.prisma.chapter.delete({
        where: { id: chapterId },
        include: {
          story: true,
        },
      });

      logger.info("Chapter deleted successfully", {
        chapterId,
        title: chapter.title,
        storyId: chapter.storyId,
      });

      return chapter as Chapter;
    } catch (error) {
      logger.error("Error deleting chapter", {
        chapterId,
        error: String(error),
      });
      throw error;
    }
  }
}
