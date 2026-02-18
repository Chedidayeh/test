import { Request, Response } from "express";
import { RoadmapService } from "../services/roadmap.service";
import { sendSuccess, sendError } from "../utils/response";
import { logger } from "../utils/logger";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const roadmapService = new RoadmapService(prisma);

export class RoadmapController {
  /**
   * Get all roadmaps
   * GET /api/roadmaps
   */
  async getRoadmaps(req: Request, res: Response): Promise<void> {
    try {
      logger.info("Get roadmaps request");

      const roadmaps = await roadmapService.getRoadmaps();

      sendSuccess(res, roadmaps, 200);
    } catch (error) {
      logger.error("Error in getRoadmaps controller", { error: String(error) });
      sendError(res, String(error), 500, "Failed to fetch roadmaps");
    }
  }

  /**
   * Get a single roadmap by ID
   * GET /api/roadmaps/:id
   */
  async getRoadmapById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      logger.info("Get roadmap by ID request", { roadmapId: id });

      if (!id) {
        sendError(res, "Roadmap ID is required", 400);
        return;
      }

      const roadmap = await roadmapService.getRoadmapById(id);

      if (!roadmap) {
        sendError(res, "Roadmap not found", 404, `Roadmap with ID ${id} not found`);
        return;
      }

      sendSuccess(res, roadmap, 200);
    } catch (error) {
      logger.error("Error in getRoadmapById controller", { error: String(error) });
      sendError(res, String(error), 500, "Failed to fetch roadmap");
    }
  }

  /**
   * Get roadmaps by age group
   * GET /api/roadmaps/age-group/:ageGroupId
   */
  async getRoadmapsByAgeGroup(req: Request, res: Response): Promise<void> {
    try {
      const { ageGroupId } = req.params;

      logger.info("Get roadmaps by age group request", { ageGroupId });

      if (!ageGroupId) {
        sendError(res, "Age group ID is required", 400);
        return;
      }

      const roadmaps = await roadmapService.getRoadmapsByAgeGroup(ageGroupId);

      sendSuccess(res, roadmaps, 200);
    } catch (error) {
      logger.error("Error in getRoadmapsByAgeGroup controller", {
        error: String(error),
      });
      sendError(res, String(error), 500, "Failed to fetch roadmaps");
    }
  }
}

export const roadmapController = new RoadmapController();
