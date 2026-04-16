"use server";

import {
  ChildProfile,
  GameSession,
  SessionCheckpoint,
  ParentUser,
  ChallengeType,
} from "@readdly/shared-types";
import {
  getAllChildren,
  getChildById,
  getChildProfilesByParent,
  PaginationParams,
  saveCheckpoint,
  submitChallengeAnswer,
  completeStory,
  SubmitChallengeAnswerRequest,
  SubmitChallengeAnswerResponse,
  pauseGameSession,
  allocateRoadmapToChild,
  getParentWithProfiles,
  updateChildGeneralSettings,
  deleteChild,
  updateChildNotifications,
  toggleWeeklyReports,
  toggleStorytelling,
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

/**
 * Server Action for fetching a single child by ID
 * This can be called from client components to fetch a specific child's data
 *
 * @param childId - The ID of the child to fetch
 * @returns Result object with success status and child data
 *
 * @example
 * const result = await getChildByIdAction("child-123");
 * if (result) {
 *   console.log("Child:", result.name);
 * } else {
 *   console.error("Failed to fetch child");
 * }
 */
export async function getChildByIdAction(
  childId: string,
): Promise<ChildProfile | null> {
  try {
    console.log("[Progress Service] Fetching child by ID via server action", {
      childId,
    });

    const child = await getChildById(childId);

    console.log(
      "[Progress Service] Child fetched successfully via server action",
      {
        childId,
        childName: child?.name,
      },
    );

    return child;
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Failed to fetch child";

    console.error("[Progress Service] Error fetching child:", {
      childId,
      error: errorMessage,
    });

    return null;
  }
}

/**
 * Server Action for fetching child profiles by parent ID
 * This can be called from client components to fetch all children for a parent
 *
 * @param parentId - The parent ID to fetch children for
 * @returns Array of child profiles
 *
 * @example
 * const children = await getChildProfilesByParentAction("parent-123");
 * console.log("Children:", children);
 */
export async function getChildProfilesByParentAction(
  parentId: string,
): Promise<ChildProfile[]> {
  try {
    console.log(
      "[Progress Service] Fetching child profiles by parent via server action",
      {
        parentId,
      },
    );

    const childProfiles = await getChildProfilesByParent(parentId);

    console.log(
      "[Progress Service] Child profiles fetched successfully via server action",
      {
        parentId,
        childCount: childProfiles.length,
      },
    );

    return childProfiles;
  } catch (error) {
    const errorMessage =
      error instanceof Error
        ? error.message
        : "Failed to fetch child profiles";

    console.error("[Progress Service] Error fetching child profiles:", {
      parentId,
      error: errorMessage,
    });

    return [];
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
  elapsedTime: number, // New parameter to capture elapsed time on the page
): Promise<SaveCheckpointResult> {
  try {
    console.log("[Progress Service] Saving checkpoint via server action", {
      gameSessionId,
      chapterId,
      elapsedTime,
    });

    const updatedSession = await saveCheckpoint(
      gameSessionId,
      chapterId,
      elapsedTime,
    );

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

    // Step 2: Submit challenge answer to progress service
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
  elapsedTime: number,
): Promise<CompleteStoryResult> {
  try {
    console.log("[Progress Service] Completing story via server action", {
      gameSessionId,
      elapsedTime,
    });

    const updatedSession = await completeStory(gameSessionId, elapsedTime);
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

export interface UpdateNotificationSettingsResult {
  success: boolean;
  data?: ChildProfile;
  error?: string;
}

/**
 * Server action to update child's notification preferences
 * Called when user toggles notification settings in the dashboard modal
 *
 * @param childId - The child's ID
 * @param activateNotifications - Whether to activate or deactivate notifications
 * @returns Result object with success status and updated child data
 *
 * @example
 * const result = await updateNotificationSettingsAction("child-123", true);
 * if (result.success) {
 *   console.log("Notifications updated for:", result.data?.name);
 * } else {
 *   console.error("Failed to update:", result.error);
 * }
 */
export async function updateNotificationSettingsAction(
  childId: string,
  activateNotifications: boolean,
): Promise<UpdateNotificationSettingsResult> {
  try {
    console.log(
      "[Progress Service] Updating notification settings via server action",
      {
        childId,
        activateNotifications,
      },
    );

    const updatedChild = await updateChildNotifications(
      childId,
      activateNotifications,
    );

    console.log(
      "[Progress Service] Notification settings updated successfully",
      {
        childId,
        activateNotifications,
        childName: updatedChild.name,
      },
    );

    return {
      success: true,
      data: updatedChild,
    };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error occurred";

    console.error("[Progress Service] Error updating notification settings:", {
      childId,
      error: errorMessage,
    });

    return {
      success: false,
      error: errorMessage,
    };
  }
}

export interface UpdateChildGeneralSettingsResult {
  success: boolean;
  data?: ChildProfile;
  error?: string;
}

/**
 * Server action to update child's general settings
 * Called when user saves changes to child name, age group, or favorite themes
 *
 * @param childId - The child's ID
 * @param name - The child's updated name
 * @param ageGroupId - The child's updated age group ID
 * @param favoriteThemes - Array of favorite theme IDs
 * @returns Result object with success status and updated child data
 *
 * @example
 * const result = await updateChildGeneralSettingsAction("child-123", "John", "age-group-5", ["theme-1", "theme-2"]);
 * if (result.success) {
 *   console.log("General settings updated for:", result.data?.name);
 * } else {
 *   console.error("Failed to update:", result.error);
 * }
 */
export async function updateChildGeneralSettingsAction(
  childId: string,
  name: string,
  ageGroupId: string,
  favoriteThemes: string[],
  allocatedRoadmaps: string[],
  sessionsPerWeek: number,
  ageGroup: string,
): Promise<UpdateChildGeneralSettingsResult> {
  try {
    console.log(
      "[Progress Service] Updating child general settings via server action",
      {
        childId,
        name,
        ageGroupId,
        favoriteThemesCount: favoriteThemes.length,
      },
    );

    const updatedChild = await updateChildGeneralSettings(
      childId,
      name,
      ageGroupId,
      favoriteThemes,
      allocatedRoadmaps,
      sessionsPerWeek,
      ageGroup,
    );

    console.log(
      "[Progress Service] Child general settings updated successfully",
      {
        childId,
        name: updatedChild.name,
        ageGroupId: updatedChild.ageGroupId,
        favoriteThemesCount: updatedChild.favoriteThemes?.length || 0,
      },
    );

    return {
      success: true,
      data: updatedChild,
    };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error occurred";

    console.error("[Progress Service] Error updating child general settings:", {
      childId,
      error: errorMessage,
    });

    return {
      success: false,
      error: errorMessage,
    };
  }
}

export interface DeleteChildResult {
  success: boolean;
  error?: string;
}

/**
 * Server action to delete a child profile permanently
 * Called when parent confirms child deletion in settings modal
 * Removes the child and all associated data from the system
 *
 * @param childId - The child's ID to delete
 * @returns Result object with success status and optional error
 *
 * @example
 * const result = await deleteChildAction("child-123");
 * if (result.success) {
 *   console.log("Child deleted successfully");
 *   // Redirect or refresh
 * } else {
 *   console.error("Failed to delete:", result.error);
 * }
 */
export async function deleteChildAction(
  childId: string,
): Promise<DeleteChildResult> {
  try {
    console.log("[Progress Service] Deleting child via server action", {
      childId,
    });

    await deleteChild(childId);

    console.log("[Progress Service] Child deleted successfully", { childId });

    return {
      success: true,
    };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error occurred";

    console.error("[Progress Service] Error deleting child:", {
      childId,
      error: errorMessage,
    });

    return {
      success: false,
      error: errorMessage,
    };
  }
}

export interface ToggleWeeklyReportsResult {
  success: boolean;
  data?: ChildProfile;
  error?: string;
}

/**
 * Server action to toggle weekly reports activation for a child
 * Called when parent clicks activate/deactivate button in parent dashboard
 *
 * @param childId - The child's ID
 * @param isActive - Whether to activate or deactivate weekly reports
 * @returns Result object with success status and updated child data
 *
 * @example
 * const result = await toggleWeeklyReportsAction("child-123", true);
 * if (result.success) {
 *   console.log("Weekly reports toggled for:", result.data?.name);
 * } else {
 *   console.error("Failed to toggle:", result.error);
 * }
 */
export async function toggleWeeklyReportsAction(
  childId: string,
  isActive: boolean,
): Promise<ToggleWeeklyReportsResult> {
  try {
    console.log(
      "[Progress Service] Toggling weekly reports via server action",
      {
        childId,
        isActive,
      },
    );

    const updatedChild = await toggleWeeklyReports(childId, isActive);

    console.log("[Progress Service] Weekly reports toggled successfully", {
      childId,
      isActive,
      childName: updatedChild.name,
    });

    return {
      success: true,
      data: updatedChild,
    };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error occurred";

    console.error("[Progress Service] Error toggling weekly reports:", {
      childId,
      error: errorMessage,
    });

    return {
      success: false,
      error: errorMessage,
    };
  }
}

export interface ToggleStorytellingResult {
  success: boolean;
  data?: ChildProfile;
  error?: string;
}

/**
 * Server action to toggle storytelling activation for a child
 * Called when parent clicks activate/deactivate button for AI-generated storytelling
 *
 * @param childId - The child's ID
 * @param isActive - Whether to activate or deactivate storytelling
 * @returns Result object with success status and updated child data
 *
 * @example
 * const result = await toggleStorytellingAction("child-123", true);
 * if (result.success) {
 *   console.log("Storytelling toggled for:", result.data?.name);
 * } else {
 *   console.error("Failed to toggle:", result.error);
 * }
 */
export async function toggleStorytellingAction(
  childId: string,
  isActive: boolean,
): Promise<ToggleStorytellingResult> {
  try {
    console.log(
      "[Progress Service] Toggling storytelling via server action",
      {
        childId,
        isActive,
      },
    );

    const updatedChild = await toggleStorytelling(childId, isActive);

    console.log("[Progress Service] Storytelling toggled successfully", {
      childId,
      isActive,
      childName: updatedChild.name,
    });

    return {
      success: true,
      data: updatedChild,
    };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error occurred";

    console.error("[Progress Service] Error toggling storytelling:", {
      childId,
      error: errorMessage,
    });

    return {
      success: false,
      error: errorMessage,
    };
  }
}
