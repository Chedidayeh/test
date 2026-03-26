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
 * Fetch all analytics reports for a specific child
 * Calls the AI service through the gateway
 *
 * @param childId - ID of the child to fetch analytics for
 * @returns Array of analytics insights or empty array if fetch fails
 *
 * @example
 * const insights = await getChildAnalytics("child-123");
 * insights.forEach(insight => {
 *   console.log("Period:", insight.periodStart, "to", insight.periodEnd);
 *   console.log("Reading Level:", insight.readingLevel);
 *   console.log("Engagement Score:", insight.engagementScore);
 * });
 */
// export async function getChildAnalytics(
//   childId: string,
// ): Promise<AIProgressInsight[]> {
//   try {
//     console.log("[AI Service API] Fetching analytics for child:", { childId });

//     const response = await apiRequest<ApiResponse<AIProgressInsight[]>>(
//       `/analytics/${childId}`,
//       {
//         method: "GET",
//       },
//     );

//     if (isApiError(response)) {
//       console.warn(
//         "[AI Service API] Failed to fetch analytics:",
//         response.error.message,
//       );
//       return [];
//     }

//     if (!response.success) {
//       console.warn(
//         "[AI Service API] Failed to fetch analytics: API returned success=false",
//       );
//       return [];
//     }

//     console.log("[AI Service API] Analytics fetched successfully:", {
//       childId,
//       recordCount: response.data?.length || 0,
//     });

//     return response.data || [];
//   } catch (error) {
//     console.error(
//       "[AI Service API] Error fetching analytics:",
//       error instanceof Error ? error.message : String(error),
//     );
//     return [];
//   }
// }


