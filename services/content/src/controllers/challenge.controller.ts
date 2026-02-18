import { Request, Response } from "express";
import { ChallengeService } from "../services/challenge.service";
import { sendSuccess, sendError, sendPaginated } from "../utils/response";
import { logger } from "../utils/logger";
import { PrismaClient } from "@prisma/client";
import { ChallengeQuery, ChallengeType } from "../types";

const prisma = new PrismaClient();
const challengeService = new ChallengeService(prisma);

export class ChallengeController {
  /**
   * Get challenges with pagination and filters
   * GET /api/challenges?limit=20&offset=0&chapterId=xxx&type=RIDDLE
   */
  async getChallenges(req: Request, res: Response): Promise<void> {
    try {
      const query: ChallengeQuery = {
        limit: req.query.limit ? parseInt(req.query.limit as string) : undefined,
        offset: req.query.offset ? parseInt(req.query.offset as string) : undefined,
        chapterId: req.query.chapterId as string,
        storyId: req.query.storyId as string,
        type: req.query.type as ChallengeType,
      };

      logger.info("Get challenges request", { query });

      const { challenges, total } = await challengeService.getChallenges(query);

      const limit = query.limit || 20;
      const offset = query.offset || 0;

      sendPaginated(res, challenges, total, limit, offset, 200);
    } catch (error) {
      logger.error("Error in getChallenges controller", { error: String(error) });
      sendError(res, String(error), 500, "Failed to fetch challenges");
    }
  }

  /**
   * Get a single challenge by ID
   * GET /api/challenges/:id
   */
  async getChallengeById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      logger.info("Get challenge by ID request", { challengeId: id });

      if (!id) {
        sendError(res, "Challenge ID is required", 400);
        return;
      }

      const challenge = await challengeService.getChallengeById(id);

      if (!challenge) {
        sendError(res, "Challenge not found", 404, `Challenge with ID ${id} not found`);
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
   * Get challenges by chapter
   * GET /api/challenges/chapter/:chapterId
   */
  async getChallengesByChapter(req: Request, res: Response): Promise<void> {
    try {
      const { chapterId } = req.params;

      logger.info("Get challenges by chapter request", { chapterId });

      if (!chapterId) {
        sendError(res, "Chapter ID is required", 400);
        return;
      }

      const challenges = await challengeService.getChallengesByChapter(chapterId);

      sendSuccess(res, challenges, 200);
    } catch (error) {
      logger.error("Error in getChallengesByChapter controller", {
        error: String(error),
      });
      sendError(res, String(error), 500, "Failed to fetch challenges");
    }
  }
}

export const challengeController = new ChallengeController();
