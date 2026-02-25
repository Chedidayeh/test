"use server";

import { 
  Story, 
  AgeGroup, 
  Theme, 
  Roadmap, 
  World,
  ServiceResponse 
} from "@shared/types";
import { 
  getStories, 
  StoryQueryParams,
  createAgeGroup,
  updateAgeGroup,
  deleteAgeGroup,
  createTheme,
  updateTheme,
  deleteTheme,
  createRoadmap,
  updateRoadmap,
  deleteRoadmap,
  createWorld,
  updateWorld,
  deleteWorld,
} from "./server-api";

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

/**
 * ============================================
 * AGE GROUP ACTIONS
 * ============================================
 */

export async function createAgeGroupAction(
  data: Omit<AgeGroup, "id" | "createdAt" | "updatedAt" | "roadmaps">
): Promise<ServiceResponse<AgeGroup>> {
  try {
    const result = await createAgeGroup(data);
    
    if (!result.success) {
      return {
        success: false,
        error: result.error,
      };
    }

    return {
      success: true,
      data: result.data!,
    };
  } catch (error) {
    console.error("Server action error creating age group:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create age group",
    };
  }
}

export async function updateAgeGroupAction(
  id: string,
  data: Partial<Omit<AgeGroup, "id" | "createdAt" | "updatedAt" | "roadmaps">>
): Promise<ServiceResponse<AgeGroup>> {
  try {
    const result = await updateAgeGroup(id, data);
    
    if (!result.success) {
      return {
        success: false,
        error: result.error,
      };
    }

    return {
      success: true,
      data: result.data!,
    };
  } catch (error) {
    console.error("Server action error updating age group:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update age group",
    };
  }
}

export async function deleteAgeGroupAction(id: string): Promise<ServiceResponse<void>> {
  try {
    const result = await deleteAgeGroup(id);
    
    if (!result.success) {
      return {
        success: false,
        error: result.error,
      };
    }

    return {
      success: true,
      data: undefined,
    };
  } catch (error) {
    console.error("Server action error deleting age group:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to delete age group",
    };
  }
}

/**
 * ============================================
 * THEME ACTIONS
 * ============================================
 */

export async function createThemeAction(
  data: Omit<Theme, "id" | "createdAt" | "updatedAt" | "roadmap">
): Promise<ServiceResponse<Theme>> {
  try {
    const result = await createTheme(data);
    
    if (!result.success) {
      return {
        success: false,
        error: result.error,
      };
    }

    return {
      success: true,
      data: result.data!,
    };
  } catch (error) {
    console.error("Server action error creating theme:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create theme",
    };
  }
}

export async function updateThemeAction(
  id: string,
  data: Partial<Omit<Theme, "id" | "createdAt" | "updatedAt" | "roadmap">>
): Promise<ServiceResponse<Theme>> {
  try {
    const result = await updateTheme(id, data);
    
    if (!result.success) {
      return {
        success: false,
        error: result.error,
      };
    }

    return {
      success: true,
      data: result.data!,
    };
  } catch (error) {
    console.error("Server action error updating theme:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update theme",
    };
  }
}

export async function deleteThemeAction(id: string): Promise<ServiceResponse<void>> {
  try {
    const result = await deleteTheme(id);
    
    if (!result.success) {
      return {
        success: false,
        error: result.error,
      };
    }

    return {
      success: true,
      data: undefined,
    };
  } catch (error) {
    console.error("Server action error deleting theme:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to delete theme",
    };
  }
}

/**
 * ============================================
 * ROADMAP ACTIONS
 * ============================================
 */

export async function createRoadmapAction(
  data: Omit<Roadmap, "id" | "createdAt" | "updatedAt" | "ageGroup" | "theme" | "worlds">
): Promise<ServiceResponse<Roadmap>> {
  try {
    const result = await createRoadmap(data);
    
    if (!result.success) {
      return {
        success: false,
        error: result.error,
      };
    }

    return {
      success: true,
      data: result.data!,
    };
  } catch (error) {
    console.error("Server action error creating roadmap:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create roadmap",
    };
  }
}

export async function updateRoadmapAction(
  id: string,
  data: Partial<Omit<Roadmap, "id" | "createdAt" | "updatedAt" | "ageGroup" | "theme" | "worlds">>
): Promise<ServiceResponse<Roadmap>> {
  try {
    const result = await updateRoadmap(id, data);
    
    if (!result.success) {
      return {
        success: false,
        error: result.error,
      };
    }

    return {
      success: true,
      data: result.data!,
    };
  } catch (error) {
    console.error("Server action error updating roadmap:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update roadmap",
    };
  }
}

export async function deleteRoadmapAction(id: string): Promise<ServiceResponse<void>> {
  try {
    const result = await deleteRoadmap(id);
    
    if (!result.success) {
      return {
        success: false,
        error: result.error,
      };
    }

    return {
      success: true,
      data: undefined,
    };
  } catch (error) {
    console.error("Server action error deleting roadmap:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to delete roadmap",
    };
  }
}

/**
 * ============================================
 * WORLD ACTIONS
 * ============================================
 */

export async function createWorldAction(
  data: Omit<World, "id" | "createdAt" | "updatedAt" | "roadmap" | "stories">
): Promise<ServiceResponse<World>> {
  try {
    const result = await createWorld(data);
    
    if (!result.success) {
      return {
        success: false,
        error: result.error,
      };
    }

    return {
      success: true,
      data: result.data!,
    };
  } catch (error) {
    console.error("Server action error creating world:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create world",
    };
  }
}

export async function updateWorldAction(
  id: string,
  data: Partial<Omit<World, "id" | "createdAt" | "updatedAt" | "roadmap" | "stories">>
): Promise<ServiceResponse<World>> {
  try {
    const result = await updateWorld(id, data);
    
    if (!result.success) {
      return {
        success: false,
        error: result.error,
      };
    }

    return {
      success: true,
      data: result.data!,
    };
  } catch (error) {
    console.error("Server action error updating world:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update world",
    };
  }
}

export async function deleteWorldAction(id: string): Promise<ServiceResponse<void>> {
  try {
    const result = await deleteWorld(id);
    
    if (!result.success) {
      return {
        success: false,
        error: result.error,
      };
    }

    return {
      success: true,
      data: undefined,
    };
  } catch (error) {
    console.error("Server action error deleting world:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to delete world",
    };
  }
}
