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
  User,
} from "@shared/types";

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
): Promise<T> {
  const url = `${getGatewayUrl()}${endpoint}`;

  // Get JWT token from NextAuth session
  const session = await auth();
  const token = (session?.user as any)?.token;

  if (!token) {
    console.warn(
      "[Auth Service API] No JWT token found - user may not be authenticated",
      { hasSession: !!session, hasUser: !!session?.user }
    );
  } else {
    console.log("[Auth Service API] JWT token found, length:", token.length);
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

      throw new Error(
        `API Error ${response.status}: ${error.error || error.message || "Unknown error"}`
      );
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error(`[Auth Service API] Request error: ${endpoint}`, error);
    throw error;
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

  if (!response.success) {
    const errorMsg = response.error?.message || "Failed to fetch parents";
    throw new Error(errorMsg);
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
    `/api/auth/parents/${parentId}`
  );

  if (!response.success) {
    const errorMsg = response.error?.message || "Failed to fetch parent";
    throw new Error(errorMsg);
  }

  return response.data;
}

