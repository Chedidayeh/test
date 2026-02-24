/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Auth Service Server API
 * 
 * RSC (React Server Component) layer for frontend to communicate with Auth Service
 * through the Gateway. All requests are authenticated via JWT from NextAuth session.
 * 
 * Pattern follows content-service/server-api.ts for consistency.
 */

import { auth } from "@/src/auth";
import type {
  ApiResponse,
  Child,
  User,
} from "@shared/types";
import { getBadgeByLevel } from "../content-service/server-api";

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
 * Make a server-side API request to Auth Service via Gateway
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
      "[Auth Service API] No JWT token found - user may not be authenticated",
      { hasSession: !!session, hasUser: !!session?.user }
    );
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

      console.error(`[Auth Service API] Request failed: ${endpoint}`, {
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
    console.error(`[Auth Service API] Request error: ${endpoint}`, error);
    
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
 * PARENT ENDPOINTS
 * ============================================
 */

export async function getParents(params?: PaginationParams) {
  const queryString = buildQueryString(params || {});
  console.log("[Auth Service API] Fetching parents with params:", params);

  const response = await apiRequest<ApiResponse<User[]>>(
    `/api/auth/parents${queryString}`
  );

  if (isApiError(response)) {
    console.warn("[Auth Service API] Failed to fetch parents:", response.error.message);
    return {
      parents: [],
      pagination: undefined,
    };
  }

  if (!response.success) {
    console.warn("[Auth Service API] Failed to fetch parents: API returned success=false");
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
    `/api/auth/parent/${parentId}`
  );

  if (isApiError(response)) {
    console.warn("[Auth Service API] Failed to fetch parent:", response.error.message);
    return null;
  }

  if (!response.success) {
    console.warn("[Auth Service API] Failed to fetch parent: API returned success=false");
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
  ageGroupId: string;
  themeIds: string[];
}) {
  console.log("[Auth Service API] Creating child profile:", payload);

  const badge = await getBadgeByLevel(1); // Get badge ID for level 1 (new child)
  console.log("[Auth Service API] Retrieved badge ID for new child:", badge);

  const response = await apiRequest<ApiResponse<Child>>(
    `/api/auth/children`,
    {
      method: "POST",
      body: JSON.stringify({ ...payload, badgeId: badge?.id }),
    }
  );

  if (isApiError(response)) {
    console.warn("[Auth Service API] Failed to create child profile:", response.error.message);
    return null;
  }

  if (!response.success) {
    console.warn("[Auth Service API] Failed to create child profile: API returned success=false");
    return null;
  }

  return response.data || null;
}

