/**
 * Gateway Service Server API
 *
 * RSC (React Server Component) layer for frontend to communicate with Gateway.
 * All requests are authenticated via JWT from NextAuth session.
 *
 * The gateway orchestrates requests to multiple microservices:
 * - Auth Service (Children & User data)
 * - Progress Service (Child progress & stats)
 * - Content Service (Stories & challenges)
 *
 * Pattern follows auth-service/server-api.ts for consistency.
 */

import type {
  ApiResponse,
  ChildProfile,
  ChallengeType,
  GameSession,
  ParentUser,
  Progress,
  ChallengeAttempt,
  StarEvent,
  ChallengeStatus,
  SessionCheckpoint,
  AdminDashboardStats,
} from "@readdly/shared-types";
import { apiRequest, buildQueryString, isApiError } from "../helpers";

export interface PaginationParams {
  limit?: number;
  offset?: number;
}

/**
 * Request payload for submitting a challenge answer
 * Includes all data needed to create ChallengeAttempt and StarEvent
 */
export interface SubmitChallengeAnswerRequest {
  gameSessionId: string;
  challengeId: string;
  challengeType: ChallengeType;

  // Answer data
  answerId?: string; // For multiple choice
  textAnswer?: string; // For text input
  isCorrect: boolean; // Whether the answer was correct

  // Attempt data
  elapsedTime: number; // seconds spent on this challenge
  attemptNumber: number; // Which attempt is this (1st, 2nd, etc)
  usedHints: number; // Number of hints used (0 = no hints, 1 = 1 hint, etc.)
  maxAttempts?: number; // Max allowed attempts for this challenge
  skipped?: boolean; // Whether the challenge was skipped
  status: ChallengeStatus; // The status of the challenge attempt

  // Challenge metadata for star calculation
  baseStars: number; // Base stars for this challenge

  // attemt actions:
  actions: {
    selectedAnswerId?: string; // If action is ANSWER_SUBMITTED
    selectedAnswerText?: string; // Capture the full text of the answer they selected
    answerText?: string; // For open-ended questions, capture the text they entered
    attemptNumberAtAction: number; // Which attempt number they were on
    isCorrect?: boolean; // Whether the submitted answer was correct (for ANSWER_SUBMITTED)
  }[];
}

/**
 * Response from challenge answer submission
 * Contains both the attempt record and star event
 */
export interface SubmitChallengeAnswerResponse {
  success: boolean;
  attempt?: ChallengeAttempt;
  starEvent?: StarEvent;
  totalStarsEarned?: number;
  // Optional LLM validation result for open-ended challenges
  llmValidation?: {
    correct: boolean;
    confidence: number;
    reason: string;
    message: string;
  };
  error?: string;
}

/**
 * Fetch all children for admin dashboard
 * Combines data from Auth Service (child profiles) and Progress Service (stats)
 *
 * @param params - Pagination parameters (limit, offset)
 * @returns Children data with progress information
 *
 * @example
 * const { children, pagination } = await getAllChildren({ limit: 10, offset: 0 });
 */
export async function getAllChildren(params?: PaginationParams) {
  const queryString = buildQueryString(params || {});
  console.log(
    "[Progress Service API] Fetching all children with params:",
    params,
  );

  const response = await apiRequest<ApiResponse<ChildProfile[]>>(
    `/children${queryString}`,
  );

  if (isApiError(response)) {
    console.warn(
      "[Progress Service API] Failed to fetch children:",
      response.error.message,
    );
    return {
      children: [],
      pagination: undefined,
    };
  }

  console.log(
    "[Progress Service API] Received response for progress service:",
    {
      success: response.success,
      dataLength: response.data?.length,
      pagination: response.pagination,
    },
  );

  if (!response.success) {
    console.warn(
      "[Progress Service API] Failed to fetch children: API returned success=false",
    );
    return {
      children: [],
      pagination: undefined,
    };
  }

  return {
    children: response.data || [],
    pagination: response.pagination
      ? {
          total: response.pagination.total,
          page: response.pagination.page,
          pageSize: response.pagination.pageSize,
          hasMore: response.pagination.hasMore,
        }
      : undefined,
  };
}

export async function getAllChildrenProfiles() {
  console.log(
    "[Progress Service API] Fetching all children profiles:",
  );

  const response = await apiRequest<ApiResponse<ChildProfile[]>>(
    `/children-profiles`,
  );

  if (isApiError(response)) {
    console.warn(
      "[Progress Service API] Failed to fetch children profiles:",
      response.error.message,
    );
    return {
      children: [],
      pagination: undefined,
    };
  }

  console.log(
    "[Progress Service API] Received response for progress service:",
    {
      success: response.success,
      dataLength: response.data?.length,
      pagination: response.pagination,
    },
  );

  if (!response.success) {
    console.warn(
      "[Progress Service API] Failed to fetch children: API returned success=false",
    );
    return {
      children: [],
      pagination: undefined,
    };
  }

  return {
    children: response.data || [],
    pagination: response.pagination
      ? {
          total: response.pagination.total,
          page: response.pagination.page,
          pageSize: response.pagination.pageSize,
          hasMore: response.pagination.hasMore,
        }
      : undefined,
  };
}

/**
 * Fetch a single child by ID
 * Combines data from Auth Service (child profile) and Progress Service (stats)
 *
 * @param childId - The child ID to fetch
 * @returns Child data with progress information
 *
 * @example
 * const child = await getChildById("child-123");
 */
export async function getChildById(childId: string) {
  console.log("[Progress Service API] Fetching child by ID:", childId);

  const response = await apiRequest<ApiResponse<ChildProfile>>(
    `/children/${childId}`,
  );

  if (isApiError(response)) {
    console.warn(
      "[Progress Service API] Failed to fetch child:",
      response.error.message,
    );
    return null;
  }

  if (!response.success) {
    console.warn(
      "[Progress Service API] Failed to fetch child: API returned success=false",
    );
    return null;
  }

  return response.data || null;
}

/**
 * Fetch progress for a specific child and story
 *
 * @param childId - The child ID
 * @param storyId - The story ID
 * @returns Progress data for the story or null if not started
 *
 * @example
 * const progress = await getChildProgress("child-123", "story-001");
 */
export async function getChildProgress(childId: string, storyId: string) {
  console.log("[Progress Service API] Fetching child progress:", {
    childId,
    storyId,
  });

  const response = await apiRequest<ApiResponse<Progress>>(
    `/progress/${childId}/stories/${storyId}`,
  );

  if (isApiError(response)) {
    console.warn(
      "[Progress Service API] Failed to fetch progress:",
      response.error.message,
    );
    return null;
  }

  if (!response.success) {
    console.warn(
      "[Progress Service API] Failed to fetch progress: API returned success=false",
    );
    return null;
  }

  return response.data || null;
}

/**
 * Fetch parent with matched child profiles
 * Orchestrates Auth Service (parent + children) and Progress Service (profiles)
 *
 * @param parentId - The parent ID to fetch
 * @returns Parent data with matched child profiles
 *
 * @example
 * const parentData = await getParentWithProfiles("parent-123");
 */
export async function getParentWithProfiles(parentId: string) {
  console.log(
    "[Progress Service API] Fetching parent with profiles:",
    parentId,
  );

  const response = await apiRequest<ApiResponse<ParentUser>>(
    `/parent-data/${parentId}`,
  );

  if (isApiError(response)) {
    console.warn(
      "[Progress Service API] Failed to fetch parent with profiles:",
      response.error.message,
    );
    return null;
  }

  if (!response.success) {
    console.warn(
      "[Progress Service API] Failed to fetch parent with profiles: API returned success=false",
    );
    return null;
  }

  return response.data || null;
}

/**
 * Get all child profiles for a parent
 * Fetches the list of child profiles associated with a parent account
 *
 * @param parentId - The parent ID
 * @returns Array of child profiles
 *
 * @example
 * const childProfiles = await getChildProfilesByParent("parent-123");
 * console.log("Children:", childProfiles); // [{ id: "child-1", name: "Child 1" }, { id: "child-2", name: "Child 2" }]
 */
export async function getChildProfilesByParent(
  parentId: string,
): Promise<ChildProfile[]> {
  console.log(
    "[Progress Service API] Fetching child profiles for parent:",
    parentId,
  );

  const response = await apiRequest<ApiResponse<ChildProfile[]>>(
    `/parent-data/${parentId}/children`,
  );

  if (isApiError(response)) {
    console.warn(
      "[Progress Service API] Failed to fetch child profiles:",
      response.error.message,
    );
    return [];
  }

  if (!response.success) {
    console.warn(
      "[Progress Service API] Failed to fetch child profiles: API returned success=false",
    );
    return [];
  }

  console.log("[Progress Service API] Child profiles fetched successfully", {
    parentId,
    childCount: response.data?.length || 0,
  });

  return response.data || [];
}

/**
 * Start a new story for a child
 * Saves a new progress record for the child profile with initial game session
 * Initializes progress at page 1 (chapter 1)
 *
 * @param childId - The child ID
 * @param storyId - The story ID to start
 * @returns Progress record for the started story
 *
 * @example
 * const progress = await startStory("child-123", "story-001");
 */
export async function startStory(childId: string, storyId: string) {
  console.log("[Progress Service API] Starting new story:", {
    childId,
    storyId,
  });

  const response = await apiRequest<ApiResponse<Progress | null>>(
    `/progress/${childId}/stories/${storyId}/start`,
    {
      method: "POST",
      body: JSON.stringify({
        startPage: 1,
      }),
    },
  );

  if (isApiError(response)) {
    console.warn(
      "[Progress Service API] Failed to start story:",
      response.error.message,
    );
    return null;
  }

  if (!response.success) {
    console.warn(
      "[Progress Service API] Failed to start story: API returned success=false",
    );
    return null;
  }

  return response.data || null;
}

/**
 * Save a checkpoint for a game session
 * Updates the game session with the current chapter and timestamp
 * Used when a player pauses or completes a chapter
 *
 * @param gameSessionId - The game session ID
 * @param chapterId - The chapter ID to save as checkpoint
 * @returns Updated GameSession with checkpoint data
 *
 * @example
 * const session = await saveCheckpoint("session-123", "chapter-456");
 */
export async function saveCheckpoint(
  gameSessionId: string,
  chapterId: string,
  elapsedTime: number,
) {
  console.log("[Progress Service API] Saving checkpoint:", {
    gameSessionId,
    chapterId,
    elapsedTime,
  });

  const response = await apiRequest<ApiResponse<GameSession | null>>(
    `/progress/checkpoint`,
    {
      method: "POST",
      body: JSON.stringify({
        gameSessionId,
        chapterId,
        elapsedTime,
      }),
    },
  );

  if (isApiError(response)) {
    console.warn(
      "[Progress Service API] Failed to save checkpoint:",
      response.error.message,
    );
    return null;
  }

  if (!response.success) {
    console.warn(
      "[Progress Service API] Failed to save checkpoint: API returned success=false",
    );
    return null;
  }

  return response.data || null;
}

/**
 * Submit a challenge answer and record the attempt with star rewards
 * Creates both ChallengeAttempt and StarEvent records atomically
 * Handles star calculation based on challenge type and difficulty
 *
 * @param request - Challenge answer submission data
 * @returns Response with attempt and star event data
 *
 * @example
 * const result = await submitChallengeAnswer({
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
 */
export async function submitChallengeAnswer(
  request: SubmitChallengeAnswerRequest,
): Promise<SubmitChallengeAnswerResponse> {
  console.log("[Progress Service API] Submitting challenge answer:", {
    gameSessionId: request.gameSessionId,
    challengeId: request.challengeId,
    challengeType: request.challengeType,
    isCorrect: request.isCorrect,
    elapsedTime: request.elapsedTime,
    attemptNumber: request.attemptNumber,
    usedHints: request.usedHints,
    skipped: request.skipped,
    status: request.status,
  });

  const response = await apiRequest<
    ApiResponse<{
      attempt: ChallengeAttempt;
      starEvent: StarEvent;
      totalStars: number;
    }>
  >(`/progress/challenge/submit`, {
    method: "POST",
    body: JSON.stringify({
      gameSessionId: request.gameSessionId,
      challengeId: request.challengeId,
      challengeType: request.challengeType,
      answerId: request.answerId,
      textAnswer: request.textAnswer,
      isCorrect: request.isCorrect,
      elapsedTime: request.elapsedTime,
      attemptNumber: request.attemptNumber,
      usedHints: request.usedHints,
      maxAttempts: request.maxAttempts,
      baseStars: request.baseStars,
      skipped: request.skipped,
      status: request.status,
      actions: request.actions,
    }),
  });

  if (isApiError(response)) {
    console.warn(
      "[Progress Service API] Failed to submit challenge answer:",
      response.error.message,
    );
    return {
      success: false,
      error: response.error.message,
    };
  }

  if (!response.success) {
    console.warn(
      "[Progress Service API] Failed to submit challenge answer: API returned success=false",
    );
    return {
      success: false,
      error: response.error?.message || "Failed to submit challenge answer",
    };
  }

  const data = response.data!;

  console.log(
    "[Progress Service API] Challenge answer submitted successfully",
    {
      challengeId: request.challengeId,
      totalStars: data.totalStars,
      attemptId: data.attempt.id,
      skipped: request.skipped,
    },
  );

  return {
    success: true,
    attempt: data.attempt,
    starEvent: data.starEvent,
    totalStarsEarned: data.totalStars,
  };
}

/**
 * Complete a story for a game session
 * Marks the story as completed and triggers completion rewards
 *
 * @param gameSessionId - The game session ID
 * @returns Updated GameSession with completion data
 *
 * @example
 * const result = await completeStory("session-123");
 */
export async function completeStory(
  gameSessionId: string,
  elapsedTime: number,
): Promise<GameSession | null> {
  console.log("[Progress Service API] Completing story:", { gameSessionId });

  const response = await apiRequest<ApiResponse<GameSession>>(
    `/progress/${gameSessionId}/complete`,

    {
      method: "POST",
      body: JSON.stringify({
        elapsedTime,
      }),
    },
  );

  if (isApiError(response)) {
    console.warn(
      "[Progress Service API] Failed to complete story:",
      response.error.message,
    );
    return null;
  }

  if (!response.success) {
    console.warn(
      "[Progress Service API] Failed to complete story: API returned success=false",
    );
    return null;
  }

  console.log("[Progress Service API] Story completed successfully", {
    gameSessionId,
  });

  return response.data || null;
}

/**
 * Update child's current level
 * Called when a child reaches a new level through progression
 *
 * @param childId - The child ID
 * @param newLevel - The new level number to update to
 * @returns Updated ChildProfile
 *
 * @example
 * const updated = await updateChildLevel("child-123", 3);
 */
export async function updateChildLevel(
  childId: string,
  newLevel: number,
): Promise<ChildProfile | null> {
  console.log("[Progress Service API] Updating child level:", {
    childId,
    newLevel,
  });

  const response = await apiRequest<ApiResponse<ChildProfile>>(
    `/children/${childId}/level`,
    {
      method: "PATCH",
      body: JSON.stringify({
        currentLevel: newLevel,
      }),
    },
  );

  if (isApiError(response)) {
    console.warn(
      "[Progress Service API] Failed to update child level:",
      response.error.message,
    );
    return null;
  }

  if (!response.success) {
    console.warn(
      "[Progress Service API] Failed to update child level: API returned success=false",
    );
    return null;
  }

  console.log("[Progress Service API] Child level updated successfully", {
    childId,
    newLevel,
  });

  return response.data || null;
}

/**
 * Assign a badge to a child
 * Called when a child earns a new badge through level progression
 *
 * @param childId - The child ID
 * @param badgeId - The badge ID to assign
 * @returns Updated ChildProfile with new badge
 *
 * @example
 * const updated = await assignBadgeToChild("child-123", "badge-456");
 */
export async function assignBadgeToChild(
  childId: string,
  badgeId: string,
): Promise<ChildProfile | null> {
  console.log("[Progress Service API] Assigning badge to child:", {
    childId,
    badgeId,
  });

  const response = await apiRequest<ApiResponse<ChildProfile>>(
    `/children/${childId}/badges`,
    {
      method: "POST",
      body: JSON.stringify({
        badgeId,
      }),
    },
  );

  if (isApiError(response)) {
    console.warn(
      "[Progress Service API] Failed to assign badge:",
      response.error.message,
    );
    return null;
  }

  if (!response.success) {
    console.warn(
      "[Progress Service API] Failed to assign badge: API returned success=false",
    );
    return null;
  }

  console.log("[Progress Service API] Badge assigned successfully", {
    childId,
    badgeId,
  });

  return response.data || null;
}

/**
 * Resume a checkpoint - marks it as resumed and returns idle time
 * @param gameSessionId - The game session ID to resume
 * @returns SessionCheckpoint response with resumedAt and idle time
 */
export async function createNewCheckpointSession(
  gameSessionId: string,
): Promise<SessionCheckpoint | undefined> {
  console.log(
    "[Progress Service API] Creating new checkpoint for game session:",
    { gameSessionId },
  );

  const response = await apiRequest<ApiResponse<SessionCheckpoint>>(
    `/progress/create-new-checkpoint/${gameSessionId}`,
    {
      method: "POST",
      body: JSON.stringify({}),
    },
  );

  if (isApiError(response)) {
    throw new Error(response.error.message);
  }

  if (!response.success) {
    throw new Error("Failed to create new checkpoint");
  }

  console.log("[Progress Service API] New checkpoint created successfully", {
    gameSessionId,
  });

  return response.data;
}

/**
 * Pause a game session - saves state when user exits the story
 * @param gameSessionId - The game session ID to pause
 * @returns SessionCheckpoint response with pause timestamp
 */
export async function pauseGameSession(
  gameSessionId: string,
): Promise<SessionCheckpoint | null> {
  console.log("[Progress Service API] Pausing game session:", {
    gameSessionId,
  });

  const response = await apiRequest<ApiResponse<SessionCheckpoint>>(
    `/progress/pause/${gameSessionId}`,
    {
      method: "POST",
      body: JSON.stringify({}),
    },
  );

  if (isApiError(response)) {
    console.warn(
      "[Progress Service API] Failed to pause game session:",
      response.error.message,
    );
    return null;
  }

  if (!response.success) {
    console.warn(
      "[Progress Service API] Failed to pause game session: API returned success=false",
    );
    return null;
  }

  console.log("[Progress Service API] Game session paused successfully", {
    gameSessionId,
  });

  return response.data || null;
}
/**
 * Allocate a roadmap to a child
 * Adds the roadmap ID to the child's allocatedRoadmaps array
 *
 * @param childId - The child's ID
 * @param roadmapId - The roadmap ID to allocate
 * @returns Updated ChildProfile with the roadmap allocated
 *
 * @example
 * const updatedChild = await allocateRoadmapToChild("child-123", "roadmap-456");
 * console.log("Roadmap allocated to:", updatedChild.name);
 *
 * @throws Throws error if the allocation fails
 */
export async function allocateRoadmapToChild(
  childId: string,
  roadmapId: string,
): Promise<ChildProfile> {
  console.log("[Progress Service API] Allocating roadmap to child", {
    childId,
    roadmapId,
  });

  const response = await apiRequest<ApiResponse<ChildProfile>>(
    `/children/${childId}/allocate-roadmap`,
    {
      method: "POST",
      body: JSON.stringify({ roadmapId }),
    },
  );

  if (isApiError(response)) {
    const errorMessage = response.error.message || "Failed to allocate roadmap";
    console.error(
      "[Progress Service API] Error allocating roadmap:",
      errorMessage,
    );
    throw new Error(errorMessage);
  }

  if (!response.success) {
    console.error(
      "[Progress Service API] Roadmap allocation failed: API returned success=false",
    );
    throw new Error(response.error?.message || "Failed to allocate roadmap");
  }

  console.log("[Progress Service API] Roadmap allocated successfully", {
    childId,
    roadmapId,
    childName: response.data?.name,
  });

  return response.data as ChildProfile;
}

/**
 * Update child's notification preferences
 * Updates the activateNotifications flag for a specific child
 *
 * @param childId - The child's ID
 * @param activateNotifications - Whether to activate or deactivate notifications
 * @returns Updated ChildProfile
 *
 * @example
 * const updated = await updateChildNotifications("child-123", true);
 * console.log("Notifications enabled for:", updated.name);
 *
 * @throws Throws error if the update fails
 */
export async function updateChildNotifications(
  childId: string,
  activateNotifications: boolean,
): Promise<ChildProfile> {
  console.log(
    "[Progress Service API] Updating child notification preferences",
    {
      childId,
      activateNotifications,
    },
  );

  const response = await apiRequest<ApiResponse<ChildProfile>>(
    `/children/${childId}/notifications`,
    {
      method: "PATCH",
      body: JSON.stringify({ activateNotifications }),
    },
  );

  if (isApiError(response)) {
    const errorMessage =
      response.error.message || "Failed to update notification settings";
    console.error(
      "[Progress Service API] Error updating notification preferences:",
      errorMessage,
    );
    throw new Error(errorMessage);
  }

  if (!response.success) {
    console.error(
      "[Progress Service API] Notification update failed: API returned success=false",
    );
    throw new Error(
      response.error?.message || "Failed to update notification settings",
    );
  }

  console.log(
    "[Progress Service API] Notification preferences updated successfully",
    {
      childId,
      activateNotifications,
      childName: response.data?.name,
    },
  );

  return response.data as ChildProfile;
}

/**
 * Update child's general settings (name, age group, favorite themes)
 * Updates multiple child profile fields in a single request
 *
 * @param childId - The child's ID
 * @param name - The child's updated name
 * @param ageGroupId - The child's updated age group ID
 * @param favoriteThemes - Array of favorite theme IDs
 * @returns Updated ChildProfile
 *
 * @example
 * const updated = await updateChildGeneralSettings("child-123", "John", "age-group-5", ["theme-1", "theme-2"]);
 * console.log("Settings updated for:", updated.name);
 *
 * @throws Throws error if the update fails
 */
export async function updateChildGeneralSettings(
  childId: string,
  name: string,
  ageGroupId: string,
  favoriteThemes: string[],
  allocatedRoadmaps: string[],
  sessionsPerWeek: number,
  ageGroup: string,
): Promise<ChildProfile> {
  console.log("[Progress Service API] Updating child general settings", {
    childId,
    name,
    ageGroupId,
    favoriteThemesCount: favoriteThemes.length,
    allocatedRoadmapsCount: allocatedRoadmaps.length,
    sessionsPerWeek,
    ageGroup,
  });

  const response = await apiRequest<ApiResponse<ChildProfile>>(
    `/children/${childId}/settings`,
    {
      method: "PATCH",
      body: JSON.stringify({
        name,
        ageGroupId,
        favoriteThemes,
        allocatedRoadmaps,
        sessionsPerWeek,
        ageGroup,
      }),
    },
  );

  if (isApiError(response)) {
    const errorMessage =
      response.error.message || "Failed to update child settings";
    console.error(
      "[Progress Service API] Error updating general settings:",
      errorMessage,
    );
    throw new Error(errorMessage);
  }

  if (!response.success) {
    console.error(
      "[Progress Service API] General settings update failed: API returned success=false",
    );
    throw new Error(
      response.error?.message || "Failed to update child settings",
    );
  }

  console.log(
    "[Progress Service API] Child general settings updated successfully",
    {
      childId,
      name: response.data?.name,
      ageGroupId: response.data?.ageGroupId,
      favoriteThemesCount: response.data?.favoriteThemes?.length || 0,
    },
  );

  return response.data as ChildProfile;
}

/**
 * Delete a child profile permanently
 * Removes the child and all associated data
 *
 * @param childId - The child's ID to delete
 * @returns Success message or throws error
 *
 * @example
 * await deleteChild("child-123");
 * console.log("Child deleted successfully");
 *
 * @throws Throws error if the delete fails
 */
export async function deleteChild(childId: string): Promise<void> {
  console.log("[Progress Service API] Deleting child profile", { childId });

  const response = await apiRequest<ApiResponse<{ message: string }>>(
    `/children/${childId}`,
    {
      method: "DELETE",
    },
  );

  if (isApiError(response)) {
    const errorMessage = response.error.message || "Failed to delete child";
    console.error("[Progress Service API] Error deleting child:", errorMessage);
    throw new Error(errorMessage);
  }

  if (!response.success) {
    console.error(
      "[Progress Service API] Child deletion failed: API returned success=false",
    );
    throw new Error(response.error?.message || "Failed to delete child");
  }

  console.log("[Progress Service API] Child deleted successfully", { childId });
}

/**
 * Toggle weekly reports activation for a child
 * Updates the child's activateWeeklyReports setting
 *
 * @param childId - The child's ID
 * @param isActive - Whether to activate or deactivate weekly reports
 * @returns Updated ChildProfile
 *
 * @example
 * const updated = await toggleWeeklyReports("child-123", true);
 * console.log("Weekly reports activated for:", updated.name);
 *
 * @throws Throws error if the update fails
 */
export async function toggleWeeklyReports(
  childId: string,
  isActive: boolean,
): Promise<ChildProfile> {
  console.log("[Progress Service API] Toggling weekly reports for child", {
    childId,
    isActive,
  });

  const response = await apiRequest<ApiResponse<ChildProfile>>(
    `/children/${childId}/weekly-reports`,
    {
      method: "PATCH",
      body: JSON.stringify({
        activateWeeklyReports: isActive,
      }),
    },
  );

  if (isApiError(response)) {
    const errorMessage =
      response.error.message || "Failed to toggle weekly reports";
    console.error(
      "[Progress Service API] Error toggling weekly reports:",
      errorMessage,
    );
    throw new Error(errorMessage);
  }

  if (!response.success) {
    console.error(
      "[Progress Service API] Toggle weekly reports failed: API returned success=false",
    );
    throw new Error(
      response.error?.message || "Failed to toggle weekly reports",
    );
  }

  console.log("[Progress Service API] Weekly reports toggled successfully", {
    childId,
    isActive,
  });

  return response.data as ChildProfile;
}

/**
 * Toggle storytelling activation for a child
 * Activates or deactivates AI-generated storytelling for the child
 *
 * @param childId - The child's ID
 * @param isActive - Whether to activate or deactivate storytelling
 * @returns Updated child profile with storytelling status
 *
 * @example
 * const updatedChild = await toggleStorytelling("child-123", true);
 * console.log("Storytelling active:", updatedChild.storytelling?.isActive);
 */
export async function toggleStorytelling(
  childId: string,
  isActive: boolean,
): Promise<ChildProfile> {
  console.log("[Progress Service API] Toggling storytelling for child", {
    childId,
    isActive,
  });

  const response = await apiRequest<ApiResponse<ChildProfile>>(
    `/children/${childId}/storytelling`,
    {
      method: "PATCH",
      body: JSON.stringify({
        isActive,
      }),
    },
  );

  if (isApiError(response)) {
    const errorMessage =
      response.error.message || "Failed to toggle storytelling";
    console.error(
      "[Progress Service API] Error toggling storytelling:",
      errorMessage,
    );
    throw new Error(errorMessage);
  }

  if (!response.success) {
    console.error(
      "[Progress Service API] Toggle storytelling failed: API returned success=false",
    );
    throw new Error(response.error?.message || "Failed to toggle storytelling");
  }

  console.log("[Progress Service API] Storytelling toggled successfully", {
    childId,
    isActive,
  });

  return response.data as ChildProfile;
}

/**
 * Get comprehensive dashboard statistics for admin overview
 * Gateway orchestrates Auth, Progress, and Content services to aggregate metrics
 *
 * Statistics include:
 * - Active children (those with activity in past 7 days)
 * - User counts (total children, parents)
 * - Content inventory (age groups, worlds, stories, chapters, challenges)
 * - Completion metrics (stories completed, challenges solved)
 *
 * @returns AdminDashboardStats with all dashboard metrics
 *
 * @example
 * const stats = await getDashboardStats();
 * console.log(`${stats.totalChildren} children, ${stats.activeChildren} active this week`);
 */
export async function getDashboardStats(): Promise<AdminDashboardStats> {
  console.log("[Progress Service API] Fetching admin dashboard statistics");

  const defaultStats: AdminDashboardStats = {
    activeChildren: 0,
    totalChildren: 0,
    totalParents: 0,
    totalAgeGroups: 0,
    totalRoadmaps: 0,
    totalWorlds: 0,
    totalStories: 0,
    totalChapters: 0,
    totalChallenges: 0,
    totalStoriesCompleted: 0,
    totalChallengesSolved: 0,
  };

  try {
    // Call consolidated gateway endpoint
    // Gateway handles orchestration with Auth, Progress, and Content services
    const response = await apiRequest<ApiResponse<AdminDashboardStats>>(
      `/stats/admin-dashboard`,
    );

    if (isApiError(response)) {
      console.warn(
        "[Progress Service API] Failed to fetch dashboard stats:",
        response.error.message,
      );
      return defaultStats;
    }

    if (!response.success) {
      console.warn(
        "[Progress Service API] Failed to fetch dashboard stats: API returned success=false",
      );
      return defaultStats;
    }

    console.log("[Progress Service API] Dashboard stats fetched successfully", {
      totalChildren: response.data?.totalChildren,
      activeChildren: response.data?.activeChildren,
      totalRoadmaps: response.data?.totalRoadmaps,
      totalChallenges: response.data?.totalChallenges,
    });

    return response.data || defaultStats;
  } catch (error) {
    console.error(
      "[Progress Service API] Error fetching dashboard stats:",
      error,
    );
    return defaultStats;
  }
}
