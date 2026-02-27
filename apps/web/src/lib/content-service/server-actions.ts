"use server";

import {
  Story,
  Chapter,
  Challenge,
  Answer,
  AgeGroup,
  Theme,
  Roadmap,
  World,
  ServiceResponse,
  CreateStoryWithChaptersInput,
  ApiResponse,
  AgeGroupContentValidationResult,
} from "@shared/types";
import {
  getStories,
  StoryQueryParams,
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
  createStory,
  updateStory,
  deleteStory,
  createStoryWithChapters,
  editStoryWithChapters,
  createChapter,
  updateChapter,
  deleteChapter,
  createChallenge,
  updateChallenge,
  deleteChallenge,
  createAnswer,
  updateAnswer,
  deleteAnswer,
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
 * ============================================
 * AGE GROUP ACTIONS
 * ============================================
 */

export async function createAgeGroupAction(
  data: Omit<AgeGroup, "id" | "createdAt" | "updatedAt" | "roadmaps">,
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
      error:
        error instanceof Error ? error.message : "Failed to create age group",
    };
  }
}

export async function updateAgeGroupAction(
  id: string,
  data: Partial<Omit<AgeGroup, "id" | "createdAt" | "updatedAt" | "roadmaps">>,
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
        error instanceof Error ? error.message : "Failed to validate age group readiness",
    };
  }
}

/**
 * ============================================
 * THEME ACTIONS
 * ============================================
 */

export async function createThemeAction(
  data: Omit<Theme, "id" | "createdAt" | "updatedAt" | "roadmap">,
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
  data: Partial<Omit<Theme, "id" | "createdAt" | "updatedAt" | "roadmap">>,
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
    "id" | "createdAt" | "updatedAt" | "ageGroup" | "theme" | "worlds"
  >,
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
      "id" | "createdAt" | "updatedAt" | "ageGroup" | "theme" | "worlds"
    >
  >,
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
  data: Omit<World, "id" | "createdAt" | "updatedAt" | "roadmap" | "stories">,
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
    Omit<World, "id" | "createdAt" | "updatedAt" | "roadmap" | "stories">
  >,
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

export async function createStoryAction(
  data: Omit<Story, "id" | "createdAt" | "updatedAt" | "world" | "chapters">,
): Promise<ServiceResponse<Story>> {
  try {
    const result = await createStory(data);

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
    console.error("Server action error creating story:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create story",
    };
  }
}

export async function updateStoryAction(
  id: string,
  data: Partial<
    Omit<Story, "id" | "createdAt" | "updatedAt" | "world" | "chapters">
  >,
): Promise<ServiceResponse<Story>> {
  try {
    const result = await updateStory(id, data);

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
    console.error("Server action error updating story:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update story",
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
          error instanceof Error ? error.message : "Failed to create story with chapters",
      }
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
          error instanceof Error ? error.message : "Failed to edit story with chapters",
      }
    };
  }
}

/**
 * ============================================
 * CHAPTER ACTIONS
 * ============================================
 */

export async function createChapterAction(
  data: Omit<Chapter, "id" | "createdAt" | "updatedAt" | "story">,
): Promise<ServiceResponse<Chapter>> {
  try {
    const result = await createChapter(data);

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
    console.error("Server action error creating chapter:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to create chapter",
    };
  }
}

export async function updateChapterAction(
  id: string,
  data: Partial<Omit<Chapter, "id" | "createdAt" | "updatedAt" | "story">>,
): Promise<ServiceResponse<Chapter>> {
  try {
    const result = await updateChapter(id, data);

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
    console.error("Server action error updating chapter:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to update chapter",
    };
  }
}

export async function deleteChapterAction(
  id: string,
): Promise<ServiceResponse<void>> {
  try {
    const result = await deleteChapter(id);

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
    console.error("Server action error deleting chapter:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to delete chapter",
    };
  }
}

/**
 * ============================================
 * CHALLENGE ACTIONS
 * ============================================
 */

export async function createChallengeAction(
  data: Omit<
    Challenge,
    "id" | "createdAt" | "updatedAt" | "chapter" | "answers"
  >,
): Promise<ServiceResponse<Challenge>> {
  try {
    const result = await createChallenge(data);

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
    console.error("Server action error creating challenge:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to create challenge",
    };
  }
}

export async function updateChallengeAction(
  id: string,
  data: Partial<
    Omit<Challenge, "id" | "createdAt" | "updatedAt" | "chapter" | "answers">
  >,
): Promise<ServiceResponse<Challenge>> {
  try {
    const result = await updateChallenge(id, data);

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
    console.error("Server action error updating challenge:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to update challenge",
    };
  }
}

export async function deleteChallengeAction(
  id: string,
): Promise<ServiceResponse<void>> {
  try {
    const result = await deleteChallenge(id);

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
    console.error("Server action error deleting challenge:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to delete challenge",
    };
  }
}

/**
 * ============================================
 * ANSWER ACTIONS
 * ============================================
 */

export async function createAnswerAction(
  data: Omit<Answer, "id" | "createdAt" | "updatedAt">,
): Promise<ServiceResponse<Answer>> {
  try {
    const result = await createAnswer(data);

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
    console.error("Server action error creating answer:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create answer",
    };
  }
}

export async function updateAnswerAction(
  id: string,
  data: Partial<Omit<Answer, "id" | "createdAt" | "updatedAt">>,
): Promise<ServiceResponse<Answer>> {
  try {
    const result = await updateAnswer(id, data);

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
    console.error("Server action error updating answer:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update answer",
    };
  }
}

export async function deleteAnswerAction(
  id: string,
): Promise<ServiceResponse<void>> {
  try {
    const result = await deleteAnswer(id);

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
    console.error("Server action error deleting answer:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to delete answer",
    };
  }
}
