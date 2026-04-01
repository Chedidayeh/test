"use server";

import { ChildProfile, GameSession, SessionCheckpoint, ParentUser, ChallengeType } from "@readdly/shared-types";
import {
  getAllChildren,
  PaginationParams,
  saveCheckpoint,
  submitChallengeAnswer,
  completeStory,
  SubmitChallengeAnswerRequest,
  SubmitChallengeAnswerResponse,
  pauseGameSession,
  allocateRoadmapToChild,
  getParentWithProfiles,
} from "./server-api";
import { validateAnswerAction } from "../ai-service/server-actions";

type FetchChildrenResult =
  | {
      success: true;
      data: {
        children: ChildProfile[];
        pagination:
          | {
              total: number;
              page: number;
              pageSize: number;
              hasMore: boolean;
            }
          | undefined;
      };
    }
  | {
      success: false;
      error: string;
    };

/**
 * Server Action for fetching children with pagination
 * This can be called from client components to fetch data server-side
 */
export async function fetchChildrenAction(
  params?: PaginationParams,
): Promise<FetchChildrenResult> {
  try {
    const result = await getAllChildren(params);
    return {
      success: true,
      data: result,
    };
  } catch (error) {
    console.error("Server action error fetching children:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to fetch children",
    };
  }
}

export interface SaveCheckpointResult {
  success: boolean;
  data?: GameSession | null;
  error?: string;
}

/**
 * Server action to save a checkpoint for a game session
 * Wraps the saveCheckpoint API call with error handling
 *
 * @param gameSessionId - The game session ID
 * @param chapterId - The chapter ID to save as checkpoint
 * @returns Result object with success status and data/error
 *
 * @example
 * const result = await saveCheckpointAction("session-123", "chapter-456");
 * if (result.success) {
 *   console.log("Checkpoint saved:", result.data);
 * } else {
 *   console.error("Failed to save:", result.error);
 * }
 */
export async function saveCheckpointAction(
  gameSessionId: string,
  chapterId: string,
): Promise<SaveCheckpointResult> {
  try {
    console.log("[Progress Service] Saving checkpoint via server action", {
      gameSessionId,
      chapterId,
    });

    const updatedSession = await saveCheckpoint(gameSessionId, chapterId);

    return {
      success: true,
      data: updatedSession,
    };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error occurred";

    console.error("[Progress Service] Error saving checkpoint:", {
      gameSessionId,
      chapterId,
      error: errorMessage,
    });

    return {
      success: false,
      error: errorMessage,
    };
  }
}

export interface SubmitChallengeAnswerActionResult {
  success: boolean;
  data?: SubmitChallengeAnswerResponse;
  error?: string;
}

/**
 * Server action to submit a challenge answer
 * Wraps the submitChallengeAnswer API call with error handling
 * Records both the challenge attempt and star rewards
 *
 * @param request - Challenge answer submission data
 * @returns Result object with success status and data/error
 *
 * @example
 * const result = await submitChallengeAnswerAction({
 *   gameSessionId: "session-123",
 *   challengeId: "challenge-456",
 *   challengeType: "RIDDLE",
 *   answerId: "answer-789",
 *   isCorrect: true,
 *   elapsedTime: 45,
 *   attemptNumber: 1,
 *   usedHints: false,
 *   baseStars: 20
 * });
 * if (result.success) {
 *   console.log("Challenge submitted", result.data);
 *   console.log("Stars earned:", result.data?.totalStarsEarned);
 * }
 */
export async function submitChallengeAnswerAction(
  request: SubmitChallengeAnswerRequest,
): Promise<SubmitChallengeAnswerActionResult> {
  try {
    console.log(
      "[Progress Service] Submitting challenge answer via server action",
      {
        gameSessionId: request.gameSessionId,
        challengeId: request.challengeId,
        challengeType: request.challengeType,
        isCorrect: request.isCorrect,
        actions: request.actions,
      },
    );

    // Step 1: Call LLM validator for open-ended challenges (RIDDLE, CHOOSE_ENDING, MORAL_DECISION) if context is provided
    let llmValidationResult = undefined;
    const shouldValidateWithLLM =
      request.challengeType === ChallengeType.RIDDLE ||
      request.challengeType === ChallengeType.CHOOSE_ENDING ||
      request.challengeType === ChallengeType.MORAL_DECISION;

    if (
      shouldValidateWithLLM &&
      request.storyId &&
      request.chapterId &&
      request.storyContent &&
      request.question &&
      request.correctAnswers &&
      request.childAnswer
    ) {
      console.log(
        "[Progress Service] Calling LLM validator for challenge:",
        request.challengeId,
      );

      const validationStartTime = Date.now();
      const validationResult = await validateAnswerAction({
        storyId: request.storyId,
        chapterId: request.chapterId,
        challengeAttemptId: request.challengeId, // Use challengeId as a unique identifier temporarily
        storyContent: request.storyContent,
        question: request.question,
        correctAnswers: request.correctAnswers,
        childAnswer: request.childAnswer,
        challengeType: request.challengeType,
      });

      const validationTime = Date.now() - validationStartTime;
      console.log(
        "[Progress Service] LLM validation completed",
        {
          success: validationResult.success,
          validationTimeMs: validationTime,
          challengeId: request.challengeId,
        },
      );

      if (validationResult.success && validationResult.data) {
        llmValidationResult = validationResult.data;
        // Update isCorrect based on LLM validation for LLM-validated challenges
        request.isCorrect = llmValidationResult.correct;
        console.log("[Progress Service] Updated isCorrect from LLM result:", {
          challengeId: request.challengeId,
          isCorrect: request.isCorrect,
          confidence: llmValidationResult.confidence,
        });
      }
    } else {
      const skipReason = !shouldValidateWithLLM
        ? `Challenge type ${request.challengeType} does not require LLM validation`
        : "Missing required context for LLM validation";
      console.log("[Progress Service] Skipping LLM validation:", {
        challengeId: request.challengeId,
        reason: skipReason,
      });
    }

    // Step 2: Submit challenge answer to progress service
    const result = await submitChallengeAnswer(request);

    console.log(
      "[Progress Service] Challenge answer submitted successfully via server action",
      {
        challengeId: request.challengeId,
        totalStars: result.totalStarsEarned,
        hasLLMValidation: !!llmValidationResult,
      },
    );

    return {
      success: true,
      data: {
        ...result,
        llmValidation: llmValidationResult,
      },
    };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error occurred";

    console.error("[Progress Service] Error submitting challenge answer:", {
      gameSessionId: request.gameSessionId,
      challengeId: request.challengeId,
      error: errorMessage,
    });

    return {
      success: false,
      error: errorMessage,
    };
  }
}

export interface CompleteStoryResult {
  success: boolean;
  data?: GameSession | null;
  error?: string;
}

/**
 * Server action to complete a story for a game session
 * Wraps the completeStory API call with error handling
 * Marks the story as completed and triggers completion rewards
 *
 * @param gameSessionId - The game session ID
 * @returns Result object with success status and data/error
 *
 * @example
 * const result = await completeStoryAction("session-123");
 * if (result.success) {
 *   console.log("Story completed:", result.data);
 * } else {
 *   console.error("Failed to complete:", result.error);
 * }
 */
export async function completeStoryAction(
  gameSessionId: string,
): Promise<CompleteStoryResult> {
  try {
    console.log("[Progress Service] Completing story via server action", {
      gameSessionId,
    });

    const updatedSession = await completeStory(gameSessionId);
    if (!updatedSession) {
      return {
        success: false,
        error: "Failed to complete story: No session returned",
      };
    }
    return {
      success: true,
      data: updatedSession,
    };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error occurred";

    console.error("[Progress Service] Error completing story:", {
      gameSessionId,
      error: errorMessage,
    });

    return {
      success: false,
      error: errorMessage,
    };
  }
}



export interface AggregateSessionTimeResult {
  success: boolean;
  data?: GameSession;
  error?: string;
}

export interface PauseGameSessionResult {
  success: boolean;
  data?: SessionCheckpoint | null;
  error?: string;
}

/**
 * Server action to pause a game session
 * Called when user exits the story to save the current progress and pause state
 * Creates a checkpoint with the pause timestamp
 *
 * @param gameSessionId - The game session ID to pause
 * @returns Result object with success status and checkpoint data
 *
 * @example
 * const result = await pauseGameSessionAction("session-123");
 * if (result.success) {
 *   console.log("Game session paused:", result.data);
 * } else {
 *   console.error("Failed to pause:", result.error);
 * }
 */
export async function pauseGameSessionAction(
  gameSessionId: string,
): Promise<PauseGameSessionResult> {
  try {
    console.log("[Progress Service] Pausing game session via server action", {
      gameSessionId,
    });

    const result = await pauseGameSession(gameSessionId);

    return {
      success: true,
      data: result,
    };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error occurred";

    console.error("[Progress Service] Error pausing game session:", {
      gameSessionId,
      error: errorMessage,
    });

    return {
      success: false,
      error: errorMessage,
    };
  }
}

export interface AllocateRoadmapResult {
  success: boolean;
  data?: ChildProfile;
  error?: string;
}

/**
 * Server action to allocate a roadmap to a child
 * Adds a roadmap ID to the child's allocatedRoadmaps array
 *
 * @param childId - The child's ID
 * @param roadmapId - The roadmap ID to allocate
 * @returns Result object with success status and updated child data
 *
 * @example
 * const result = await allocateRoadmapToChildAction("child-123", "roadmap-456");
 * if (result.success) {
 *   console.log("Roadmap allocated to child:", result.data?.name);
 * } else {
 *   console.error("Failed to allocate:", result.error);
 * }
 */
export async function allocateRoadmapToChildAction(
  childId: string,
  roadmapId: string,
): Promise<AllocateRoadmapResult> {
  try {
    console.log("[Progress Service] Allocating roadmap via server action", {
      childId,
      roadmapId,
    });

    const updatedChild = await allocateRoadmapToChild(childId, roadmapId);

    console.log("[Progress Service] Roadmap allocated successfully", {
      childId,
      roadmapId,
      childName: updatedChild.name,
    });

    return {
      success: true,
      data: updatedChild,
    };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error occurred";

    console.error("[Progress Service] Error allocating roadmap:", {
      childId,
      roadmapId,
      error: errorMessage,
    });

    return {
      success: false,
      error: errorMessage,
    };
  }
}
export interface RefetchParentDataResult {
  success: boolean;
  data?: ParentUser | null;
  error?: string;
}

/**
 * Server action to refetch parent data with updated children list
 * Called after creating a new child to refresh the dashboard
 *
 * @param parentId - The parent's ID
 * @returns Result object with updated parent data including new child
 *
 * @example
 * const result = await refetchParentDataAction("parent-123");
 * if (result.success) {
 *   console.log("Updated children:", result.data?.children);
 * }
 */
export async function getParentWithProfilesAction(
  parentId: string,
): Promise<RefetchParentDataResult> {
  try {
    console.log("[Progress Service] Refetching parent data via server action", {
      parentId,
    });

    const parentData = await getParentWithProfiles(parentId);

    console.log("[Progress Service] Parent data refetched successfully", {
      parentId,
      childrenCount: parentData?.children?.length || 0,
    });

    return {
      success: true,
      data: parentData,
    };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error occurred";

    console.error("[Progress Service] Error refetching parent data:", {
      parentId,
      error: errorMessage,
    });

    return {
      success: false,
      error: errorMessage,
    };
  }
}