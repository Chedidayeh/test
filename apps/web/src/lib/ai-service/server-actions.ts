
"use server";

/**
 * Server Actions for AI Service
 *
 * Wraps `ai-service` server-api calls for use in Server Components / Actions
 */

import { validateAnswer, LLMValidationResult, ValidateAnswerRequest } from "./server-api";

export interface ValidateAnswerActionResult {
  success: boolean;
  data?: LLMValidationResult;
  error?: string;
}

/**
 * Server action to validate a child's answer using LLM
 * Wraps the validateAnswer API call with error handling
 *
 * @param request - Answer validation request data
 * @returns Result object with success status and data/error
 *
 * @example
 * const result = await validateAnswerAction({
 *   storyId: "story-123",
 *   chapterId: "chapter-456",
 *   challengeAttemptId: "attempt-789",
 *   storyContent: "Once upon a time...",
 *   question: "What was the main character's name?",
 *   correctAnswers: ["Alice"],
 *   childAnswer: "alice",
 *   challengeType: "RIDDLE"
 * });
 * if (result.success) {
 *   console.log("Is correct:", result.data?.correct);
 *   console.log("Message:", result.data?.message);
 * }
 */
export async function validateAnswerAction(
  request: ValidateAnswerRequest,
): Promise<ValidateAnswerActionResult> {
  try {
    console.log("[AI Service] Validating answer via server action:", {
      challengeAttemptId: request.challengeAttemptId,
      challengeType: request.challengeType,
    });

    const result = await validateAnswer(request);

    if (!result) {
      console.warn("[AI Service] Answer validation returned null");
      return {
        success: false,
        error: "Failed to validate answer",
      };
    }

    console.log("[AI Service] Answer validation completed via server action:", {
      challengeAttemptId: request.challengeAttemptId,
      correct: result.correct,
      confidence: result.confidence,
    });

    return {
      success: true,
      data: result,
    };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error occurred";

    console.error("[AI Service] Error validating answer:", {
      challengeAttemptId: request.challengeAttemptId,
      error: errorMessage,
    });

    return {
      success: false,
      error: errorMessage,
    };
  }
}





