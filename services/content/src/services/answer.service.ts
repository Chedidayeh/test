import { PrismaClient } from "@prisma/client";
import { logger } from "../utils/logger";
import type { Answer } from "../types";

export class AnswerService {
  private prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  /**
   * Get all answers
   */
  async getAnswers(): Promise<Answer[]> {
    try {
      const answers = await this.prisma.answer.findMany({
        orderBy: { order: "asc" },
      });

      logger.info("Answers retrieved successfully", { count: answers.length });
      return answers as Answer[];
    } catch (error) {
      logger.error("Error fetching answers", { error: String(error) });
      throw error;
    }
  }

  /**
   * Get a single answer by ID
   */
  async getAnswerById(answerId: string): Promise<Answer | null> {
    try {
      const answer = await this.prisma.answer.findUnique({
        where: { id: answerId },
      });

      if (!answer) {
        logger.warn("Answer not found", { answerId });
        return null;
      }

      logger.info("Answer retrieved successfully", { answerId });
      return answer as Answer;
    } catch (error) {
      logger.error("Error fetching answer", { answerId, error: String(error) });
      throw error;
    }
  }

  /**
   * Get answers by challenge ID
   */
  async getAnswersByChallenge(challengeId: string): Promise<Answer[]> {
    try {
      const answers = await this.prisma.answer.findMany({
        where: { challengeId },
        orderBy: { order: "asc" },
      });

      logger.info("Answers for challenge retrieved", {
        challengeId,
        count: answers.length,
      });

      return answers as Answer[];
    } catch (error) {
      logger.error("Error fetching answers by challenge", {
        challengeId,
        error: String(error),
      });
      throw error;
    }
  }

  /**
   * Create a new answer
   */
  async createAnswer(data: {
    challengeId: string;
    text: string;
    isCorrect: boolean;
    order?: number | null;
  }): Promise<Answer> {
    try {
      logger.info("Creating answer", {
        challengeId: data.challengeId,
        text: data.text,
        order: data.order,
      });

      const answer = await this.prisma.answer.create({
        data,
      });

      logger.info("Answer created successfully", {
        answerId: answer.id,
        challengeId: data.challengeId,
      });

      return answer as Answer;
    } catch (error) {
      logger.error("Error creating answer", {
        data,
        error: String(error),
      });
      throw error;
    }
  }

  /**
   * Update an existing answer
   */
  async updateAnswer(
    answerId: string,
    data: Partial<{
      text: string;
      isCorrect: boolean;
      order: number | null;
    }>
  ): Promise<Answer> {
    try {
      logger.info("Updating answer", { answerId });

      const answer = await this.prisma.answer.update({
        where: { id: answerId },
        data,
      });

      logger.info("Answer updated successfully", { answerId });
      return answer as Answer;
    } catch (error) {
      logger.error("Error updating answer", {
        answerId,
        error: String(error),
      });
      throw error;
    }
  }

  /**
   * Delete an answer
   */
  async deleteAnswer(answerId: string): Promise<Answer> {
    try {
      logger.info("Deleting answer", { answerId });

      const answer = await this.prisma.answer.delete({
        where: { id: answerId },
      });

      logger.info("Answer deleted successfully", {
        answerId,
        text: answer.text,
        challengeId: answer.challengeId,
      });

      return answer as Answer;
    } catch (error) {
      logger.error("Error deleting answer", {
        answerId,
        error: String(error),
      });
      throw error;
    }
  }
}
