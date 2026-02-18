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
} from "@shared/types";

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
): Promise<T> {
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

      throw new Error(
        `API Error ${response.status}: ${error.error || error.message || "Unknown error"}`
      );
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error(`[Content Server API] Request error: ${endpoint}`, error);
    throw error;
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

  if (!response.success) {
    const errorMsg = response.error?.message || "Failed to fetch stories";
    throw new Error(errorMsg);
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

  if (!response.success) {
    const errorMsg = response.error?.message || "Failed to fetch story";
    throw new Error(errorMsg);
  }

  return response.data;
}

export async function getStoriesByWorld(worldId: string) {
  const response = await apiRequest<ApiResponse<Story[]>>(
    `/api/stories/world/${worldId}`
  );

  if (!response.success) {
    const errorMsg = response.error?.message || "Failed to fetch stories";
    throw new Error(errorMsg);
  }

  return response.data || [];
}

export async function getStoriesCount() {
  const response = await apiRequest<ApiResponse<{ count: number }>>(
    `/api/stories/count`
  );

  if (!response.success) {
    const errorMsg = response.error?.message || "Failed to fetch stories count";
    throw new Error(errorMsg);
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

  if (!response.success) {
    const errorMsg = response.error?.message || "Failed to fetch roadmaps";
    throw new Error(errorMsg);
  }

  return response.data || [];
}

export async function getRoadmapById(roadmapId: string) {
  const response = await apiRequest<ApiResponse<Roadmap>>(
    `/api/roadmaps/${roadmapId}`
  );

  if (!response.success) {
    const errorMsg = response.error?.message || "Failed to fetch roadmap";
    throw new Error(errorMsg);
  }

  return response.data;
}

export async function getRoadmapsByAgeGroup(ageGroupId: string) {
  const response = await apiRequest<ApiResponse<Roadmap[]>>(
    `/api/roadmaps/age-group/${ageGroupId}`
  );

  if (!response.success) {
    const errorMsg = response.error?.message || "Failed to fetch roadmaps";
    throw new Error(errorMsg);
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

  if (!response.success) {
    const errorMsg = response.error?.message || "Failed to fetch worlds";
    throw new Error(errorMsg);
  }

  return response.data || [];
}

export async function getWorldById(worldId: string) {
  const response = await apiRequest<ApiResponse<World>>(
    `/api/worlds/${worldId}`
  );

  if (!response.success) {
    const errorMsg = response.error?.message || "Failed to fetch world";
    throw new Error(errorMsg);
  }

  return response.data;
}

export async function getWorldsByRoadmap(roadmapId: string) {
  const response = await apiRequest<ApiResponse<World[]>>(
    `/api/worlds/roadmap/${roadmapId}`
  );

  if (!response.success) {
    const errorMsg = response.error?.message || "Failed to fetch worlds";
    throw new Error(errorMsg);
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

  if (!response.success) {
    const errorMsg = response.error?.message || "Failed to fetch age groups";
    throw new Error(errorMsg);
  }

  return response.data || [];
}

export async function getAgeGroupById(ageGroupId: string) {
  const response = await apiRequest<ApiResponse<AgeGroup>>(
    `/api/age-groups/${ageGroupId}`
  );

  if (!response.success) {
    const errorMsg = response.error?.message || "Failed to fetch age group";
    throw new Error(errorMsg);
  }

  return response.data;
}

/**
 * ============================================
 * THEME ENDPOINTS
 * ============================================
 */

export async function getThemes() {
  const response = await apiRequest<ApiResponse<Theme[]>>("/api/themes");

  if (!response.success) {
    const errorMsg = response.error?.message || "Failed to fetch themes";
    throw new Error(errorMsg);
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

  if (!response.success) {
    const errorMsg = response.error?.message || "Failed to fetch challenges";
    throw new Error(errorMsg);
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

  if (!response.success) {
    const errorMsg = response.error?.message || "Failed to fetch challenge";
    throw new Error(errorMsg);
  }

  return response.data;
}

export async function getChallengesByChapter(chapterId: string) {
  const response = await apiRequest<ApiResponse<Challenge[]>>(
    `/api/challenges/chapter/${chapterId}`
  );

  if (!response.success) {
    const errorMsg = response.error?.message || "Failed to fetch challenges";
    throw new Error(errorMsg);
  }

  return response.data || [];
}

