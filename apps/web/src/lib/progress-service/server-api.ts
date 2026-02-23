/* eslint-disable @typescript-eslint/no-explicit-any */
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

import { auth } from "@/src/auth";
import type { ApiResponse, ChildProfile, ChallengeType, GameSession, ParentUser, Progress, ChallengeAttempt, StarEvent, ChallengeStatus } from "@shared/types";

/**
 * Global error response type
 */
export interface ApiError {
  success: false;
  error: {
    message: string;
    status?: number;
  };
}

/**
 * Type guard to check if response is an ApiError
 */
function isApiError(response: any): response is ApiError {
  return response && 'error' in response && response.success === false;
}

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
  answerId?: string;        // For multiple choice
  textAnswer?: string;      // For text input
  isCorrect: boolean;       // Whether the answer was correct
  
  // Attempt data
  elapsedTime: number;      // seconds spent on this challenge
  attemptNumber: number;    // Which attempt is this (1st, 2nd, etc)
  usedHints: number;        // Number of hints used (0 = no hints, 1 = 1 hint, etc.)
  maxAttempts?: number;     // Max allowed attempts for this challenge
  skipped?: boolean;        // Whether the challenge was skipped
  status: ChallengeStatus;  // The status of the challenge attempt
  
  // Challenge metadata for star calculation
  baseStars: number;        // Base stars for this challenge
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
  error?: string;
}


/**
 * Get the gateway URL for server-side requests
 * Defaults to localhost:3001 for development
 */
function getGatewayUrl(): string {
  // In production, use internal service URL
  // In development, use localhost
  if (process.env.NODE_ENV === "production") {
    return process.env.INTERNAL_GATEWAY_URL || "http://localhost:3001";
  }
  return process.env.NEXT_PUBLIC_GATEWAY_URL || "http://localhost:3001";
}

/**
 * Build query string from object
 */
function buildQueryString(params: Record<string, any>): string {
  const filtered = Object.entries(params)
    .filter(([, value]) => value !== undefined && value !== null)
    .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
    .join("&");

  return filtered ? `?${filtered}` : "";
}

/**
 * Make a server-side API request to Gateway
 * This function is RSC-safe and extracts JWT from NextAuth session
 */
async function apiRequest<T = any>(
  endpoint: string,
  options?: RequestInit,
): Promise<T | ApiError> {
  const url = `${getGatewayUrl()}${endpoint}`;

  // Get JWT token from NextAuth session
  const session = await auth();
  const token = (session?.user as any)?.token;

  if (!token) {
    console.warn("[Progress Service API] No JWT token found - user may not be authenticated", {
      hasSession: !!session,
      hasUser: !!session?.user,
    });
  } else {
    console.log("[Progress Service API] JWT token found, length:", token.length);
  }

  const defaultHeaders: HeadersInit = {
    "Content-Type": "application/json",
  };

  // Add Authorization header if token exists
  if (token) {
    defaultHeaders["Authorization"] = `Bearer ${token}`;
  }

  const config: RequestInit = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options?.headers,
    },
    // Disable caching for data endpoints
    cache: options?.cache || "no-store",
  };

  try {
    const response = await fetch(url, config);

    if (!response.ok) {
      const error = await response.json().catch(() => ({
        error: `HTTP ${response.status}`,
        message: response.statusText,
      }));

      console.error(`[Progress Service API] Request failed: ${endpoint}`, {
        status: response.status,
        error,
      });

      return {
        success: false,
        error: {
          message: `${error.error || error.message || "Unknown error"}`,
          status: response.status,
        },
      } as ApiError;
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error(`[Progress Service API] Request error: ${endpoint}`, error);
    
    return {
      success: false,
      error: {
        message: error instanceof Error ? error.message : "Unknown error occurred",
      },
    } as ApiError;
  }
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
  console.log("[Progress Service API] Fetching all children with params:", params);

  const response = await apiRequest<ApiResponse<ChildProfile[]>>(
    `/api/children${queryString}`,
  );

  if (isApiError(response)) {
    console.warn("[Progress Service API] Failed to fetch children:", response.error.message);
    return {
      children: [],
      pagination: undefined,
    };
  }

  console.log("[Progress Service API] Received response for progress service:", {
    success: response.success,
    dataLength: response.data?.length,
    pagination: response.pagination,
  });

  if (!response.success) {
    console.warn("[Progress Service API] Failed to fetch children: API returned success=false");
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
    `/api/children/${childId}`,
  );

  if (isApiError(response)) {
    console.warn("[Progress Service API] Failed to fetch child:", response.error.message);
    return null;
  }

  if (!response.success) {
    console.warn("[Progress Service API] Failed to fetch child: API returned success=false");
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
  console.log("[Progress Service API] Fetching child progress:", { childId, storyId });

  const response = await apiRequest<ApiResponse<Progress>>(
    `/api/progress/${childId}/stories/${storyId}`,
  );

  if (isApiError(response)) {
    console.warn("[Progress Service API] Failed to fetch progress:", response.error.message);
    return null;
  }

  if (!response.success) {
    console.warn("[Progress Service API] Failed to fetch progress: API returned success=false");
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
  console.log("[Progress Service API] Fetching parent with profiles:", parentId);

  const response = await apiRequest<ApiResponse<ParentUser>>(
    `/api/parent-data/${parentId}`,
  );

  if (isApiError(response)) {
    console.warn("[Progress Service API] Failed to fetch parent with profiles:", response.error.message);
    return null;
  }

  if (!response.success) {
    console.warn("[Progress Service API] Failed to fetch parent with profiles: API returned success=false");
    return null;
  }

  return response.data || null;
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
  console.log("[Progress Service API] Starting new story:", { childId, storyId });

  const response = await apiRequest<ApiResponse<Progress | null>>(
    `/api/progress/${childId}/stories/${storyId}/start`,
    {
      method: "POST",
      body: JSON.stringify({
        startPage: 1,
      }),
    },
  );

  if (isApiError(response)) {
    console.warn("[Progress Service API] Failed to start story:", response.error.message);
    return null;
  }

  if (!response.success) {
    console.warn("[Progress Service API] Failed to start story: API returned success=false");
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
) {
  console.log("[Progress Service API] Saving checkpoint:", {
    gameSessionId,
    chapterId,
  });

  const response = await apiRequest<ApiResponse<GameSession | null>>(
    `/api/progress/checkpoint`,
    {
      method: "POST",
      body: JSON.stringify({
        gameSessionId,
        chapterId,
      }),
    },
  );

  if (isApiError(response)) {
    console.warn("[Progress Service API] Failed to save checkpoint:", response.error.message);
    return null;
  }

  if (!response.success) {
    console.warn("[Progress Service API] Failed to save checkpoint: API returned success=false");
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
  >(`/api/progress/challenge/submit`, {
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
    }),
  });

  if (isApiError(response)) {
    console.warn("[Progress Service API] Failed to submit challenge answer:", response.error.message);
    return {
      success: false,
      error: response.error.message,
    };
  }

  if (!response.success) {
    console.warn("[Progress Service API] Failed to submit challenge answer: API returned success=false");
    return {
      success: false,
      error: response.error?.message || "Failed to submit challenge answer",
    };
  }

  const data = response.data!;

  console.log("[Progress Service API] Challenge answer submitted successfully", {
    challengeId: request.challengeId,
    totalStars: data.totalStars,
    attemptId: data.attempt.id,
    skipped: request.skipped,
  });

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
): Promise<GameSession | null> {
  console.log("[Progress Service API] Completing story:", { gameSessionId });

  const response = await apiRequest<ApiResponse<GameSession>>(
    `/api/progress/${gameSessionId}/complete`,
    {
      method: "POST",
    },
  );

  if (isApiError(response)) {
    console.warn("[Progress Service API] Failed to complete story:", response.error.message);
    return null;
  }

  if (!response.success) {
    console.warn("[Progress Service API] Failed to complete story: API returned success=false");
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
  console.log("[Progress Service API] Updating child level:", { childId, newLevel });

  const response = await apiRequest<ApiResponse<ChildProfile>>(
    `/api/children/${childId}/level`,
    {
      method: "PATCH",
      body: JSON.stringify({
        currentLevel: newLevel,
      }),
    },
  );

  if (isApiError(response)) {
    console.warn("[Progress Service API] Failed to update child level:", response.error.message);
    return null;
  }

  if (!response.success) {
    console.warn("[Progress Service API] Failed to update child level: API returned success=false");
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
  console.log("[Progress Service API] Assigning badge to child:", { childId, badgeId });

  const response = await apiRequest<ApiResponse<ChildProfile>>(
    `/api/children/${childId}/badges`,
    {
      method: "POST",
      body: JSON.stringify({
        badgeId,
      }),
    },
  );

  if (isApiError(response)) {
    console.warn("[Progress Service API] Failed to assign badge:", response.error.message);
    return null;
  }

  if (!response.success) {
    console.warn("[Progress Service API] Failed to assign badge: API returned success=false");
    return null;
  }

  console.log("[Progress Service API] Badge assigned successfully", {
    childId,
    badgeId,
  });

  return response.data || null;
}
