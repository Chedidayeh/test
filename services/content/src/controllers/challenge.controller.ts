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

  /**
   * Create a new challenge
   * POST /api/challenges
   */
  async createChallenge(req: Request, res: Response): Promise<void> {
    try {
      const { chapterId, type, question, description, baseStars, order, hints } =
        req.body;

      logger.info("Create challenge request", { chapterId, type });

      // Validate required fields
      if (!chapterId || chapterId.trim() === "") {
        sendError(res, "Chapter ID is required", 400);
        return;
      }

      if (!type || type.trim() === "") {
        sendError(res, "Challenge type is required", 400);
        return;
      }

      // Validate type is valid ChallengeType
      const validTypes = Object.values(ChallengeType);
      if (!validTypes.includes(type)) {
        sendError(
          res,
          `Invalid challenge type. Must be one of: ${validTypes.join(", ")}`,
          400
        );
        return;
      }

      if (!question || question.trim() === "") {
        sendError(res, "Challenge question is required", 400);
        return;
      }

      // Validate order if provided
      if (order !== undefined && order !== null) {
        if (typeof order !== "number" || order < 0) {
          sendError(res, "Order must be a non-negative number", 400);
          return;
        }
      }

      // Validate baseStars if provided
      if (baseStars !== undefined && baseStars !== null) {
        if (typeof baseStars !== "number" || baseStars < 0) {
          sendError(res, "Base stars must be a non-negative number", 400);
          return;
        }
      }

      // Validate hints is array if provided
      if (hints !== undefined && hints !== null) {
        if (!Array.isArray(hints)) {
          sendError(res, "Hints must be an array of strings", 400);
          return;
        }
        if (!hints.every((hint) => typeof hint === "string")) {
          sendError(res, "All hints must be strings", 400);
          return;
        }
      }

      // Check if chapter exists
      const chapter = await prisma.chapter.findUnique({
        where: { id: chapterId },
      });
      if (!chapter) {
        sendError(
          res,
          `Chapter with ID '${chapterId}' not found`,
          404,
          "INVALID_CHAPTER"
        );
        return;
      }

      // Check if challenge already exists for this chapter (unique constraint)
      const existingChallenge = await prisma.challenge.findUnique({
        where: { chapterId },
      });
      if (existingChallenge) {
        sendError(
          res,
          "A challenge already exists for this chapter. Update it instead.",
          409,
          "CHALLENGE_EXISTS"
        );
        return;
      }

      const challenge = await challengeService.createChallenge({
        chapterId: chapterId.trim(),
        type,
        question: question.trim(),
        description: description?.trim() || null,
        baseStars: baseStars ?? 20,
        order: order ?? 0,
        hints: hints || [],
      });

      sendSuccess(res, challenge, 201);
    } catch (error) {
      logger.error("Error in createChallenge controller", {
        error: String(error),
      });
      sendError(res, String(error), 500, "Failed to create challenge");
    }
  }

  /**
   * Update a challenge
   * PUT /api/challenges/:id
   */
  async updateChallenge(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { type, question, description, baseStars, order, hints } = req.body;

      logger.info("Update challenge request", { challengeId: id });

      if (!id) {
        sendError(res, "Challenge ID is required", 400);
        return;
      }

      // Validate at least one field is provided
      if (
        type === undefined &&
        question === undefined &&
        description === undefined &&
        baseStars === undefined &&
        order === undefined &&
        hints === undefined
      ) {
        sendError(
          res,
          "At least one field to update is required",
          400
        );
        return;
      }

      // Check if challenge exists
      const challenge = await challengeService.getChallengeById(id);
      if (!challenge) {
        sendError(res, `Challenge with ID '${id}' not found`, 404);
        return;
      }

      const updateData: any = {};

      if (type !== undefined) {
        if (!type || type.trim() === "") {
          sendError(res, "Challenge type cannot be empty", 400);
          return;
        }
        // Validate type is valid ChallengeType
        const validTypes = Object.values(ChallengeType);
        if (!validTypes.includes(type)) {
          sendError(
            res,
            `Invalid challenge type. Must be one of: ${validTypes.join(", ")}`,
            400
          );
          return;
        }
        updateData.type = type;
      }

      if (question !== undefined) {
        if (!question || question.trim() === "") {
          sendError(res, "Challenge question cannot be empty", 400);
          return;
        }
        updateData.question = question.trim();
      }

      if (description !== undefined) {
        updateData.description = description?.trim() || null;
      }

      if (baseStars !== undefined && baseStars !== null) {
        if (typeof baseStars !== "number" || baseStars < 0) {
          sendError(res, "Base stars must be a non-negative number", 400);
          return;
        }
        updateData.baseStars = baseStars;
      }

      if (order !== undefined && order !== null) {
        if (typeof order !== "number" || order < 0) {
          sendError(res, "Order must be a non-negative number", 400);
          return;
        }
        updateData.order = order;
      }

      if (hints !== undefined) {
        if (!Array.isArray(hints)) {
          sendError(res, "Hints must be an array of strings", 400);
          return;
        }
        if (!hints.every((hint) => typeof hint === "string")) {
          sendError(res, "All hints must be strings", 400);
          return;
        }
        updateData.hints = hints;
      }

      const updatedChallenge = await challengeService.updateChallenge(
        id,
        updateData
      );

      sendSuccess(res, updatedChallenge, 200);
    } catch (error) {
      logger.error("Error in updateChallenge controller", {
        error: String(error),
      });
      sendError(res, String(error), 500, "Failed to update challenge");
    }
  }
}

export const challengeController = new ChallengeController();
