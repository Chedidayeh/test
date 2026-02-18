"use server";

import { ChildProfile } from "@shared/types";
import { getAllChildren, PaginationParams } from "./server-api";

type FetchChildrenResult =
  | {
      success: true;
      data: {
        children: ChildProfile[];
        pagination: {
          total: number;
          page: number;
          pageSize: number;
          hasMore: boolean;
        } | undefined;
      };
    }
  | {
      success: false;
      error: string;
    };

/**
 * Server Action for fetching children with pagination
 * This can be called from client components to fetch data server-side
 */
export async function fetchChildrenAction(
  params?: PaginationParams,
): Promise<FetchChildrenResult> {
  try {
    const result = await getAllChildren(params);
    return {
      success: true,
      data: result,
    };
  } catch (error) {
    console.error("Server action error fetching children:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to fetch children",
    };
  }
}
