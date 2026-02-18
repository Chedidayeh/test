"use server";

import { Story } from "@shared/types";
import { getStories, StoryQueryParams } from "./server-api";

type FetchStoriesResult = 
  | {
      success: true;
      data: {
        stories: Story[];
        pagination: {
          total: number;
          page: number;
          pageSize: number;
          hasMore: boolean;
        } | undefined
      };
    }
  | {
      success: false;
      error: string;
    };

/**
 * Server Action for fetching stories with pagination
 * This can be called from client components to fetch data server-side
 */
export async function fetchStoriesAction(params?: StoryQueryParams): Promise<FetchStoriesResult> {
  try {
    const result = await getStories(params);
    return {
      success: true,
      data: result,
    };
  } catch (error) {
    console.error("Server action error fetching stories:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to fetch stories",
    };
  }
}
