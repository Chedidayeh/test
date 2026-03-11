import { Request, Response } from "express";
import { WorldService } from "../services/world.service";
import { sendSuccess, sendError } from "../utils/response";
import { logger } from "../utils/logger";
import { PrismaClient } from "@prisma/client";
import { ApiResponse, World, TranslationSourceType, ManualTranslationEdit } from "@shared/src/types";

const prisma = new PrismaClient();
const worldService = new WorldService(prisma);

export class WorldController {
  /**
   * Get all worlds
   */
  async getWorlds(req: Request, res: Response<ApiResponse<World[]>>): Promise<void> {
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
   */
  async getWorldById(req: Request, res: Response<ApiResponse<World>>): Promise<void> {
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
   */
  async getWorldsByRoadmap(req: Request, res: Response<ApiResponse<World[]>>): Promise<void> {
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

  /**
   * Create a new world
   */
  async createWorld(req: Request, res: Response<ApiResponse<World>>): Promise<void> {
    try {
      const { roadmapId, name, description, imageUrl, order, translationSource, translations } = req.body;

      logger.info("Create world request", { name, roadmapId, translationSource });

      // Validate required fields
      if (!roadmapId || roadmapId.trim() === "") {
        sendError(res, "Roadmap ID is required", 400);
        return;
      }

      if (!name || name.trim() === "") {
        sendError(res, "World name is required", 400);
        return;
      }

      // Validate order if provided
      if (order !== undefined && order !== null) {
        if (typeof order !== "number" || order < 0) {
          sendError(res, "Order must be a positive number", 400);
          return;
        }
      }

      // Check if roadmap exists
      const roadmap = await prisma.roadmap.findUnique({
        where: { id: roadmapId },
      });
      if (!roadmap) {
        sendError(
          res,
          `Roadmap with ID '${roadmapId}' not found`,
          404,
          "INVALID_ROADMAP"
        );
        return;
      }

      // Check if order is already used in this roadmap
      if (order !== undefined && order !== null) {
        const orderExists = await worldService.isOrderUsedInRoadmap(
          roadmapId,
          order
        );
        if (orderExists) {
          sendError(
            res,
            `Order ${order} is already used in this roadmap`,
            409,
            "DUPLICATE_ORDER"
          );
          return;
        }
      }

      // Validate translation source if provided
      let validTranslationSource = translationSource;
      if (translationSource && !Object.values(TranslationSourceType).includes(translationSource)) {
        sendError(
          res,
          `Invalid translation source. Must be one of: ${Object.values(TranslationSourceType).join(", ")}`,
          400,
        );
        return;
      }

      // Validate translations array if provided
      let validTranslations: ManualTranslationEdit[] = [];
      if (translations && Array.isArray(translations)) {
        // Validate each translation has both name and description
        for (const translation of translations) {
          if (!translation.languageCode) {
            sendError(res, "Each translation must have a languageCode", 400);
            return;
          }
          if (!translation.name || translation.name.trim() === "") {
            sendError(res, "Each translation must have a non-empty name field", 400);
            return;
          }
          if (!translation.description || translation.description.trim() === "") {
            sendError(res, "Each translation must have a non-empty description field", 400);
            return;
          }
        }
        validTranslations = translations;
      }

      const world = await worldService.createWorld({
        roadmapId,
        name: name.trim(),
        description: description?.trim() || null,
        imageUrl: imageUrl?.trim() || null,
        order: order ?? 0,
        translationSource: validTranslationSource,
        translations: validTranslations,
      });

      sendSuccess(res, world, 201);
    } catch (error) {
      logger.error("Error in createWorld controller", { error: String(error) });
      sendError(res, String(error), 500, "Failed to create world");
    }
  }

  /**
   * Update a world
   */
  async updateWorld(req: Request, res: Response<ApiResponse<World>>): Promise<void> {
    try {
      const { id } = req.params;
      const { name, description, imageUrl, order, translationSource, translations } = req.body;

      logger.info("Update world request", { worldId: id, translationSource });

      if (!id) {
        sendError(res, "World ID is required", 400);
        return;
      }

      // Validate at least one field is provided
      if (
        name === undefined &&
        description === undefined &&
        imageUrl === undefined &&
        order === undefined &&
        !translationSource &&
        !translations
      ) {
        sendError(
          res,
          "At least one field to update is required",
          400
        );
        return;
      }

      // Check if world exists
      const world = await worldService.getWorldById(id);
      if (!world) {
        sendError(res, `World with ID '${id}' not found`, 404);
        return;
      }

      const updateData: any = {};

      if (name !== undefined) {
        if (!name || name.trim() === "") {
          sendError(res, "World name cannot be empty", 400);
          return;
        }
        updateData.name = name.trim();
      }

      if (description !== undefined) {
        updateData.description = description?.trim() || null;
      }

      if (imageUrl !== undefined) {
        updateData.imageUrl = imageUrl?.trim() || null;
      }

      if (order !== undefined && order !== null) {
        if (typeof order !== "number" || order < 0) {
          sendError(res, "Order must be a positive number", 400);
          return;
        }

        // Check if new order is already used in this roadmap
        const orderExists = await worldService.isOrderUsedInRoadmap(
          world.roadmapId,
          order,
          id
        );
        if (orderExists) {
          sendError(
            res,
            `Order ${order} is already used in this roadmap`,
            409,
            "DUPLICATE_ORDER"
          );
          return;
        }

        updateData.order = order;
      }

      // Validate translation source if provided
      let validTranslationSource = translationSource;
      if (translationSource && !Object.values(TranslationSourceType).includes(translationSource)) {
        sendError(
          res,
          `Invalid translation source. Must be one of: ${Object.values(TranslationSourceType).join(", ")}`,
          400,
        );
        return;
      }

      // Validate translations array if provided
      let validTranslations: ManualTranslationEdit[] = [];
      if (translations && Array.isArray(translations)) {
        // Validate each translation has both name and description
        for (const translation of translations) {
          if (!translation.languageCode) {
            sendError(res, "Each translation must have a languageCode", 400);
            return;
          }
          if (!translation.name || translation.name.trim() === "") {
            sendError(res, "Each translation must have a non-empty name field", 400);
            return;
          }
          if (!translation.description || translation.description.trim() === "") {
            sendError(res, "Each translation must have a non-empty description field", 400);
            return;
          }
        }
        validTranslations = translations;
      }

      const updatedWorld = await worldService.updateWorld(
        id,
        updateData,
        validTranslationSource,
        validTranslations,
      );

      sendSuccess(res, updatedWorld, 200);
    } catch (error) {
      logger.error("Error in updateWorld controller", { error: String(error) });
      sendError(res, String(error), 500, "Failed to update world");
    }
  }

  /**
   * Delete a world
   */
  async deleteWorld(req: Request, res: Response<ApiResponse<{ id: string }>>): Promise<void> {
    try {
      const { id } = req.params;

      logger.info("Delete world request", { worldId: id });

      if (!id) {
        sendError(res, "World ID is required", 400);
        return;
      }

      // Check if world exists
      const world = await worldService.getWorldById(id);
      if (!world) {
        sendError(res, `World with ID '${id}' not found`, 404);
        return;
      }

      const deletedWorld = await worldService.deleteWorld(id);

      sendSuccess(
        res,
        { id: deletedWorld.id },
        200
      );
    } catch (error) {
      logger.error("Error in deleteWorld controller", { error: String(error) });
      sendError(res, String(error), 500, "Failed to delete world");
    }
  }
}

export const worldController = new WorldController();
