import { PrismaClient } from "@prisma/client";
import {
  llmValidateAnswer,
  LLMValidationResult as LLMResponse,
} from "../llm.service";
import { logger } from "../../../lib/logger";

const prisma = new PrismaClient();

export interface ValidateAnswerRequest {
  challengeId: string;
  question: string;
  correctAnswer: string;
  childAnswer: string;
  challengeType: string;
  baseLocale: string;
}

export async function validateAnswerAndSave(
  request: ValidateAnswerRequest,
): Promise<LLMResponse> {

  const previousAnswers = await prisma.lLMValidationResult.findMany({
    where: {
      challengeId: request.challengeId,
    },
    orderBy: {
      createdAt: "asc",
    },
  });

  // Call LLM to validate the answer with answer history and feedback
  const answerHistory = previousAnswers.map((a) => ({
    answer: a.childAnswer,
    message: a.message,
  }));

  const llmResult = await llmValidateAnswer(
    request.question,
    request.correctAnswer,
    request.childAnswer,
    request.challengeType,
    request.baseLocale,
    previousAnswers.length + 1,
    answerHistory,
  );

  // Save the validation result to the database
   await prisma.lLMValidationResult.create({
    data: {
      challengeId: request.challengeId,
      childAnswer: request.childAnswer,
      correctAnswer: request.correctAnswer,
      correct: llmResult.correct,
      confidence: llmResult.confidence,
      reason: llmResult.reason,
      message: llmResult.message,
      attemptNumber: previousAnswers.length + 1,
    },
  });

  logger.info(
    JSON.stringify({
      timestamp: new Date().toISOString(),
      level: "info",
      service: "ai-service",
      message: "Answer validation complete",
      metadata: {
        challengeId: request.challengeId,
        correct: llmResult.correct,
        confidence: llmResult.confidence,
      },
    }),
  );

  return llmResult;
}
