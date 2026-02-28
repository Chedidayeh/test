import { Request, Response } from "express";
import { StoryService } from "../services/story.service";
import { sendSuccess, sendError, sendPaginated } from "../utils/response";
import { logger } from "../utils/logger";
import { PrismaClient } from "@prisma/client";
import { StoryQuery } from "../types";
import {
  createStoryWithChaptersTransaction,
  editStoryWithChaptersTransaction,
  validateStoryCreationInput,
} from "../utils/transaction.helper";
import { ApiResponse, CreateStoryWithChaptersInput, Story } from "@shared/types";

const prisma = new PrismaClient();
const storyService = new StoryService(prisma);

export class StoryController {
  /**
   * Get all stories with pagination and filters
   */
  async getStories(req: Request, res: Response<ApiResponse<Story[]>>): Promise<void> {
    try {
      const query: StoryQuery = {
        limit: req.query.limit ? parseInt(req.query.limit as string) : undefined,
        offset: req.query.offset ? parseInt(req.query.offset as string) : undefined,
        worldId: req.query.worldId as string,
        difficulty: req.query.difficulty ? parseInt(req.query.difficulty as string) : undefined,
        isMandatory: req.query.isMandatory
          ? req.query.isMandatory === "true"
          : undefined,
      };

      logger.info("Get stories request", { query });

      const { stories, total } = await storyService.getStories(query);

      const limit = query.limit || 20;
      const offset = query.offset || 0;

      sendPaginated(res, stories, total, limit, offset, 200);
    } catch (error) {
      logger.error("Error in getStories controller", { error: String(error) });
      sendError(res, String(error), 500, "Failed to fetch stories");
    }
  }

  /**
   * Get a single story by ID with all details
   */
  async getStoryById(req: Request, res: Response<ApiResponse<Story>>): Promise<void> {
    try {
      const { id } = req.params;

      logger.info("Get story by ID request", { storyId: id });

      if (!id) {
        sendError(res, "Story ID is required", 400);
        return;
      }

      const story = await storyService.getStoryById(id);

      if (!story) {
        sendError(res, "Story not found", 404, `Story with ID ${id} not found`);
        return;
      }

      sendSuccess(res, story, 200);
    } catch (error) {
      logger.error("Error in getStoryById controller", { error: String(error) });
      sendError(res, String(error), 500, "Failed to fetch story");
    }
  }

  /**
   * Get stories by world ID
   */
  async getStoriesByWorld(req: Request, res: Response<ApiResponse<Story[]>>): Promise<void> {
    try {
      const { worldId } = req.params;

      logger.info("Get stories by world request", { worldId });

      if (!worldId) {
        sendError(res, "World ID is required", 400);
        return;
      }

      const stories = await storyService.getStoriesByWorld(worldId);

      sendSuccess(res, stories, 200);
    } catch (error) {
      logger.error("Error in getStoriesByWorld controller", {
        error: String(error),
      });
      sendError(res, String(error), 500, "Failed to fetch stories");
    }
  }


  /**
   * Create a story with chapters, challenges, and answers atomically
   * All nested data created together or entire transaction rolls back on error
   */
  async createStoryWithChapters(
    req: Request,
    res: Response<ApiResponse<Story>>
  ): Promise<void> {
    try {
      const input: CreateStoryWithChaptersInput = req.body;

      logger.info("Create story with chapters request", {
        title: input.title,
        worldId: input.worldId,
        chaptersCount: input.chapters?.length,
      });

      // Validate input
      try {
        validateStoryCreationInput(input);
      } catch (validationError) {
        sendError(
          res,
          validationError instanceof Error
            ? validationError.message
            : "Validation failed",
          400
        );
        return;
      }

      // Check if world exists
      const world = await prisma.world.findUnique({
        where: { id: input.worldId },
      });
      if (!world) {
        sendError(
          res,
          `World with ID '${input.worldId}' not found`,
          404,
          "INVALID_WORLD"
        );
        return;
      }

      // Check if story order is already used in this world
      const orderExists = await storyService.isOrderUsedInWorld(
        input.worldId,
        input.order
      );
      if (orderExists) {
        sendError(
          res,
          `Order ${input.order} is already used in this world`,
          409,
          "DUPLICATE_ORDER"
        );
        return;
      }

      // Execute atomic transaction
      const result = await createStoryWithChaptersTransaction(prisma, input);

      logger.info("Story with chapters created successfully", {
        storyId: result.id,
        chaptersCreated: result.chapters.length,
        challengesCreated: result.chapters.filter(c => c.challenge !== null).length,
        answersCreated: result.chapters.reduce((acc, chapter) => {
          return acc + (chapter.challenge?.answers.length || 0);
        }, 0),
      });

      sendSuccess(res, result, 201);
    } catch (error) {
      logger.error("Error in createStoryWithChapters controller", {
        error: String(error),
      });
      sendError(
        res,
        error instanceof Error ? error.message : String(error),
        500,
        "Failed to create story"
      );
    }
  }

  /**
   * Edit a story with chapters, challenges, and answers atomically
   * All nested data updated together or entire transaction rolls back on error
   */
  async editStoryWithChapters(
    req: Request,
    res: Response<ApiResponse<Story>>
  ): Promise<void> {
    try {
      const { id } = req.params;
      const input: CreateStoryWithChaptersInput = req.body;

      logger.info("Edit story with chapters request", {
        storyId: id,
        title: input.title,
        chaptersCount: input.chapters?.length,
      });

      // Validate story exists
      const story = await storyService.getStoryById(id);
      if (!story) {
        sendError(res, `Story with ID '${id}' not found`, 404);
        return;
      }

      // Validate input
      try {
        validateStoryCreationInput(input);
      } catch (validationError) {
        sendError(
          res,
          validationError instanceof Error ? validationError.message : "Validation failed",
          400
        );
        return;
      }

      // Execute atomic transaction for update
      const result = await editStoryWithChaptersTransaction(prisma, id, input);

      logger.info("Story with chapters edited successfully", {
        storyId: result.id,
        chaptersCount: result.chapters.length,
      });

      sendSuccess(res, result, 200);
    } catch (error) {
      logger.error("Error in editStoryWithChapters controller", {
        error: String(error),
      });
      sendError(
        res,
        error instanceof Error ? error.message : String(error),
        500,
        "Failed to edit story"
      );
    }
  }

  /**
   * Delete a story by ID
   */
  async deleteStory(req: Request, res: Response<ApiResponse<{id: string}>>): Promise<void> {
    try {
      const { id } = req.params;

      logger.info("Delete story request", { storyId: id });

      if (!id) {
        sendError(res, "Story ID is required", 400);
        return;
      }

      // Validate story exists
      const story = await storyService.getStoryById(id);
      if (!story) {
        sendError(res, `Story with ID '${id}' not found`, 404);
        return;
      }

      // Delete the story using service
      await storyService.deleteStory(id);

      logger.info("Story deleted successfully", { storyId: id });

      sendSuccess(res, { id }, 200);
    } catch (error) {
      logger.error("Error in deleteStory controller", { error: String(error) });
      sendError(
        res,
        error instanceof Error ? error.message : String(error),
        500,
        "Failed to delete story"
      );
    }
  }
}

export const storyController = new StoryController();
