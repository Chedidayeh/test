import { Request, Response } from "express";
import {
  validateAnswerAndSave,
  ValidateAnswerRequest,
} from "../services/validation.service";

export async function handleValidateAnswer(req: Request, res: Response) {
  try {
    const {
      storyId,
      chapterId,
      challengeAttemptId,
      storyContent,
      question,
      correctAnswers,
      childAnswer,
      challengeType,
    } = req.body;

    // Validate required fields
    if (
      !storyId ||
      !chapterId ||
      !challengeAttemptId ||
      !storyContent ||
      !question ||
      !correctAnswers ||
      !childAnswer ||
      !challengeType
    ) {
      return res.status(400).json({
        success: false,
        error: "Missing required fields",
        code: "INVALID_REQUEST",
      });
    }

    const validationRequest: ValidateAnswerRequest = {
      storyId,
      chapterId,
      challengeAttemptId,
      storyContent,
      question,
      correctAnswers,
      childAnswer,
      challengeType,
    };

    const result = await validateAnswerAndSave(validationRequest);

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error(
      JSON.stringify({
        timestamp: new Date().toISOString(),
        level: "error",
        service: "ai-service",
        message: "Answer validation failed",
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
      })
    );

    res.status(500).json({
      success: false,
      error: "Failed to validate answer",
      code: "VALIDATION_ERROR",
    });
  }
}
