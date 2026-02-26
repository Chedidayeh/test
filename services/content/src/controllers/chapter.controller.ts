import { Request, Response } from "express";
import { ChapterService } from "../services/chapter.service";
import { sendSuccess, sendError } from "../utils/response";
import { logger } from "../utils/logger";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const chapterService = new ChapterService(prisma);

export class ChapterController {
  /**
   * Get all chapters
   * GET /api/chapters
   */
  async getChapters(req: Request, res: Response): Promise<void> {
    try {
      logger.info("Get chapters request");

      const chapters = await chapterService.getChapters();

      sendSuccess(res, chapters, 200);
    } catch (error) {
      logger.error("Error in getChapters controller", { error: String(error) });
      sendError(res, String(error), 500, "Failed to fetch chapters");
    }
  }

  /**
   * Get a single chapter by ID
   * GET /api/chapters/:id
   */
  async getChapterById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      logger.info("Get chapter by ID request", { chapterId: id });

      if (!id) {
        sendError(res, "Chapter ID is required", 400);
        return;
      }

      const chapter = await chapterService.getChapterById(id);

      if (!chapter) {
        sendError(res, "Chapter not found", 404, `Chapter with ID ${id} not found`);
        return;
      }

      sendSuccess(res, chapter, 200);
    } catch (error) {
      logger.error("Error in getChapterById controller", { error: String(error) });
      sendError(res, String(error), 500, "Failed to fetch chapter");
    }
  }

  /**
   * Get chapters by story ID
   * GET /api/chapters/story/:storyId
   */
  async getChaptersByStory(req: Request, res: Response): Promise<void> {
    try {
      const { storyId } = req.params;

      logger.info("Get chapters by story request", { storyId });

      if (!storyId) {
        sendError(res, "Story ID is required", 400);
        return;
      }

      const chapters = await chapterService.getChaptersByStory(storyId);

      sendSuccess(res, chapters, 200);
    } catch (error) {
      logger.error("Error in getChaptersByStory controller", {
        error: String(error),
      });
      sendError(res, String(error), 500, "Failed to fetch chapters");
    }
  }

  /**
   * Create a new chapter
   * POST /api/chapters
   */
  async createChapter(req: Request, res: Response): Promise<void> {
    try {
      const { storyId, title, content, imageUrl, audioUrl, order } = req.body;

      logger.info("Create chapter request", { title, storyId });

      // Validate required fields
      if (!storyId || storyId.trim() === "") {
        sendError(res, "Story ID is required", 400);
        return;
      }

      if (!title || title.trim() === "") {
        sendError(res, "Chapter title is required", 400);
        return;
      }

      if (!content || content.trim() === "") {
        sendError(res, "Chapter content is required", 400);
        return;
      }

      // Validate order if provided
      if (order !== undefined && order !== null) {
        if (typeof order !== "number" || order < 0) {
          sendError(res, "Order must be a non-negative number", 400);
          return;
        }
      }

      // Check if story exists
      const story = await prisma.story.findUnique({
        where: { id: storyId },
      });
      if (!story) {
        sendError(
          res,
          `Story with ID '${storyId}' not found`,
          404,
          "INVALID_STORY"
        );
        return;
      }

      // Check if order is already used in this story
      if (order !== undefined && order !== null) {
        const orderExists = await chapterService.isOrderUsedInStory(
          storyId,
          order
        );
        if (orderExists) {
          sendError(
            res,
            `Order ${order} is already used in this story`,
            409,
            "DUPLICATE_ORDER"
          );
          return;
        }
      }

      const chapter = await chapterService.createChapter({
        storyId: storyId.trim(),
        title: title.trim(),
        content: content.trim(),
        imageUrl: imageUrl?.trim() || null,
        audioUrl: audioUrl?.trim() || null,
        order: order ?? 0,
      });

      sendSuccess(res, chapter, 201);
    } catch (error) {
      logger.error("Error in createChapter controller", { error: String(error) });
      sendError(res, String(error), 500, "Failed to create chapter");
    }
  }

  /**
   * Update a chapter
   * PUT /api/chapters/:id
   */
  async updateChapter(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { title, content, imageUrl, audioUrl, order } = req.body;

      logger.info("Update chapter request", { chapterId: id });

      if (!id) {
        sendError(res, "Chapter ID is required", 400);
        return;
      }

      // Validate at least one field is provided
      if (
        title === undefined &&
        content === undefined &&
        imageUrl === undefined &&
        audioUrl === undefined &&
        order === undefined
      ) {
        sendError(
          res,
          "At least one field to update is required",
          400
        );
        return;
      }

      // Check if chapter exists
      const chapter = await chapterService.getChapterById(id);
      if (!chapter) {
        sendError(res, `Chapter with ID '${id}' not found`, 404);
        return;
      }

      const updateData: any = {};

      if (title !== undefined) {
        if (!title || title.trim() === "") {
          sendError(res, "Chapter title cannot be empty", 400);
          return;
        }
        updateData.title = title.trim();
      }

      if (content !== undefined) {
        if (!content || content.trim() === "") {
          sendError(res, "Chapter content cannot be empty", 400);
          return;
        }
        updateData.content = content.trim();
      }

      if (imageUrl !== undefined) {
        updateData.imageUrl = imageUrl?.trim() || null;
      }

      if (audioUrl !== undefined) {
        updateData.audioUrl = audioUrl?.trim() || null;
      }

      if (order !== undefined && order !== null) {
        if (typeof order !== "number" || order < 0) {
          sendError(res, "Order must be a non-negative number", 400);
          return;
        }

        // Check if new order is already used in this story
        const orderExists = await chapterService.isOrderUsedInStory(
          chapter.storyId,
          order,
          id
        );
        if (orderExists) {
          sendError(
            res,
            `Order ${order} is already used in this story`,
            409,
            "DUPLICATE_ORDER"
          );
          return;
        }

        updateData.order = order;
      }

      const updatedChapter = await chapterService.updateChapter(id, updateData);

      sendSuccess(res, updatedChapter, 200);
    } catch (error) {
      logger.error("Error in updateChapter controller", { error: String(error) });
      sendError(res, String(error), 500, "Failed to update chapter");
    }
  }

  /**
   * Delete a chapter
   * DELETE /api/chapters/:id
   */
  async deleteChapter(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      logger.info("Delete chapter request", { chapterId: id });

      if (!id) {
        sendError(res, "Chapter ID is required", 400);
        return;
      }

      const chapter = await chapterService.getChapterById(id);
      if (!chapter) {
        sendError(res, `Chapter with ID '${id}' not found`, 404);
        return;
      }

      const deletedChapter = await chapterService.deleteChapter(id);

      sendSuccess(
        res,
        {
          message: "Chapter deleted successfully",
          data: deletedChapter,
        },
        200
      );
    } catch (error) {
      logger.error("Error in deleteChapter controller", { error: String(error) });
      sendError(res, String(error), 500, "Failed to delete chapter");
    }
  }
}

export const chapterController = new ChapterController();
