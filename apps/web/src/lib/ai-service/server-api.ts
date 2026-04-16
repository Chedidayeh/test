/**
 * AI Service Server API
 *
 * RSC (React Server Component) layer for frontend to communicate with AI Service
 * through the Gateway. All requests are authenticated via JWT from NextAuth session.
 *
 * Pattern follows progress-service/server-api.ts for consistency.
 */

import type { ApiResponse, WeeklyAnalyticsReport } from "@readdly/shared-types";
import { apiRequest, isApiError } from "../helpers";

/**
 * Request payload for validating a child's answer using LLM
 */
export interface ValidateAnswerRequest {
  challengeId: string; // ID of the challenge (from content service)
  question: string; // The challenge question
  correctAnswer: string; // The correct answer
  childAnswer: string; // What the child answered
  challengeType: string; // Type of challenge (RIDDLE, MULTIPLE_CHOICE, etc.)
  baseLocale : string; // Base locale of the story (e.g., "en", "fr", "ar") for language-specific validation
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
 * Request payload for generating personalized storytelling for a child
 */
export interface GenerateStorytellingRequest {
  childProfileId: string; // ID of the child profile
  name: string; // Child's name
  childLanguage: string; // Child's preferred language code (en, fr, ar)
  favoriteThemes: string[]; // Array of favorite theme names
  learningObjectives: string[]; // Array of learning objectives
}

/**
 * Request payload for generating hints for a challenge
 */
export interface GenerateHintsRequest {
  storyContent: string; // Full story/chapter text for context
  question: string; // The challenge question
  answers: string[]; // Array of correct answers
  challengeType: string; // Type of challenge (RIDDLE, MULTIPLE_CHOICE, TRUE_FALSE, etc.)
  difficultyLevel?: number; // Story difficulty level (1.0-5.0), optional (default: 1.0)
  ageGroup?: string; // Age group of the child (e.g., "6-8", "9-12"), optional (default: "6-8")
}

/**
 * Response from hint generation
 */
export interface HintResponse {
  hints: string[]; // Array of generated hints (typically 3: general, medium, specific)
  hintGenerationLogId: string; // ID of the generation log record for audit trail
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
      challengeId: request.challengeId,
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
        challengeAttemptId: request.challengeId,
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

/**
 * Generate personalized storytelling profile for a child
 * Calls the gateway to save storytelling preferences and initiate story generation
 *
 * @param request - Storytelling generation request data
 * @returns Storytelling generation result or null if generation fails
 *
 * @example
 * const result = await generateStorytelling({
 *   childProfileId: "child-123",
 *   name: "Alice",
 *   childLanguage: "en",
 *   favoriteThemes: ["Fantasy", "Adventure"],
 *   learningObjectives: ["Reading comprehension", "Vocabulary"]
 * });
 * if (result) {
 *   console.log("Profile created:", result.storytellingProfile.id);
 *   console.log("Message:", result.message);
 * }
 */
export async function generateStorytelling(
  request: GenerateStorytellingRequest,
) {
  try {
    console.log("[AI Service API] Generating storytelling profile:", {
      childProfileId: request.childProfileId,
      name: request.name,
      childLanguage: request.childLanguage,
      favoriteThemesCount: request.favoriteThemes.length,
      objectivesCount: request.learningObjectives.length,
    });

    const response = await apiRequest(
      `/generate-storytelling`,
      {
        method: "POST",
        body: JSON.stringify(request),
      },
    );

    if (isApiError(response)) {
      console.warn(
        "[AI Service API] Failed to generate storytelling:",
        response.error.message,
      );
      return null;
    }

    if (!response.success) {
      console.warn(
        "[AI Service API] Failed to generate storytelling: API returned success=false",
      );
      return null;
    }

    console.log(
      "[AI Service API] Storytelling profile generated successfully:",
      {
        childProfileId: request.childProfileId,
        storyProfileId: response.data?.storytellingProfile.id,
      },
    );

    return response.data || null;
  } catch (error) {
    console.error(
      "[AI Service API] Error generating storytelling:",
      error instanceof Error ? error.message : String(error),
    );
    return null;
  }
}

/**
 * Generate hints for a challenge using LLM
 * Calls the AI service through the gateway to generate progressive hints
 *
 * @param request - Hint generation request data
 * @returns Hint response with generated hints or null if generation fails
 *
 * @example
 * const result = await generateHints({
 *   storyContent: "Once upon a time...",
 *   question: "What was the main character's name?",
 *   answers: ["", ""],
 *   challengeType: "RIDDLE",
 *   difficultyLevel: 2.5,
 *   ageGroup: "6-8"
 * });
 * if (result) {
 *   console.log("Hints:", result.hints);
 *   console.log("Log ID:", result.hintGenerationLogId);
 * }
 */
export async function generateHints(
  request: GenerateHintsRequest,
): Promise<HintResponse | null> {
  try {
    console.log("[AI Service API] Generating hints:", {
      challengeType: request.challengeType,
      difficultyLevel: request.difficultyLevel,
      ageGroup: request.ageGroup,
    });

    const response = await apiRequest<ApiResponse<HintResponse>>(
      `/generate-hints`,
      {
        method: "POST",
        body: JSON.stringify(request),
      },
    );

    if (isApiError(response)) {
      console.warn(
        "[AI Service API] Failed to generate hints:",
        response.error.message,
      );
      return null;
    }

    if (!response.success) {
      console.warn(
        "[AI Service API] Failed to generate hints: API returned success=false",
      );
      return null;
    }

    console.log("[AI Service API] Hints generated successfully:", {
      challengeType: request.challengeType,
      hintsCount: response.data?.hints.length || 0,
      logId: response.data?.hintGenerationLogId,
    });

    return response.data || null;
  } catch (error) {
    console.error(
      "[AI Service API] Error generating hints:",
      error instanceof Error ? error.message : String(error),
    );
    return null;
  }
}

/**
 * Fetch a specific week's analytics report for a child
 * Calls the gateway to retrieve the weekly report from AI service
 *
 * @param childId - The child's profile ID
 * @param week - The week number to retrieve (1-indexed)
 * @returns Weekly analytics report or null if retrieval fails
 *
 * @example
 * const report = await getWeeklyAnalyticsReport("child-123", 1);
 * if (report) {
 *   console.log("Summary:", report.executiveSummary);
 *   console.log("Success rate:", report.metricsSnapshot.successRate);
 *   console.log("Recommendations:", report.recommendations);
 * }
 */
export async function getWeeklyAnalyticsReport(
  childId: string,
  week: number,
): Promise<{ report: WeeklyAnalyticsReport | null; totalWeeks: number } | null> {
  try {
    console.log("[AI Service API] Fetching weekly analytics report:", {
      childId,
      week,
    });

    if (!childId || typeof childId !== "string") {
      console.warn("[AI Service API] Invalid childId provided");
      return null;
    }

    if (!Number.isInteger(week) || week < 1) {
      console.warn("[AI Service API] Invalid week number provided:", { week });
      return null;
    }

    const response = await apiRequest<
      ApiResponse<{ report: WeeklyAnalyticsReport | null; totalWeeks: number } | null>
    >(`/week-report/${childId}`, {
      method: "POST",
      body: JSON.stringify({ week }),
    });

    if (isApiError(response)) {
      console.warn(
        "[AI Service API] Failed to fetch weekly report:",
        response.error.message,
      );
      return null;
    }

    if (!response.success || !response.data) {
      console.warn(
        "[AI Service API] Failed to fetch weekly report: API returned success=false or data is null ",
      );
      return null;
    }

    console.log(
      "[AI Service API] Weekly analytics report retrieved successfully:",
      {
        childId,
        week,
      },
    );

    return response.data
  } catch (error) {
    console.error(
      "[AI Service API] Error fetching weekly report:",
      error instanceof Error ? error.message : String(error),
    );
    return null;
  }
}