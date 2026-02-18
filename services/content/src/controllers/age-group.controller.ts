import { Request, Response } from "express";
import { AgeGroupService } from "../services/age-group.service";
import { sendSuccess, sendError } from "../utils/response";
import { logger } from "../utils/logger";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const ageGroupService = new AgeGroupService(prisma);

export class AgeGroupController {
  /**
   * Get all age groups
   * GET /api/age-groups
   */
  async getAgeGroups(req: Request, res: Response): Promise<void> {
    try {
      logger.info("Get age groups request");

      const ageGroups = await ageGroupService.getAgeGroups();

      sendSuccess(res, ageGroups, 200);
    } catch (error) {
      logger.error("Error in getAgeGroups controller", { error: String(error) });
      sendError(res, String(error), 500, "Failed to fetch age groups");
    }
  }

  /**
   * Get a single age group by ID
   * GET /api/age-groups/:id
   */
  async getAgeGroupById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      logger.info("Get age group by ID request", { ageGroupId: id });

      if (!id) {
        sendError(res, "Age group ID is required", 400);
        return;
      }

      const ageGroup = await ageGroupService.getAgeGroupById(id);

      if (!ageGroup) {
        sendError(res, "Age group not found", 404, `Age group with ID ${id} not found`);
        return;
      }

      sendSuccess(res, ageGroup, 200);
    } catch (error) {
      logger.error("Error in getAgeGroupById controller", {
        error: String(error),
      });
      sendError(res, String(error), 500, "Failed to fetch age group");
    }
  }
}

export const ageGroupController = new AgeGroupController();
