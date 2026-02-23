/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Server-Side API Utility for RSCs (React Server Components)
 * Makes direct fetch calls from the server with JWT authentication
 * Used in Next.js Server Components and Server Actions
 */

import { auth } from "@/src/auth";
import type {
  ApiResponse,
  PaginationMeta,
  Story,
  Roadmap,
  World,
  AgeGroup,
  Challenge,
  Theme,
  Level,
  Badge,
} from "@shared/types";

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

interface PaginationParams {
  limit?: number;
  offset?: number;
}

export interface StoryQueryParams extends PaginationParams {
  worldId?: string;
  difficulty?: number;
  isMandatory?: boolean;
}

interface ChallengeQueryParams extends PaginationParams {
  chapterId?: string;
  storyId?: string;
  type?: string;
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
 * Make a server-side API request
 * This function is RSC-safe and extracts JWT from NextAuth session
 */
async function apiRequest<T = any>(
  endpoint: string,
  options?: RequestInit
): Promise<T | ApiError> {
  const url = `${getGatewayUrl()}${endpoint}`;

  // Get JWT token from NextAuth session
  const session = await auth();
  const token = (session?.user as any)?.token;
  
  if (!token) {
    console.warn(
      "[Content Server API] No JWT token found - user may not be authenticated",
      { hasSession: !!session, hasUser: !!session?.user }
    );
  } else {
    console.log("[Content Server API] JWT token found, length:", token.length);
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

      console.error(`[Content Server API] Request failed: ${endpoint}`, {
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
    console.error(`[Content Server API] Request error: ${endpoint}`, error);
    
    return {
      success: false,
      error: {
        message: error instanceof Error ? error.message : "Unknown error occurred",
      },
    } as ApiError;
  }
}

/**
 * ============================================
 * STORY ENDPOINTS
 * ============================================
 */

export async function getStories(params?: StoryQueryParams) {
  const queryString = buildQueryString(params || {});
  console.log("[Content Server API] Fetching stories with params:", params);
  const response = await apiRequest<ApiResponse<Story[]>>(
    `/api/stories${queryString}`
  );

  if (isApiError(response)) {
    console.warn("[Content Server API] Failed to fetch stories:", response.error.message);
    return {
      stories: [],
      pagination: undefined,
    };
  }

  if (!response.success) {
    console.warn("[Content Server API] Failed to fetch stories: API returned success=false");
    return {
      stories: [],
      pagination: undefined,
    };
  }

  return {
    stories: response.data || [],
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

export async function getStoryById(storyId: string) {
  const response = await apiRequest<ApiResponse<Story>>(
    `/api/stories/${storyId}`
  );

  if (isApiError(response)) {
    console.warn("[Content Server API] Failed to fetch story:", response.error.message);
    return null;
  }

  if (!response.success) {
    console.warn("[Content Server API] Failed to fetch story: API returned success=false");
    return null;
  }

  return response.data || null;
}

export async function getStoriesByWorld(worldId: string) {
  const response = await apiRequest<ApiResponse<Story[]>>(
    `/api/stories/world/${worldId}`
  );

  if (isApiError(response)) {
    console.warn("[Content Server API] Failed to fetch stories by world:", response.error.message);
    return [];
  }

  if (!response.success) {
    console.warn("[Content Server API] Failed to fetch stories by world: API returned success=false");
    return [];
  }

  return response.data || [];
}

export async function getStoriesCount() {
  const response = await apiRequest<ApiResponse<{ count: number }>>(
    `/api/stories/count`
  );

  if (isApiError(response)) {
    console.warn("[Content Server API] Failed to fetch stories count:", response.error.message);
    return 0;
  }

  if (!response.success) {
    console.warn("[Content Server API] Failed to fetch stories count: API returned success=false");
    return 0;
  }

  return response.data?.count || 0;
}

/**
 * ============================================
 * ROADMAP ENDPOINTS
 * ============================================
 */

export async function getRoadmaps() {
  const response = await apiRequest<ApiResponse<Roadmap[]>>("/api/roadmaps");

  if (isApiError(response)) {
    console.warn("[Content Server API] Failed to fetch roadmaps:", response.error.message);
    return [];
  }

  if (!response.success) {
    console.warn("[Content Server API] Failed to fetch roadmaps: API returned success=false");
    return [];
  }

  return response.data || [];
}

export async function getRoadmapById(roadmapId: string) {
  const response = await apiRequest<ApiResponse<Roadmap>>(
    `/api/roadmaps/${roadmapId}`
  );

  if (isApiError(response)) {
    console.warn("[Content Server API] Failed to fetch roadmap:", response.error.message);
    return null;
  }

  if (!response.success) {
    console.warn("[Content Server API] Failed to fetch roadmap: API returned success=false");
    return null;
  }

  return response.data || null;
}

export async function getRoadmapsByAgeGroup(ageGroupId: string) {
  const response = await apiRequest<ApiResponse<Roadmap[]>>(
    `/api/roadmaps/age-group/${ageGroupId}`
  );

  if (isApiError(response)) {
    console.warn("[Content Server API] Failed to fetch roadmaps by age group:", response.error.message);
    return [];
  }

  if (!response.success) {
    console.warn("[Content Server API] Failed to fetch roadmaps by age group: API returned success=false");
    return [];
  }

  return response.data || [];
}

/**
 * ============================================
 * WORLD ENDPOINTS
 * ============================================
 */

export async function getWorlds() {
  const response = await apiRequest<ApiResponse<World[]>>("/api/worlds");

  if (isApiError(response)) {
    console.warn("[Content Server API] Failed to fetch worlds:", response.error.message);
    return [];
  }

  if (!response.success) {
    console.warn("[Content Server API] Failed to fetch worlds: API returned success=false");
    return [];
  }

  return response.data || [];
}

export async function getWorldById(worldId: string) {
  const response = await apiRequest<ApiResponse<World>>(
    `/api/worlds/${worldId}`
  );

  if (isApiError(response)) {
    console.warn("[Content Server API] Failed to fetch world:", response.error.message);
    return null;
  }

  if (!response.success) {
    console.warn("[Content Server API] Failed to fetch world: API returned success=false");
    return null;
  }

  return response.data || null;
}

export async function getWorldsByRoadmap(roadmapId: string) {
  const response = await apiRequest<ApiResponse<World[]>>(
    `/api/worlds/roadmap/${roadmapId}`
  );

  if (isApiError(response)) {
    console.warn("[Content Server API] Failed to fetch worlds by roadmap:", response.error.message);
    return [];
  }

  if (!response.success) {
    console.warn("[Content Server API] Failed to fetch worlds by roadmap: API returned success=false");
    return [];
  }

  return response.data || [];
}

/**
 * ============================================
 * AGE GROUP ENDPOINTS
 * ============================================
 */

export async function getAgeGroups() {
  const response = await apiRequest<ApiResponse<AgeGroup[]>>("/api/age-groups");

  if (isApiError(response)) {
    console.warn("[Content Server API] Failed to fetch age groups:", response.error.message);
    return [];
  }

  if (!response.success) {
    console.warn("[Content Server API] Failed to fetch age groups: API returned success=false");
    return [];
  }

  return response.data || [];
}

export async function getAgeGroupById(ageGroupId: string) {
  const response = await apiRequest<ApiResponse<AgeGroup>>(
    `/api/age-groups/${ageGroupId}`
  );

  if (isApiError(response)) {
    console.warn("[Content Server API] Failed to fetch age group:", response.error.message);
    return null;
  }

  if (!response.success) {
    console.warn("[Content Server API] Failed to fetch age group: API returned success=false");
    return null;
  }

  return response.data || null;
}

/**
 * ============================================
 * THEME ENDPOINTS
 * ============================================
 */

export async function getThemes() {
  const response = await apiRequest<ApiResponse<Theme[]>>("/api/themes");

  if (isApiError(response)) {
    console.warn("[Content Server API] Failed to fetch themes:", response.error.message);
    return [];
  }

  if (!response.success) {
    console.warn("[Content Server API] Failed to fetch themes: API returned success=false");
    return [];
  }

  return response.data || [];
}

/**
 * ============================================
 * CHALLENGE ENDPOINTS
 * ============================================
 */

export async function getChallenges(params?: ChallengeQueryParams) {
  const queryString = buildQueryString(params || {});
  const response = await apiRequest<ApiResponse<Challenge[]>>(
    `/api/challenges${queryString}`
  );

  if (isApiError(response)) {
    console.warn("[Content Server API] Failed to fetch challenges:", response.error.message);
    return {
      challenges: [],
      pagination: undefined,
    };
  }

  if (!response.success) {
    console.warn("[Content Server API] Failed to fetch challenges: API returned success=false");
    return {
      challenges: [],
      pagination: undefined,
    };
  }

  return {
    challenges: response.data || [],
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

export async function getChallengeById(challengeId: string) {
  const response = await apiRequest<ApiResponse<Challenge>>(
    `/api/challenges/${challengeId}`
  );

  if (isApiError(response)) {
    console.warn("[Content Server API] Failed to fetch challenge:", response.error.message);
    return null;
  }

  if (!response.success) {
    console.warn("[Content Server API] Failed to fetch challenge: API returned success=false");
    return null;
  }

  return response.data || null;
}

export async function getChallengesByChapter(chapterId: string) {
  const response = await apiRequest<ApiResponse<Challenge[]>>(
    `/api/challenges/chapter/${chapterId}`
  );

  if (isApiError(response)) {
    console.warn("[Content Server API] Failed to fetch challenges by chapter:", response.error.message);
    return [];
  }

  if (!response.success) {
    console.warn("[Content Server API] Failed to fetch challenges by chapter: API returned success=false");
    return [];
  }

  return response.data || [];
}


/**
 * ============================================
 * Level ENDPOINTS
 * ============================================
 */

export async function getLevels() {
  const response = await apiRequest<ApiResponse<Level[]>>("/api/levels");

  if (isApiError(response)) {
    console.warn("[Content Server API] Failed to fetch levels:", response.error.message);
    return [];
  }

  if (!response.success) {
    console.warn("[Content Server API] Failed to fetch levels: API returned success=false");
    return [];
  }

  return response.data || [];
}

export async function getLevelById(levelId: string) {
  const response = await apiRequest<ApiResponse<Level>>(
    `/api/levels/${levelId}`
  );

  if (isApiError(response)) {
    console.warn("[Content Server API] Failed to fetch level:", response.error.message);
    return null;
  }

  if (!response.success) {
    console.warn("[Content Server API] Failed to fetch level: API returned success=false");
    return null;
  }

  return response.data || null;
}

export async function getLevelByNumber(levelNumber: number) {
  const response = await apiRequest<ApiResponse<Level>>(
    `/api/levels/number/${levelNumber}`
  );

  if (isApiError(response)) {
    console.warn("[Content Server API] Failed to fetch level by number:", response.error.message);
    return null;
  }

  if (!response.success) {
    console.warn("[Content Server API] Failed to fetch level by number: API returned success=false");
    return null;
  }

  return response.data || null;
}


/**
 * ============================================
 * Badge ENDPOINTS
 * ============================================
 */

export async function getBadges() {
  const response = await apiRequest<ApiResponse<Badge[]>>("/api/badges");

  if (isApiError(response)) {
    console.warn("[Content Server API] Failed to fetch badges:", response.error.message);
    return [];
  }

  if (!response.success) {
    console.warn("[Content Server API] Failed to fetch badges: API returned success=false");
    return [];
  }

  return response.data || [];
}

export async function getBadgeById(badgeId: string) {
  const response = await apiRequest<ApiResponse<Badge>>(
    `/api/badges/${badgeId}`
  );

  if (isApiError(response)) {
    console.warn("[Content Server API] Failed to fetch badge:", response.error.message);
    return null;
  }

  if (!response.success) {
    console.warn("[Content Server API] Failed to fetch badge: API returned success=false");
    return null;
  }

  return response.data || null;
}

export async function getBadgeByLevel(levelNumber: number) {
  const response = await apiRequest<ApiResponse<Badge>>(
    `/api/badges/level/${levelNumber}`
  );

  if (isApiError(response)) {
    console.warn("[Content Server API] Failed to fetch badge by level:", response.error.message);
    return null;
  }

  if (!response.success) {
    console.warn("[Content Server API] Failed to fetch badge by level: API returned success=false");
    return null;
  }

  return response.data || null;
}
