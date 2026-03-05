"use server";

import {
  Story,
  AgeGroup,
  Theme,
  Roadmap,
  World,
  Level,
  ServiceResponse,
  CreateStoryWithChaptersInput,
  ApiResponse,
  AgeGroupContentValidationResult,
} from "@shared/types";
import {
  getStories,
  StoryQueryParams,
  getStoriesByIds,
  createAgeGroup,
  updateAgeGroup,
  deleteAgeGroup,
  validateAgeGroupReadiness,
  createTheme,
  updateTheme,
  deleteTheme,
  createRoadmap,
  updateRoadmap,
  deleteRoadmap,
  createWorld,
  updateWorld,
  deleteWorld,
  deleteStory,
  createStoryWithChapters,
  editStoryWithChapters,
  createLevel,
  updateLevel,
  deleteLevel,
} from "./server-api";

type FetchStoriesResult =
  | {
      success: true;
      data: {
        stories: Story[];
        pagination:
          | {
              total: number;
              page: number;
              pageSize: number;
              hasMore: boolean;
            }
          | undefined;
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
export async function fetchStoriesAction(
  params?: StoryQueryParams,
): Promise<FetchStoriesResult> {
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
 * Server Action for fetching multiple stories by IDs
 * Batch fetch is more efficient than individual requests
 * Returns stories as a serializable array instead of Map
 */
export async function fetchStoriesByIdsAction(storyIds: string[]): Promise<{
  success: boolean;
  stories: Story[];
  error?: string;
}> {
  try {
    const storyMap = await getStoriesByIds(storyIds);
    const stories = Array.from(storyMap.values());
    return {
      success: true,
      stories,
    };
  } catch (error) {
    console.error("Server action error fetching stories by IDs:", error);
    return {
      success: false,
      stories: [],
      error:
        error instanceof Error
          ? error.message
          : "Failed to fetch stories by IDs",
    };
  }
}

/**
 * ============================================
 * AGE GROUP ACTIONS
 * ============================================
 */

export async function createAgeGroupAction(
  data: Omit<
    AgeGroup,
    "id" | "createdAt" | "updatedAt" | "roadmaps" | "translations"
  > & {
    translationSource?: string;
    translations?: Array<{ languageCode: string; name: string }>;
  },
): Promise<ServiceResponse<AgeGroup>> {
  try {
    // Extract translation data
    const { translationSource, translations, ...ageGroupData } = data;

    // Pass translations to the API
    const apiPayload = {
      ...ageGroupData,
      ...(translations && { translations, translationSource }),
    };

    const result = await createAgeGroup(apiPayload);

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
      error:
        error instanceof Error ? error.message : "Failed to create age group",
    };
  }
}

export async function updateAgeGroupAction(
  id: string,
  data: Partial<
    Omit<
      AgeGroup,
      "id" | "createdAt" | "updatedAt" | "roadmaps" | "translations"
    >
  > & {
    translationSource?: string;
    translations?: Array<{ languageCode: string; name: string }>;
  },
): Promise<ServiceResponse<AgeGroup>> {
  try {
    // Extract translation data
    const { translationSource, translations, ...ageGroupData } = data;

    // Pass translations to the API
    const apiPayload = {
      ...ageGroupData,
      ...(translations && { translations, translationSource }),
    };

    const result = await updateAgeGroup(id, apiPayload);

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
      error:
        error instanceof Error ? error.message : "Failed to update age group",
    };
  }
}

export async function deleteAgeGroupAction(
  id: string,
): Promise<ServiceResponse<void>> {
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
      error:
        error instanceof Error ? error.message : "Failed to delete age group",
    };
  }
}

/**
 * Server Action to validate age group content completeness
 * Checks if all roadmaps have worlds, stories, and chapters
 */
export async function validateAgeGroupReadinessAction(
  ageGroupId: string,
): Promise<ServiceResponse<AgeGroupContentValidationResult | undefined>> {
  try {
    const result = await validateAgeGroupReadiness(ageGroupId);

    if (!result.success) {
      return {
        success: false,
        error: result.error,
      };
    }

    return {
      success: true,
      data: result.data,
    };
  } catch (error) {
    console.error("Server action error validating age group readiness:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to validate age group readiness",
    };
  }
}

/**
 * ============================================
 * THEME ACTIONS
 * ============================================
 */

export async function createThemeAction(
  data: Omit<
    Theme,
    "id" | "createdAt" | "updatedAt" | "roadmap" | "translations"
  > & {
    translationSource?: string;
    translations?: Array<{ languageCode: string; name: string }>;
  },
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
  data: Partial<
    Omit<Theme, "id" | "createdAt" | "updatedAt" | "roadmap" | "translations">
  > & {
    translationSource?: string;
    translations?: Array<{ languageCode: string; name: string }>;
  },
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

export async function deleteThemeAction(
  id: string,
): Promise<ServiceResponse<void>> {
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
  data: Omit<
    Roadmap,
    | "id"
    | "createdAt"
    | "updatedAt"
    | "ageGroup"
    | "theme"
    | "worlds"
    | "translations"
  > & {
    translationSource?: string;
    translations?: Array<{ languageCode: string; title: string }>;
  },
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
      error:
        error instanceof Error ? error.message : "Failed to create roadmap",
    };
  }
}

export async function updateRoadmapAction(
  id: string,
  data: Partial<
    Omit<
      Roadmap,
      | "id"
      | "createdAt"
      | "updatedAt"
      | "ageGroup"
      | "theme"
      | "worlds"
      | "translations"
    >
  > & {
    translationSource?: string;
    translations?: Array<{ languageCode: string; title: string }>;
  },
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
      error:
        error instanceof Error ? error.message : "Failed to update roadmap",
    };
  }
}

export async function deleteRoadmapAction(
  id: string,
): Promise<ServiceResponse<void>> {
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
      error:
        error instanceof Error ? error.message : "Failed to delete roadmap",
    };
  }
}

/**
 * ============================================
 * WORLD ACTIONS
 * ============================================
 */

export async function createWorldAction(
  data: Omit<
    World,
    "id" | "createdAt" | "updatedAt" | "roadmap" | "stories" | "translations"
  > & {
    translationSource?: string;
    translations?: Array<{ languageCode: string; name: string }>;
  },
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
  data: Partial<
    Omit<
      World,
      "id" | "createdAt" | "updatedAt" | "roadmap" | "stories" | "translations"
    >
  > & {
    translationSource?: string;
    translations?: Array<{ languageCode: string; name: string }>;
  },
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

export async function deleteWorldAction(
  id: string,
): Promise<ServiceResponse<void>> {
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

/**
 * ============================================
 * STORY ACTIONS
 * ============================================
 */

/**
 * Create a story with chapters, challenges, and answers in a single atomic transaction
 */
export async function createStoryWithChaptersAction(
  data: CreateStoryWithChaptersInput,
): Promise<ApiResponse<Story>> {
  try {
    const result = await createStoryWithChapters(data);

    if (!result.success) {
      return {
        success: false,
        error: {
          code: "STORY_CREATION_FAILED",
          message: result.error,
        },
      };
    }

    return {
      success: true,
      data: result.data,
    };
  } catch (error) {
    console.error("Server action error creating story with chapters:", error);
    return {
      success: false,
      error: {
        code: "STORY_CREATION_FAILED",
        message:
          error instanceof Error
            ? error.message
            : "Failed to create story with chapters",
      },
    };
  }
}

/**
 * Edit a story with chapters, challenges, and answers in a single atomic transaction
 */
export async function editStoryWithChaptersAction(
  storyId: string,
  data: CreateStoryWithChaptersInput,
): Promise<ApiResponse<Story>> {
  try {
    const result = await editStoryWithChapters(storyId, data);

    if (!result.success) {
      return {
        success: false,
        error: {
          code: "STORY_EDIT_FAILED",
          message: result.error,
        },
      };
    }

    return {
      success: true,
      data: result.data,
    };
  } catch (error) {
    console.error("Server action error editing story with chapters:", error);
    return {
      success: false,
      error: {
        code: "STORY_EDIT_FAILED",
        message:
          error instanceof Error
            ? error.message
            : "Failed to edit story with chapters",
      },
    };
  }
}

export async function deleteStoryAction(
  id: string,
): Promise<ServiceResponse<void>> {
  try {
    const result = await deleteStory(id);

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
    console.error("Server action error deleting story:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to delete story",
    };
  }
}

/**
 * ============================================
 * LEVEL ACTIONS
 * ============================================
 */

export async function createLevelAction(
  data: Omit<Level, "id" | "createdAt" | "updatedAt" | "badge"> & {
    badge?: {
      name: string;
      description?: string;
      iconUrl?: string;
    };
  },
  autoTranslateBadge: boolean = false,
  translationSource?: string,
  translations?: Array<{
    languageCode: string;
    name: string;
    description?: string;
  }>,
): Promise<ServiceResponse<Level>> {
  try {
    const result = await createLevel(
      data,
      autoTranslateBadge,
      translationSource,
      translations,
    );

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
    console.error("[Content Server Actions] Failed to create level:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create level",
    };
  }
}

export async function updateLevelAction(
  id: string,
  data: Partial<Omit<Level, "id" | "createdAt" | "updatedAt" | "badge">> & {
    badge?: {
      id: string;
      name: string;
      description?: string;
      iconUrl?: string;
    };
    translations?: Array<{
      languageCode: string;
      name: string;
      description?: string;
    }>;
  },
  autoTranslateBadge: boolean = false,
  translationSource?: string,
): Promise<ServiceResponse<Level>> {
  try {
    const result = await updateLevel(
      id,
      data,
      autoTranslateBadge,
      translationSource,
    );

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
    console.error("Server action error updating level:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update level",
    };
  }
}

export async function deleteLevelAction(
  id: string,
): Promise<ServiceResponse<void>> {
  try {
    const result = await deleteLevel(id);

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
    console.error("Server action error deleting level:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to delete level",
    };
  }
}
