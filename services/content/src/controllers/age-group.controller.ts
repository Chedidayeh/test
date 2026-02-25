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

  /**
   * Create a new age group
   * POST /api/age-groups
   */
  async createAgeGroup(req: Request, res: Response): Promise<void> {
    try {
      const { name, minAge, maxAge } = req.body;

      logger.info("Create age group request", { name });

      // Validate required fields
      if (!name || name.trim() === "") {
        sendError(res, "Age group name is required and cannot be empty", 400);
        return;
      }

      if (minAge === undefined || minAge === null) {
        sendError(res, "Minimum age is required", 400);
        return;
      }

      if (maxAge === undefined || maxAge === null) {
        sendError(res, "Maximum age is required", 400);
        return;
      }

      // Validate ages are positive integers
      const minAgeNum = Number(minAge);
      const maxAgeNum = Number(maxAge);

      if (!Number.isInteger(minAgeNum) || minAgeNum < 1) {
        sendError(res, "Minimum age must be a positive integer", 400);
        return;
      }

      if (!Number.isInteger(maxAgeNum) || maxAgeNum < 1) {
        sendError(res, "Maximum age must be a positive integer", 400);
        return;
      }

      if (maxAgeNum < minAgeNum) {
        sendError(res, "Maximum age must be greater than or equal to minimum age", 400);
        return;
      }

      // Check for duplicate name
      const existingAgeGroup = await ageGroupService.getAgeGroupByName(name.trim());
      if (existingAgeGroup) {
        sendError(
          res,
          `Age group name '${name}' already exists`,
          409,
          "DUPLICATE_NAME"
        );
        return;
      }

      const ageGroup = await ageGroupService.createAgeGroup({
        name: name.trim(),
        minAge: minAgeNum,
        maxAge: maxAgeNum,
      });

      sendSuccess(res, ageGroup, 201);
    } catch (error) {
      logger.error("Error in createAgeGroup controller", { error: String(error) });
      sendError(res, String(error), 500, "Failed to create age group");
    }
  }

  /**
   * Update an age group
   * PUT /api/age-groups/:id
   */
  async updateAgeGroup(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { name, minAge, maxAge } = req.body;

      logger.info("Update age group request", { ageGroupId: id });

      // Validate ID
      if (!id) {
        sendError(res, "Age group ID is required", 400);
        return;
      }

      // Validate at least one field is provided
      if (!name && minAge === undefined && maxAge === undefined) {
        sendError(res, "At least one field (name, minAge, maxAge) must be provided", 400);
        return;
      }

      // Check if age group exists
      const existingAgeGroup = await ageGroupService.getAgeGroupById(id);
      if (!existingAgeGroup) {
        sendError(res, "Age group not found", 404, `Age group with ID ${id} not found`);
        return;
      }

      // Build update data
      const updateData: any = {};
      
      if (name !== undefined) {
        if (name.trim() === "") {
          sendError(res, "Age group name cannot be empty", 400);
          return;
        }
        updateData.name = name.trim();

        // Check for duplicate name (if changing)
        if (name.trim() !== existingAgeGroup.name) {
          const duplicateAgeGroup = await ageGroupService.getAgeGroupByName(name.trim());
          if (duplicateAgeGroup) {
            sendError(
              res,
              `Age group name '${name}' already exists`,
              409,
              "DUPLICATE_NAME"
            );
            return;
          }
        }
      }

      if (minAge !== undefined && minAge !== null) {
        const minAgeNum = Number(minAge);
        if (!Number.isInteger(minAgeNum) || minAgeNum < 1) {
          sendError(res, "Minimum age must be a positive integer", 400);
          return;
        }
        updateData.minAge = minAgeNum;
      }

      if (maxAge !== undefined && maxAge !== null) {
        const maxAgeNum = Number(maxAge);
        if (!Number.isInteger(maxAgeNum) || maxAgeNum < 1) {
          sendError(res, "Maximum age must be a positive integer", 400);
          return;
        }
        updateData.maxAge = maxAgeNum;
      }

      // Validate age range if both are present
      const finalMinAge = updateData.minAge ?? existingAgeGroup.minAge;
      const finalMaxAge = updateData.maxAge ?? existingAgeGroup.maxAge;
      if (finalMaxAge < finalMinAge) {
        sendError(res, "Maximum age must be greater than or equal to minimum age", 400);
        return;
      }

      const updatedAgeGroup = await ageGroupService.updateAgeGroup(id, updateData);

      sendSuccess(res, updatedAgeGroup, 200);
    } catch (error) {
      logger.error("Error in updateAgeGroup controller", { error: String(error) });
      sendError(res, String(error), 500, "Failed to update age group");
    }
  }

  /**
   * Delete an age group
   * DELETE /api/age-groups/:id
   */
  async deleteAgeGroup(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      logger.info("Delete age group request", { ageGroupId: id });

      if (!id) {
        sendError(res, "Age group ID is required", 400);
        return;
      }

      // Check if age group exists
      const ageGroup = await ageGroupService.getAgeGroupById(id);
      if (!ageGroup) {
        sendError(res, "Age group not found", 404, `Age group with ID ${id} not found`);
        return;
      }

      const deletedAgeGroup = await ageGroupService.deleteAgeGroup(id);

      sendSuccess(
        res,
        {
          success: true,
          deletedId: deletedAgeGroup.id,
          name: deletedAgeGroup.name,
        },
        200
      );
    } catch (error) {
      logger.error("Error in deleteAgeGroup controller", { error: String(error) });
      sendError(res, String(error), 500, "Failed to delete age group");
    }
  }
}

export const ageGroupController = new AgeGroupController();
