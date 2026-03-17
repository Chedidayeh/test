/**
 * AI Service Server API
 *
 * RSC (React Server Component) layer for frontend to communicate with AI Service
 * through the Gateway. All requests are authenticated via JWT from NextAuth session.
 *
 * Pattern follows progress-service/server-api.ts for consistency.
 */

import type { ApiResponse } from "@readdly/shared-types";
import { apiRequest, isApiError } from "../helpers";

/**
 * Request payload for validating a child's answer using LLM
 */
export interface ValidateAnswerRequest {
  storyId: string; // ID of the story
  chapterId: string; // ID of the chapter
  challengeAttemptId: string; // ID of the challenge attempt (from progress service)
  storyContent: string; // Full story/chapter text for context
  question: string; // The challenge question
  correctAnswers: string[]; // Array of correct answers
  childAnswer: string; // What the child answered
  challengeType: string; // Type of challenge (RIDDLE, MULTIPLE_CHOICE, etc.)
}

/**
 * Response from LLM validation
 */
export interface LLMValidationResult {
  correct: boolean; // Whether the answer is correct
  confidence: number; // Confidence score (0.0 - 1.0)
  reason: string; // Short explanation of validation
  message: string; // Child-friendly message to display
}

/**
 * Validate a child's answer using LLM
 * Calls the AI service through the gateway
 *
 * @param request - Answer validation request data
 * @returns LLM validation result or null if validation fails
 *
 * @example
 * const result = await validateAnswer({
 *   storyId: "story-123",
 *   chapterId: "chapter-456",
 *   challengeAttemptId: "attempt-789",
 *   storyContent: "Once upon a time...",
 *   question: "What was the main character's name?",
 *   correctAnswers: ["Alice", "alice"],
 *   childAnswer: "alice",
 *   challengeType: "RIDDLE"
 * });
 * if (result) {
 *   console.log("Is correct:", result.correct);
 *   console.log("Message:", result.message);
 * }
 */
export async function validateAnswer(
  request: ValidateAnswerRequest,
): Promise<LLMValidationResult | null> {
  try {
    console.log("[AI Service API] Validating answer via LLM:", {
      storyId: request.storyId,
      chapterId: request.chapterId,
      challengeAttemptId: request.challengeAttemptId,
      challengeType: request.challengeType,
    });

    const response = await apiRequest<ApiResponse<LLMValidationResult>>(
      `/validate-answer`,
      {
        method: "POST",
        body: JSON.stringify(request),
      },
    );

    if (isApiError(response)) {
      console.warn(
        "[AI Service API] Failed to validate answer:",
        response.error.message,
      );
      return null;
    }

    if (!response.success) {
      console.warn(
        "[AI Service API] Failed to validate answer: API returned success=false",
      );
      return null;
    }

    console.log(
      "[AI Service API] Answer validation completed successfully:",
      {
        challengeAttemptId: request.challengeAttemptId,
        correct: response.data?.correct,
        confidence: response.data?.confidence,
      },
    );

    return response.data || null;
  } catch (error) {
    console.error(
      "[AI Service API] Error validating answer:",
      error instanceof Error ? error.message : String(error),
    );
    return null;
  }
}


