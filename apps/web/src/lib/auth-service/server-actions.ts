"use server";

/**
 * Server Actions for Auth Service
 * 
 * Used by client components to fetch data from server-side API
 * Wraps server-api calls and returns structured responses
 */

import { getParents } from "./server-api";
import { ApiResponse, User } from "@shared/types";

interface PaginationParams {
  limit?: number;
  offset?: number;
}

export interface FetchParentsResult {
  success: boolean;
  data?: {
    parents: User[];
    pagination?: {
      total: number;
      page: number;
      pageSize: number;
      hasMore: boolean;
    };
  };
  error?: string;
}

/**
 * Server action to fetch parents with pagination
 * Called from client components to load different pages
 */
export async function fetchParentsAction(
  params: PaginationParams
): Promise<FetchParentsResult> {
  try {
    const result = await getParents(params);
    
    return {
      success: true,
      data: {
        parents: result.parents,
        pagination: result.pagination,
      },
    };
  } catch (error) {
    const errorMsg =
      error instanceof Error ? error.message : "Failed to fetch parents";
    
    console.error("[Auth Service] fetchParentsAction error:", errorMsg);
    
    return {
      success: false,
      error: errorMsg,
    };
  }
}
