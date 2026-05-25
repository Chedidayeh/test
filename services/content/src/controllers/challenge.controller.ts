import { Request, Response } from "express";
import { ChallengeService } from "../services/challenge.service";
import { sendSuccess, sendError } from "../utils/response";
import { logger } from "../utils/logger";
import { PrismaClient } from "@prisma/client";
import { ApiResponse, Challenge } from "@shared/src/types";

const prisma = new PrismaClient();
const challengeService = new ChallengeService(prisma);

export class ChallengeController {
  /**
   * Get a single challenge by ID
   */
  async getChallengeById(
    req: Request,
    res: Response<ApiResponse<Challenge>>,
  ): Promise<void> {
    try {
      const { id } = req.params;

      logger.info("Get challenge by ID request", { challengeId: id });

      if (!id) {
        sendError(res, "Challenge ID is required", 400);
        return;
      }

      const challenge = await challengeService.getChallengeById(id);

      if (!challenge) {
        sendError(
          res,
          "Challenge not found",
          404,
          `Challenge with ID ${id} not found`,
        );
        return;
      }

      sendSuccess(res, challenge, 200);
    } catch (error) {
      logger.error("Error in getChallengeById controller", {
        error: String(error),
      });
      sendError(res, String(error), 500, "Failed to fetch challenge");
    }
  }

  /**
   * Get multiple challenges by their IDs
   * Request body: { ids: ["id1", "id2", "id3"] }
   * Used for batch fetching challenge metadata with type information
   */
  async getChallengesByIdsBody(
    req: Request,
    res: Response<ApiResponse<Challenge[]>>,
  ): Promise<void> {
    try {
      const { ids } = req.body;

      logger.info("Get challenges by IDs (body) request", {
        idsCount: Array.isArray(ids) ? ids.length : 0,
      });

      if (!Array.isArray(ids) || ids.length === 0) {
        sendError(
          res,
          "IDs array is required in request body",
          400,
        );
        return;
      }

      // Filter out empty strings and validate all are strings
      const challengeIds = ids.filter(
        (id): id is string => typeof id === "string" && id.trim().length > 0,
      );

      if (challengeIds.length === 0) {
        sendError(res, "At least one valid challenge ID is required", 400);
        return;
      }

      const challenges = await challengeService.getChallengesByIds(challengeIds);

      logger.info("Challenges fetched successfully", {
        requestedCount: challengeIds.length,
        foundCount: challenges.length,
      });

      sendSuccess(res, challenges, 200);
    } catch (error) {
      logger.error("Error in getChallengesByIdsBody controller", {
        error: String(error),
      });
      sendError(res, String(error), 500, "Failed to fetch challenges");
    }
  }

  /**
   * Get challenges by chapter ID
   */
  async getChallengesByChapterId(
    req: Request,
    res: Response<ApiResponse<Challenge[]>>,
  ): Promise<void> {
    try {
      const { chapterId } = req.params;

      logger.info("Get challenges by chapter request", { chapterId });

      if (!chapterId) {
        sendError(res, "Chapter ID is required", 400);
        return;
      }

      const challenges = await challengeService.getChallengesByChapterId(
        chapterId,
      );

      sendSuccess(res, challenges, 200);
    } catch (error) {
      logger.error("Error in getChallengesByChapterId controller", {
        error: String(error),
      });
      sendError(res, String(error), 500, "Failed to fetch challenges");
    }
  }
}

export const challengeController = new ChallengeController();
