"use server";

import { ChildProfile, GameSession, SessionCheckpoint } from "@shared/types";
import {
  getAllChildren,
  PaginationParams,
  saveCheckpoint,
  submitChallengeAnswer,
  completeStory,
  SubmitChallengeAnswerRequest,
  SubmitChallengeAnswerResponse,
  pauseGameSession,
} from "./server-api";

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
      },
    );

    const result = await submitChallengeAnswer(request);

    console.log(
      "[Progress Service] Challenge answer submitted successfully via server action",
      {
        challengeId: request.challengeId,
        totalStars: result.totalStarsEarned,
      },
    );

    return {
      success: true,
      data: result,
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
