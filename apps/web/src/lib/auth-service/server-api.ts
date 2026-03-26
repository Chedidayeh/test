/**
 * Auth Service Server API
 *
 * RSC (React Server Component) layer for frontend to communicate with Auth Service
 * through the Gateway. All requests are authenticated via JWT from NextAuth session.
 *
 * Pattern follows content-service/server-api.ts for consistency.
 */

import type { ApiResponse, Child, User } from "@readdly/shared-types";
import { getBadgeByLevel } from "../content-service/server-api";
import { apiRequest, buildQueryString, isApiError } from "../helpers";

interface PaginationParams {
  limit?: number;
  offset?: number;
}

/**
 * ============================================
 * AUTH ENDPOINTS (Login / Register)
 * ============================================
 */

export async function loginUser(payload: { email: string; password: string }) {
  console.log("[Auth Service API] Logging in user:", payload.email);

  const response = await apiRequest<ApiResponse<{ token: string; user: User }>>(
    `/auth/login`,
    {
      method: "POST",
      body: JSON.stringify(payload),
    },
  );

  if (isApiError(response)) {
    console.warn("[Auth Service API] Login failed:", response.error.message);
    return { valid: false, message: response.error.message };
  }

  return { valid: true, data: response };
}

export async function registerUser(payload: {
  email: string;
  password: string;
  name: string;
}) {
  console.log("[Auth Service API] Registering user:", payload.email);

  const response = await apiRequest<ApiResponse<User>>(`/auth/register`, {
    method: "POST",
    body: JSON.stringify(payload),
  });

  if (isApiError(response)) {
    console.warn(
      "[Auth Service API] Registration failed:",
      response.error.message,
    );
    return { success: false, error: response.error.message };
  }

  return response;
}

/**
 * ============================================
 * PARENT ENDPOINTS
 * ============================================
 */

export async function getParents(params?: PaginationParams) {
  const queryString = buildQueryString(params || {});
  console.log("[Auth Service API] Fetching parents with params:", params);

  const response = await apiRequest<ApiResponse<User[]>>(
    `/auth/parents${queryString}`,
  );

  if (isApiError(response)) {
    console.warn(
      "[Auth Service API] Failed to fetch parents:",
      response.error.message,
    );
    return {
      parents: [],
      pagination: undefined,
    };
  }

  if (!response.success) {
    console.warn(
      "[Auth Service API] Failed to fetch parents: API returned success=false",
    );
    return {
      parents: [],
      pagination: undefined,
    };
  }

  return {
    parents: response.data || [],
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

export async function getParentById(parentId: string) {
  console.log("[Auth Service API] Fetching parent by ID:", parentId);

  const response = await apiRequest<ApiResponse<User>>(
    `/auth/parent/${parentId}`,
  );

  if (isApiError(response)) {
    console.warn(
      "[Auth Service API] Failed to fetch parent:",
      response.error.message,
    );
    return null;
  }

  if (!response.success) {
    console.warn(
      "[Auth Service API] Failed to fetch parent: API returned success=false",
    );
    return null;
  }

  return response.data || null;
}

/**
 * ============================================
 * CHILD ENDPOINTS
 * ============================================
 */

export async function createChildProfile(payload: {
  parentEmail: string;
  parentId: string;
  name: string;
  gender: string;
  ageGroupId: string;
  ageGroupName: string;
  themeIds: string[];
  allocatedRoadmaps: string[];
}) {
  console.log("[Auth Service API] Creating child profile:", payload);

  const badge = await getBadgeByLevel(1); // Get badge ID for level 1 (new child)
  console.log("[Auth Service API] Retrieved badge ID for new child:", badge);

  const response = await apiRequest<ApiResponse<Child>>(`/auth/children`, {
    method: "POST",
    body: JSON.stringify({ ...payload, badgeId: badge?.id }),
  });

  if (isApiError(response)) {
    console.warn(
      "[Auth Service API] Failed to create child profile:",
      response.error.message,
    );
    return null;
  }

  if (!response.success) {
    console.warn(
      "[Auth Service API] Failed to create child profile: API returned success=false",
    );
    return null;
  }

  return response.data || null;
}
