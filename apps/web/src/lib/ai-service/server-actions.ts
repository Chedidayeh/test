
"use server";

/**
 * Server Actions for AI Service
 *
 * Wraps `ai-service` server-api calls for use in Server Components / Actions
 */

import { validateAnswer, LLMValidationResult, ValidateAnswerRequest, generateStorytelling, GenerateStorytellingRequest, generateHints, GenerateHintsRequest, HintResponse } from "./server-api";

export interface ValidateAnswerActionResult {
  success: boolean;
  data?: LLMValidationResult;
  error?: string;
}

export interface GenerateHintsActionResult {
  success: boolean;
  data?: HintResponse;
  error?: string;
}

// export interface GetChildAnalyticsActionResult {
//   success: boolean;
//   data?: AIProgressInsight[];
//   error?: string;
// }

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

/**
 * Server action to generate personalized storytelling profile for a child
 * Wraps the generateStorytelling API call with error handling
 *
 * @param request - Storytelling generation request data
 * @returns Result object with success status and data/error
 *
 * @example
 * const result = await generateStorytellingAction({
 *   childProfileId: "child-123",
 *   name: "Alice",
 *   childLanguage: "en",
 *   favoriteThemes: ["Fantasy", "Adventure"],
 *   learningObjectives: ["Reading comprehension", "Vocabulary"]
 * });
 * if (result.success) {
 *   console.log("Profile created:", result.data?.storytellingProfile.id);
 *   console.log("Message:", result.data?.message);
 * }
 */
export async function generateStorytellingAction(
  request: GenerateStorytellingRequest,
) {
  try {
    console.log(
      "[AI Service] Generating storytelling profile via server action:",
      {
        childProfileId: request.childProfileId,
        name: request.name,
        childLanguage: request.childLanguage,
      },
    );

    const result = await generateStorytelling(request);

    if (!result) {
      console.warn("[AI Service] Storytelling generation returned null");
      return {
        success: false,
        error: "Failed to generate storytelling profile",
      };
    }

    console.log(
      "[AI Service] Storytelling profile generated via server action:",
      {
        childProfileId: request.childProfileId,
        storyProfileId: result.storytellingProfile.id,
      },
    );

    return {
      success: true,
      data: result,
    };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error occurred";

    console.error("[AI Service] Error generating storytelling:", {
      childProfileId: request.childProfileId,
      error: errorMessage,
    });

    return {
      success: false,
      error: errorMessage,
    };
  }
}

/**
 * Server action to generate hints for a challenge using LLM
 * Wraps the generateHints API call with error handling
 *
 * @param request - Hint generation request data
 * @returns Result object with success status and data/error
 *
 * @example
 * const result = await generateHintsAction({
 *   storyContent: "Once upon a time...",
 *   question: "What was the main character's name?",
 *   correctAnswers: ["Alice"],
 *   challengeType: "RIDDLE",
 *   difficultyLevel: 2.5,
 *   ageGroup: "6-8"
 * });
 * if (result.success) {
 *   console.log("Hints:", result.data?.hints);
 *   console.log("Log ID:", result.data?.hintGenerationLogId);
 * }
 */
export async function generateHintsAction(
  request: GenerateHintsRequest,
): Promise<GenerateHintsActionResult> {
  try {
    console.log("[AI Service] Generating hints via server action:", {
      challengeType: request.challengeType,
      difficultyLevel: request.difficultyLevel,
      ageGroup: request.ageGroup,
    });

    const result = await generateHints(request);

    if (!result) {
      console.warn("[AI Service] Hint generation returned null");
      return {
        success: false,
        error: "Failed to generate hints",
      };
    }

    console.log("[AI Service] Hints generated via server action:", {
      hintsCount: result.hints.length,
      logId: result.hintGenerationLogId,
    });

    return {
      success: true,
      data: result,
    };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error occurred";

    console.error("[AI Service] Error generating hints:", {
      challengeType: request.challengeType,
      error: errorMessage,
    });

    return {
      success: false,
      error: errorMessage,
    };
  }
}

/**
 * Server action to fetch analytics for a child
 * Wraps the getChildAnalytics API call with error handling
 *
 * @param childId - ID of the child to fetch analytics for
 * @returns Result object with success status and data/error
 *
 * @example
 * const result = await getChildAnalyticsAction("child-123");
 * if (result.success) {
 *   result.data?.forEach(insight => {
 *     console.log("Reading Level:", insight.readingLevel);
 *     console.log("Engagement Score:", insight.engagementScore);
 *   });
 * }
 */
// export async function getChildAnalyticsAction(
//   childId: string,
// ): Promise<GetChildAnalyticsActionResult> {
//   try {
//     console.log("[AI Service] Fetching analytics via server action:", {
//       childId,
//     });

//     const result = await getChildAnalytics(childId);

//     console.log("[AI Service] Analytics fetched via server action:", {
//       childId,
//       recordCount: result.length,
//     });

//     return {
//       success: true,
//       data: result,
//     };
//   } catch (error) {
//     const errorMessage =
//       error instanceof Error ? error.message : "Unknown error occurred";

//     console.error("[AI Service] Error fetching analytics:", {
//       childId,
//       error: errorMessage,
//     });

//     return {
//       success: false,
//       error: errorMessage,
//     };
//   }
// }





