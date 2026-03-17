import { PrismaClient } from "@prisma/client";
import {
  llmValidateAnswer,
  LLMValidationResult as LLMResponse,
} from "../llm.service";
import { logger } from "../../../lib/logger";

const prisma = new PrismaClient();

export interface ValidateAnswerRequest {
  storyId: string;
  chapterId: string;
  challengeAttemptId: string;
  storyContent: string;
  question: string;
  correctAnswers: string[];
  childAnswer: string;
  challengeType: string;
}

export async function validateAnswerAndSave(
  request: ValidateAnswerRequest,
): Promise<LLMResponse> {

  const previousAnswers = await prisma.lLMValidationResult.findMany({
    where: {
      challengeAttemptId: request.challengeAttemptId,
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
    request.storyContent,
    request.question,
    request.correctAnswers,
    request.childAnswer,
    request.challengeType,
    answerHistory,
  );

  // Save the validation result to the database
   await prisma.lLMValidationResult.create({
    data: {
      storyId: request.storyId,
      chapterId: request.chapterId,
      challengeAttemptId: request.challengeAttemptId,
      childAnswer: request.childAnswer,
      correct: llmResult.correct,
      confidence: llmResult.confidence,
      reason: llmResult.reason,
      message: llmResult.message,
    },
  });

  logger.info(
    JSON.stringify({
      timestamp: new Date().toISOString(),
      level: "info",
      service: "ai-service",
      message: "Answer validation complete",
      metadata: {
        challengeAttemptId: request.challengeAttemptId,
        correct: llmResult.correct,
        confidence: llmResult.confidence,
      },
    }),
  );

  return llmResult;
}
