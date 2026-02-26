import { Request, Response } from "express";
import { AnswerService } from "../services/answer.service";
import { sendSuccess, sendError } from "../utils/response";
import { logger } from "../utils/logger";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const answerService = new AnswerService(prisma);

export class AnswerController {
  /**
   * Get all answers
   * GET /api/answers
   */
  async getAnswers(req: Request, res: Response): Promise<void> {
    try {
      logger.info("Get answers request");

      const answers = await answerService.getAnswers();

      sendSuccess(res, answers, 200);
    } catch (error) {
      logger.error("Error in getAnswers controller", { error: String(error) });
      sendError(res, String(error), 500, "Failed to fetch answers");
    }
  }

  /**
   * Get a single answer by ID
   * GET /api/answers/:id
   */
  async getAnswerById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      logger.info("Get answer by ID request", { answerId: id });

      if (!id) {
        sendError(res, "Answer ID is required", 400);
        return;
      }

      const answer = await answerService.getAnswerById(id);

      if (!answer) {
        sendError(res, "Answer not found", 404, `Answer with ID ${id} not found`);
        return;
      }

      sendSuccess(res, answer, 200);
    } catch (error) {
      logger.error("Error in getAnswerById controller", { error: String(error) });
      sendError(res, String(error), 500, "Failed to fetch answer");
    }
  }

  /**
   * Get answers by challenge ID
   * GET /api/answers/challenge/:challengeId
   */
  async getAnswersByChallenge(req: Request, res: Response): Promise<void> {
    try {
      const { challengeId } = req.params;

      logger.info("Get answers by challenge request", { challengeId });

      if (!challengeId) {
        sendError(res, "Challenge ID is required", 400);
        return;
      }

      const answers = await answerService.getAnswersByChallenge(challengeId);

      sendSuccess(res, answers, 200);
    } catch (error) {
      logger.error("Error in getAnswersByChallenge controller", {
        error: String(error),
      });
      sendError(res, String(error), 500, "Failed to fetch answers");
    }
  }

  /**
   * Create a new answer
   * POST /api/answers
   */
  async createAnswer(req: Request, res: Response): Promise<void> {
    try {
      const { challengeId, text, isCorrect, order } = req.body;

      logger.info("Create answer request", { challengeId, text });

      // Validate required fields
      if (!challengeId || challengeId.trim() === "") {
        sendError(res, "Challenge ID is required", 400);
        return;
      }

      if (!text || text.trim() === "") {
        sendError(res, "Answer text is required", 400);
        return;
      }

      if (isCorrect === undefined || isCorrect === null) {
        sendError(res, "isCorrect is required", 400);
        return;
      }

      if (typeof isCorrect !== "boolean") {
        sendError(res, "isCorrect must be a boolean", 400);
        return;
      }

      // Validate order if provided
      if (order !== undefined && order !== null) {
        if (typeof order !== "number" || order < 0) {
          sendError(res, "Order must be a non-negative number", 400);
          return;
        }
      }

      // Check if challenge exists
      const challenge = await prisma.challenge.findUnique({
        where: { id: challengeId },
      });
      if (!challenge) {
        sendError(
          res,
          `Challenge with ID '${challengeId}' not found`,
          404,
          "INVALID_CHALLENGE"
        );
        return;
      }

      const answer = await answerService.createAnswer({
        challengeId: challengeId.trim(),
        text: text.trim(),
        isCorrect,
        order: order ?? null,
      });

      sendSuccess(res, answer, 201);
    } catch (error) {
      logger.error("Error in createAnswer controller", { error: String(error) });
      sendError(res, String(error), 500, "Failed to create answer");
    }
  }

  /**
   * Update an answer
   * PUT /api/answers/:id
   */
  async updateAnswer(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { text, isCorrect, order } = req.body;

      logger.info("Update answer request", { answerId: id });

      if (!id) {
        sendError(res, "Answer ID is required", 400);
        return;
      }

      // Validate at least one field is provided
      if (
        text === undefined &&
        isCorrect === undefined &&
        order === undefined
      ) {
        sendError(
          res,
          "At least one field to update is required",
          400
        );
        return;
      }

      // Check if answer exists
      const answer = await answerService.getAnswerById(id);
      if (!answer) {
        sendError(res, `Answer with ID '${id}' not found`, 404);
        return;
      }

      const updateData: any = {};

      if (text !== undefined) {
        if (!text || text.trim() === "") {
          sendError(res, "Answer text cannot be empty", 400);
          return;
        }
        updateData.text = text.trim();
      }

      if (isCorrect !== undefined && isCorrect !== null) {
        if (typeof isCorrect !== "boolean") {
          sendError(res, "isCorrect must be a boolean", 400);
          return;
        }
        updateData.isCorrect = isCorrect;
      }

      if (order !== undefined) {
        if (order !== null && (typeof order !== "number" || order < 0)) {
          sendError(res, "Order must be a non-negative number or null", 400);
          return;
        }
        updateData.order = order;
      }

      const updatedAnswer = await answerService.updateAnswer(id, updateData);

      sendSuccess(res, updatedAnswer, 200);
    } catch (error) {
      logger.error("Error in updateAnswer controller", { error: String(error) });
      sendError(res, String(error), 500, "Failed to update answer");
    }
  }

  /**
   * Delete an answer
   * DELETE /api/answers/:id
   */
  async deleteAnswer(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      logger.info("Delete answer request", { answerId: id });

      if (!id) {
        sendError(res, "Answer ID is required", 400);
        return;
      }

      const answer = await answerService.getAnswerById(id);
      if (!answer) {
        sendError(res, `Answer with ID '${id}' not found`, 404);
        return;
      }

      const deletedAnswer = await answerService.deleteAnswer(id);

      sendSuccess(
        res,
        {
          message: "Answer deleted successfully",
          data: deletedAnswer,
        },
        200
      );
    } catch (error) {
      logger.error("Error in deleteAnswer controller", { error: String(error) });
      sendError(res, String(error), 500, "Failed to delete answer");
    }
  }
}

export const answerController = new AnswerController();
