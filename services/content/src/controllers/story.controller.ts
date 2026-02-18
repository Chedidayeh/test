import { Request, Response } from "express";
import { StoryService } from "../services/story.service";
import { sendSuccess, sendError, sendPaginated } from "../utils/response";
import { logger } from "../utils/logger";
import { PrismaClient } from "@prisma/client";
import { StoryQuery } from "../types";

const prisma = new PrismaClient();
const storyService = new StoryService(prisma);

export class StoryController {
  /**
   * Get all stories with pagination and filters
   * GET /api/stories?limit=20&offset=0&worldId=xxx&difficulty=3
   */
  async getStories(req: Request, res: Response): Promise<void> {
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
   * GET /api/stories/:id
   */
  async getStoryById(req: Request, res: Response): Promise<void> {
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
   * GET /api/stories/world/:worldId
   */
  async getStoriesByWorld(req: Request, res: Response): Promise<void> {
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
   * Get total stories count
   * GET /api/stories/count
   */
  async getStoriesCount(req: Request, res: Response): Promise<void> {
    try {
      logger.info("Get stories count request");

      const count = await storyService.countStories();

      sendSuccess(res, { count }, 200);
    } catch (error) {
      logger.error("Error in getStoriesCount controller", {
        error: String(error),
      });
      sendError(res, String(error), 500, "Failed to count stories");
    }
  }
}

export const storyController = new StoryController();
