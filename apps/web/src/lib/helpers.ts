/* eslint-disable @typescript-eslint/no-explicit-any */

import { API_BASE_URL_V1 } from "@readdly/shared-types";
import { auth } from "../auth";

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
export function isApiError(response: any): response is ApiError {
  return response && "error" in response && response.success === false;
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
export function buildQueryString(params: Record<string, any>): string {
  const filtered = Object.entries(params)
    .filter(([, value]) => value !== undefined && value !== null)
    .map(
      ([key, value]) =>
        `${encodeURIComponent(key)}=${encodeURIComponent(value)}`,
    )
    .join("&");

  return filtered ? `?${filtered}` : "";
}

/**
 * Make a server-side API request to Auth Service via Gateway
 * This function is RSC-safe and extracts JWT from NextAuth session
 */

export async function apiRequest<T = any>(
  endpoint: string,
  options?: RequestInit,
): Promise<T | ApiError> {
  const url = `${getGatewayUrl()}${API_BASE_URL_V1}${endpoint}`;

  // Get JWT token from NextAuth session
  const session = await auth();
  const token = (session?.user as any)?.token;

  if (!token) {
    console.warn(
      "[Auth Service API] No JWT token found - user may not be authenticated",
      { hasSession: !!session, hasUser: !!session?.user },
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
        message:
          error instanceof Error ? error.message : "Unknown error occurred",
      },
    } as ApiError;
  }
}
