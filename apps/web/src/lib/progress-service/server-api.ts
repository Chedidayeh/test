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
import type { ApiResponse, ChildProfile } from "@shared/types";

export interface PaginationParams {
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
 * Make a server-side API request to Gateway
 * This function is RSC-safe and extracts JWT from NextAuth session
 */
async function apiRequest<T = any>(
  endpoint: string,
  options?: RequestInit,
): Promise<T> {
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

      throw new Error(
        `API Error ${response.status}: ${error.error || error.message || "Unknown error"}`,
      );
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error(`[Progress Service API] Request error: ${endpoint}`, error);
    throw error;
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
  console.log("[Progress Service API] Received response for progress service:", {
    success: response.success,
    dataLength: response.data?.length,
    pagination: response.pagination,
  });

  if (!response.success) {
    const errorMsg = response.error?.message || "Failed to fetch children";
    throw new Error(errorMsg);
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

  if (!response.success) {
    const errorMsg = response.error?.message || "Failed to fetch child";
    throw new Error(errorMsg);
  }

  return response.data;
}

