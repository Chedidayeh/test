import { Request, Response } from "express";
import { WorldService } from "../services/world.service";
import { sendSuccess, sendError } from "../utils/response";
import { logger } from "../utils/logger";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const worldService = new WorldService(prisma);

export class WorldController {
  /**
   * Get all worlds
   * GET /api/worlds
   */
  async getWorlds(req: Request, res: Response): Promise<void> {
    try {
      logger.info("Get worlds request");

      const worlds = await worldService.getWorlds();

      sendSuccess(res, worlds, 200);
    } catch (error) {
      logger.error("Error in getWorlds controller", { error: String(error) });
      sendError(res, String(error), 500, "Failed to fetch worlds");
    }
  }

  /**
   * Get a single world by ID
   * GET /api/worlds/:id
   */
  async getWorldById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      logger.info("Get world by ID request", { worldId: id });

      if (!id) {
        sendError(res, "World ID is required", 400);
        return;
      }

      const world = await worldService.getWorldById(id);

      if (!world) {
        sendError(res, "World not found", 404, `World with ID ${id} not found`);
        return;
      }

      sendSuccess(res, world, 200);
    } catch (error) {
      logger.error("Error in getWorldById controller", { error: String(error) });
      sendError(res, String(error), 500, "Failed to fetch world");
    }
  }

  /**
   * Get worlds by roadmap
   * GET /api/worlds/roadmap/:roadmapId
   */
  async getWorldsByRoadmap(req: Request, res: Response): Promise<void> {
    try {
      const { roadmapId } = req.params;

      logger.info("Get worlds by roadmap request", { roadmapId });

      if (!roadmapId) {
        sendError(res, "Roadmap ID is required", 400);
        return;
      }

      const worlds = await worldService.getWorldsByRoadmap(roadmapId);

      sendSuccess(res, worlds, 200);
    } catch (error) {
      logger.error("Error in getWorldsByRoadmap controller", {
        error: String(error),
      });
      sendError(res, String(error), 500, "Failed to fetch worlds");
    }
  }
}

export const worldController = new WorldController();
