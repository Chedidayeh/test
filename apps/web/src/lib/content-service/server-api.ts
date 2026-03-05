/**
 * Server-Side API Utility for RSCs (React Server Components)
 * Makes direct fetch calls from the server with JWT authentication
 * Used in Next.js Server Components and Server Actions
 */

import type {
  ApiResponse,
  Story,
  Roadmap,
  World,
  AgeGroup,
  Theme,
  Level,
  Badge,
  CreateStoryWithChaptersInput,
  AgeGroupContentValidationResult,
} from "@shared/types";
import { apiRequest, buildQueryString, isApiError } from "../helpers";

interface PaginationParams {
  limit?: number;
  offset?: number;
}

export interface StoryQueryParams extends PaginationParams {
  worldId?: string;
  difficulty?: number;
  isMandatory?: boolean;
}

/**
 * ============================================
 * STORY ENDPOINTS
 * ============================================
 */

export async function getStories(params?: StoryQueryParams) {
  const queryString = buildQueryString(params || {});
  console.log("[Content Server API] Fetching stories with params:", params);
  const response = await apiRequest<ApiResponse<Story[]>>(
    `/stories${queryString}`,
  );

  if (isApiError(response)) {
    console.warn(
      "[Content Server API] Failed to fetch stories:",
      response.error.message,
    );
    return {
      stories: [],
      pagination: undefined,
    };
  }

  if (!response.success) {
    console.warn(
      "[Content Server API] Failed to fetch stories: API returned success=false",
    );
    return {
      stories: [],
      pagination: undefined,
    };
  }

  return {
    stories: response.data || [],
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

export async function getStoryById(storyId: string) {
  const response = await apiRequest<ApiResponse<Story>>(`/stories/${storyId}`);

  if (isApiError(response)) {
    console.warn(
      "[Content Server API] Failed to fetch story:",
      response.error.message,
    );
    return null;
  }

  if (!response.success) {
    console.warn(
      "[Content Server API] Failed to fetch story: API returned success=false",
    );
    return null;
  }

  return response.data || null;
}

export async function getStoriesByWorld(worldId: string) {
  const response = await apiRequest<ApiResponse<Story[]>>(
    `/stories/world/${worldId}`,
  );

  if (isApiError(response)) {
    console.warn(
      "[Content Server API] Failed to fetch stories by world:",
      response.error.message,
    );
    return [];
  }

  if (!response.success) {
    console.warn(
      "[Content Server API] Failed to fetch stories by world: API returned success=false",
    );
    return [];
  }

  return response.data || [];
}

export async function getStoriesCount() {
  const response =
    await apiRequest<ApiResponse<{ count: number }>>(`/stories/count`);

  if (isApiError(response)) {
    console.warn(
      "[Content Server API] Failed to fetch stories count:",
      response.error.message,
    );
    return 0;
  }

  if (!response.success) {
    console.warn(
      "[Content Server API] Failed to fetch stories count: API returned success=false",
    );
    return 0;
  }

  return response.data?.count || 0;
}

/**
 * Fetch multiple stories by their IDs in a single batch request
 * More efficient than making multiple individual getStoryById() calls
 * @param storyIds - Array of story IDs to fetch
 * @returns Map of storyId -> Story for efficient lookup
 */
export async function getStoriesByIds(
  storyIds: string[],
): Promise<Map<string, Story>> {
  if (!storyIds || storyIds.length === 0) {
    return new Map();
  }

  // Remove duplicates
  const uniqueIds = Array.from(new Set(storyIds));

  // Build query string with comma-separated IDs
  const queryString = buildQueryString({ ids: uniqueIds.join(",") });

  console.log("[Content Server API] Fetching stories by IDs:", uniqueIds);
  const response = await apiRequest<ApiResponse<Story[]>>(
    `/stories${queryString}`,
  );

  if (isApiError(response)) {
    console.warn(
      "[Content Server API] Failed to fetch stories by IDs:",
      response.error.message,
    );
    return new Map();
  }

  if (!response.success) {
    console.warn(
      "[Content Server API] Failed to fetch stories by IDs: API returned success=false",
    );
    return new Map();
  }

  // Convert array to Map for O(1) lookup
  const storyMap = new Map<string, Story>();
  if (response.data) {
    for (const story of response.data) {
      storyMap.set(story.id, story);
    }
  }

  return storyMap;
}

/**
 * ============================================
 * ROADMAP ENDPOINTS
 * ============================================
 */

export async function getRoadmaps() {
  const response = await apiRequest<ApiResponse<Roadmap[]>>("/roadmaps");

  if (isApiError(response)) {
    console.warn(
      "[Content Server API] Failed to fetch roadmaps:",
      response.error.message,
    );
    return [];
  }

  if (!response.success) {
    console.warn(
      "[Content Server API] Failed to fetch roadmaps: API returned success=false",
    );
    return [];
  }

  return response.data || [];
}

export async function getRoadmapById(roadmapId: string) {
  const response = await apiRequest<ApiResponse<Roadmap>>(
    `/roadmaps/${roadmapId}`,
  );

  if (isApiError(response)) {
    console.warn(
      "[Content Server API] Failed to fetch roadmap:",
      response.error.message,
    );
    return null;
  }

  if (!response.success) {
    console.warn(
      "[Content Server API] Failed to fetch roadmap: API returned success=false",
    );
    return null;
  }

  return response.data || null;
}

export async function getRoadmapsByAgeGroup(ageGroupId: string) {
  const response = await apiRequest<ApiResponse<Roadmap[]>>(
    `/roadmaps/age-group/${ageGroupId}`,
  );

  if (isApiError(response)) {
    console.warn(
      "[Content Server API] Failed to fetch roadmaps by age group:",
      response.error.message,
    );
    return [];
  }

  if (!response.success) {
    console.warn(
      "[Content Server API] Failed to fetch roadmaps by age group: API returned success=false",
    );
    return [];
  }

  return response.data || [];
}

/**
 * Fetch multiple roadmaps by their IDs in a single batch request
 * More efficient than making multiple individual getRoadmapById() calls
 * @param roadmapIds - Array of roadmap IDs to fetch
 * @returns Map of roadmapId -> Roadmap for efficient lookup
 */
export async function getRoadmapsByIds(roadmapIds: string[]) {
  if (!roadmapIds || roadmapIds.length === 0) {
    return [];
  }

  // Remove duplicates
  const uniqueIds = Array.from(new Set(roadmapIds));

  // Build query string with comma-separated IDs
  const queryString = buildQueryString({ ids: uniqueIds.join(",") });

  console.log("[Content Server API] Fetching roadmaps by IDs:", uniqueIds);
  const response = await apiRequest<ApiResponse<Roadmap[]>>(
    `/roadmaps${queryString}`,
  );

  if (isApiError(response)) {
    console.warn(
      "[Content Server API] Failed to fetch roadmaps by IDs:",
      response.error.message,
    );
    return [];
  }

  if (!response.success) {
    console.warn(
      "[Content Server API] Failed to fetch roadmaps by IDs: API returned success=false",
    );
    return [];
  }

  return response.data || [];
}

/**
 * ============================================
 * WORLD ENDPOINTS
 * ============================================
 */

export async function getWorlds() {
  const response = await apiRequest<ApiResponse<World[]>>("/worlds");

  if (isApiError(response)) {
    console.warn(
      "[Content Server API] Failed to fetch worlds:",
      response.error.message,
    );
    return [];
  }

  if (!response.success) {
    console.warn(
      "[Content Server API] Failed to fetch worlds: API returned success=false",
    );
    return [];
  }

  return response.data || [];
}

export async function getWorldById(worldId: string) {
  const response = await apiRequest<ApiResponse<World>>(`/worlds/${worldId}`);

  if (isApiError(response)) {
    console.warn(
      "[Content Server API] Failed to fetch world:",
      response.error.message,
    );
    return null;
  }

  if (!response.success) {
    console.warn(
      "[Content Server API] Failed to fetch world: API returned success=false",
    );
    return null;
  }

  return response.data || null;
}

export async function getWorldsByRoadmap(roadmapId: string) {
  const response = await apiRequest<ApiResponse<World[]>>(
    `/worlds/roadmap/${roadmapId}`,
  );

  if (isApiError(response)) {
    console.warn(
      "[Content Server API] Failed to fetch worlds by roadmap:",
      response.error.message,
    );
    return [];
  }

  if (!response.success) {
    console.warn(
      "[Content Server API] Failed to fetch worlds by roadmap: API returned success=false",
    );
    return [];
  }

  return response.data || [];
}

/**
 * ============================================
 * AGE GROUP ENDPOINTS
 * ============================================
 */
// active age groups
export async function getAgeGroups() {
  const response = await apiRequest<ApiResponse<AgeGroup[]>>("/age-groups");

  if (isApiError(response)) {
    console.warn(
      "[Content Server API] Failed to fetch age groups:",
      response.error.message,
    );
    return [];
  }

  if (!response.success) {
    console.warn(
      "[Content Server API] Failed to fetch age groups: API returned success=false",
    );
    return [];
  }

  return response.data || [];
}
// all age groups for admin (including inactive)
export async function getAgeGroupsForAdmin() {
  const response = await apiRequest<ApiResponse<AgeGroup[]>>(
    "/age-groups/admin/all",
  );

  if (isApiError(response)) {
    console.warn(
      "[Content Server API] Failed to fetch age groups for admin:",
      response.error.message,
    );
    return [];
  }

  if (!response.success) {
    console.warn(
      "[Content Server API] Failed to fetch age groups for admin: API returned success=false",
    );
    return [];
  }

  return response.data || [];
}

export async function getAgeGroupById(ageGroupId: string) {
  const response = await apiRequest<ApiResponse<AgeGroup>>(
    `/age-groups/${ageGroupId}`,
  );

  if (isApiError(response)) {
    console.warn(
      "[Content Server API] Failed to fetch age group:",
      response.error.message,
    );
    return null;
  }

  if (!response.success) {
    console.warn(
      "[Content Server API] Failed to fetch age group: API returned success=false",
    );
    return null;
  }

  return response.data || null;
}

/**
 * ============================================
 * THEME ENDPOINTS
 * ============================================
 */

export async function getThemes() {
  const response = await apiRequest<ApiResponse<Theme[]>>("/themes");

  if (isApiError(response)) {
    console.warn(
      "[Content Server API] Failed to fetch themes:",
      response.error.message,
    );
    return [];
  }

  if (!response.success) {
    console.warn(
      "[Content Server API] Failed to fetch themes: API returned success=false",
    );
    return [];
  }

  return response.data || [];
}

export async function getThemeById(themeId: string) {
  const response = await apiRequest<ApiResponse<Theme>>(`/themes/${themeId}`);

  if (isApiError(response)) {
    console.warn(
      "[Content Server API] Failed to fetch theme:",
      response.error.message,
    );
    return null;
  }

  if (!response.success) {
    console.warn(
      "[Content Server API] Failed to fetch theme: API returned success=false",
    );
    return null;
  }

  return response.data || null;
}

/**
 * ============================================
 * Level ENDPOINTS
 * ============================================
 */

export async function getLevels() {
  const response = await apiRequest<ApiResponse<Level[]>>("/levels");

  if (isApiError(response)) {
    console.warn(
      "[Content Server API] Failed to fetch levels:",
      response.error.message,
    );
    return [];
  }

  if (!response.success) {
    console.warn(
      "[Content Server API] Failed to fetch levels: API returned success=false",
    );
    return [];
  }

  return response.data || [];
}

export async function getLevelById(levelId: string) {
  const response = await apiRequest<ApiResponse<Level>>(`/levels/${levelId}`);

  if (isApiError(response)) {
    console.warn(
      "[Content Server API] Failed to fetch level:",
      response.error.message,
    );
    return null;
  }

  if (!response.success) {
    console.warn(
      "[Content Server API] Failed to fetch level: API returned success=false",
    );
    return null;
  }

  return response.data || null;
}

export async function getLevelByNumber(levelNumber: number) {
  const response = await apiRequest<ApiResponse<Level>>(
    `/levels/number/${levelNumber}`,
  );

  if (isApiError(response)) {
    console.warn(
      "[Content Server API] Failed to fetch level by number:",
      response.error.message,
    );
    return null;
  }

  if (!response.success) {
    console.warn(
      "[Content Server API] Failed to fetch level by number: API returned success=false",
    );
    return null;
  }

  return response.data || null;
}

// Level CRUD - Consolidated with Badge
export async function createLevel(
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
) {
  const response = await apiRequest<ApiResponse<Level>>(`/levels`, {
    method: "POST",
    body: JSON.stringify({
      ...data,
      autoTranslateBadge,
      translationSource,
      translations,
    }),
  });

  if (isApiError(response)) {
    console.error(
      "[Content Server API] Failed to create level:",
      response.error.message,
    );
    return { success: false as const, error: response.error.message };
  }

  if (!response.success) {
    console.error(
      "[Content Server API] Failed to create level: API returned success=false",
    );
    return {
      success: false as const,
      error: response.error?.message || "Failed to create level",
    };
  }

  return { success: true as const, data: response.data };
}

export async function updateLevel(
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
) {
  const response = await apiRequest<ApiResponse<Level>>(`/levels/${id}`, {
    method: "PUT",
    body: JSON.stringify({ ...data, autoTranslateBadge, translationSource }),
  });

  if (isApiError(response)) {
    console.error(
      "[Content Server API] Failed to update level:",
      response.error.message,
    );
    return { success: false as const, error: response.error.message };
  }

  if (!response.success) {
    console.error(
      "[Content Server API] Failed to update level: API returned success=false",
    );
    return {
      success: false as const,
      error: response.error?.message || "Failed to update level",
    };
  }

  return { success: true as const, data: response.data };
}

export async function deleteLevel(id: string) {
  const response = await apiRequest<ApiResponse<{ id: string }>>(
    `/levels/${id}`,
    { method: "DELETE" },
  );

  if (isApiError(response)) {
    console.error(
      "[Content Server API] Failed to delete level:",
      response.error.message,
    );
    return { success: false as const, error: response.error.message };
  }

  if (!response.success) {
    console.error(
      "[Content Server API] Failed to delete level: API returned success=false",
    );
    return {
      success: false as const,
      error: response.error?.message || "Failed to delete level",
    };
  }

  return { success: true as const, data: response.data };
}

/**
 * ============================================
 * Badge ENDPOINTS
 * ============================================
 */

export async function getBadges() {
  const response = await apiRequest<ApiResponse<Badge[]>>("/badges");

  if (isApiError(response)) {
    console.warn(
      "[Content Server API] Failed to fetch badges:",
      response.error.message,
    );
    return [];
  }

  if (!response.success) {
    console.warn(
      "[Content Server API] Failed to fetch badges: API returned success=false",
    );
    return [];
  }

  return response.data || [];
}

export async function getBadgeById(badgeId: string) {
  const response = await apiRequest<ApiResponse<Badge>>(`/badges/${badgeId}`);

  if (isApiError(response)) {
    console.warn(
      "[Content Server API] Failed to fetch badge:",
      response.error.message,
    );
    return null;
  }

  if (!response.success) {
    console.warn(
      "[Content Server API] Failed to fetch badge: API returned success=false",
    );
    return null;
  }

  return response.data || null;
}

export async function getBadgeByLevel(levelNumber: number) {
  const response = await apiRequest<ApiResponse<Badge>>(
    `/badges/level/${levelNumber}`,
  );

  if (isApiError(response)) {
    console.warn(
      "[Content Server API] Failed to fetch badge by level:",
      response.error.message,
    );
    return null;
  }

  if (!response.success) {
    console.warn(
      "[Content Server API] Failed to fetch badge by level: API returned success=false",
    );
    return null;
  }

  return response.data || null;
}

/**
 * ============================================
 * CREATE/UPDATE/DELETE ENDPOINTS
 * ============================================
 */

// Age Group CRUD
export async function createAgeGroup(
  data: Omit<
    AgeGroup,
    "id" | "createdAt" | "updatedAt" | "roadmaps" | "translations"
  > & {
    translationSource?: string;
    translations?: Array<{ languageCode: string; name: string }>;
  },
) {
  const response = await apiRequest<ApiResponse<AgeGroup>>("/age-groups", {
    method: "POST",
    body: JSON.stringify(data),
  });

  if (isApiError(response)) {
    console.error(
      "[Content Server API] Failed to create age group:",
      response.error.message,
    );
    return { success: false as const, error: response.error.message };
  }

  if (!response.success) {
    console.error(
      "[Content Server API] Failed to create age group: API returned success=false",
    );
    return {
      success: false as const,
      error: response.error?.message || "Failed to create age group",
    };
  }

  return { success: true as const, data: response.data };
}

export async function updateAgeGroup(
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
) {
  const response = await apiRequest<ApiResponse<AgeGroup>>(
    `/age-groups/${id}`,
    {
      method: "PUT",
      body: JSON.stringify(data),
    },
  );

  if (isApiError(response)) {
    console.error(
      "[Content Server API] Failed to update age group:",
      response.error.message,
    );
    return { success: false as const, error: response.error.message };
  }

  if (!response.success) {
    console.error(
      "[Content Server API] Failed to update age group: API returned success=false",
    );
    return {
      success: false as const,
      error: response.error?.message || "Failed to update age group",
    };
  }

  return { success: true as const, data: response.data };
}

export async function deleteAgeGroup(id: string) {
  const response = await apiRequest<
    ApiResponse<{ success: boolean; deletedId: string; name: string }>
  >(`/age-groups/${id}`, { method: "DELETE" });

  if (isApiError(response)) {
    console.error(
      "[Content Server API] Failed to delete age group:",
      response.error.message,
    );
    return { success: false as const, error: response.error.message };
  }

  if (!response.success) {
    console.error(
      "[Content Server API] Failed to delete age group: API returned success=false",
    );
    return {
      success: false as const,
      error: response.error?.message || "Failed to delete age group",
    };
  }

  return { success: true as const, data: response.data };
}

/**
 * Validate age group content completeness before activation
 * Returns details about missing content if validation fails
 */
export async function validateAgeGroupReadiness(ageGroupId: string) {
  const response = await apiRequest<
    ApiResponse<AgeGroupContentValidationResult>
  >(`/age-groups/${ageGroupId}/validate-readiness`, { method: "GET" });

  if (isApiError(response)) {
    console.error(
      "[Content Server API] Failed to validate age group readiness:",
      response.error.message,
    );
    return { success: false as const, error: response.error.message };
  }

  if (!response.success) {
    console.error(
      "[Content Server API] Failed to validate age group readiness: API returned success=false",
    );
    return {
      success: false as const,
      error: response.error?.message || "Failed to validate age group",
    };
  }

  return { success: true as const, data: response.data };
}

// Theme CRUD
export async function createTheme(
  data: Omit<
    Theme,
    "id" | "createdAt" | "updatedAt" | "roadmap" | "translations"
  > & {
    translationSource?: string;
    translations?: Array<{ languageCode: string; name: string }>;
  },
) {
  const response = await apiRequest<ApiResponse<Theme>>("/themes", {
    method: "POST",
    body: JSON.stringify(data),
  });

  if (isApiError(response)) {
    console.error(
      "[Content Server API] Failed to create theme:",
      response.error.message,
    );
    return { success: false as const, error: response.error.message };
  }

  if (!response.success) {
    console.error(
      "[Content Server API] Failed to create theme: API returned success=false",
    );
    return {
      success: false as const,
      error: response.error?.message || "Failed to create theme",
    };
  }

  return { success: true as const, data: response.data };
}

export async function updateTheme(
  id: string,
  data: Partial<
    Omit<Theme, "id" | "createdAt" | "updatedAt" | "roadmap" | "translations">
  > & {
    translationSource?: string;
    translations?: Array<{ languageCode: string; name: string }>;
  },
) {
  const response = await apiRequest<ApiResponse<Theme>>(`/themes/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });

  if (isApiError(response)) {
    console.error(
      "[Content Server API] Failed to update theme:",
      response.error.message,
    );
    return { success: false as const, error: response.error.message };
  }

  if (!response.success) {
    console.error(
      "[Content Server API] Failed to update theme: API returned success=false",
    );
    return {
      success: false as const,
      error: response.error?.message || "Failed to update theme",
    };
  }

  return { success: true as const, data: response.data };
}

export async function deleteTheme(id: string) {
  const response = await apiRequest<ApiResponse<{ id: string }>>(
    `/themes/${id}`,
    { method: "DELETE" },
  );

  if (isApiError(response)) {
    console.error(
      "[Content Server API] Failed to delete theme:",
      response.error.message,
    );
    return { success: false as const, error: response.error.message };
  }

  if (!response.success) {
    console.error(
      "[Content Server API] Failed to delete theme: API returned success=false",
    );
    return {
      success: false as const,
      error: response.error?.message || "Failed to delete theme",
    };
  }

  return { success: true as const, data: response.data };
}

// Roadmap CRUD
export async function createRoadmap(
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
) {
  const response = await apiRequest<ApiResponse<Roadmap>>("/roadmaps", {
    method: "POST",
    body: JSON.stringify(data),
  });

  if (isApiError(response)) {
    console.error(
      "[Content Server API] Failed to create roadmap:",
      response.error.message,
    );
    return { success: false as const, error: response.error.message };
  }

  if (!response.success) {
    console.error(
      "[Content Server API] Failed to create roadmap: API returned success=false",
    );
    return {
      success: false as const,
      error: response.error?.message || "Failed to create roadmap",
    };
  }

  return { success: true as const, data: response.data };
}

export async function updateRoadmap(
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
) {
  const response = await apiRequest<ApiResponse<Roadmap>>(`/roadmaps/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });

  if (isApiError(response)) {
    console.error(
      "[Content Server API] Failed to update roadmap:",
      response.error.message,
    );
    return { success: false as const, error: response.error.message };
  }

  if (!response.success) {
    console.error(
      "[Content Server API] Failed to update roadmap: API returned success=false",
    );
    return {
      success: false as const,
      error: response.error?.message || "Failed to update roadmap",
    };
  }

  return { success: true as const, data: response.data };
}

export async function deleteRoadmap(id: string) {
  const response = await apiRequest<ApiResponse<{ id: string }>>(
    `/roadmaps/${id}`,
    { method: "DELETE" },
  );

  if (isApiError(response)) {
    console.error(
      "[Content Server API] Failed to delete roadmap:",
      response.error.message,
    );
    return { success: false as const, error: response.error.message };
  }

  if (!response.success) {
    console.error(
      "[Content Server API] Failed to delete roadmap: API returned success=false",
    );
    return {
      success: false as const,
      error: response.error?.message || "Failed to delete roadmap",
    };
  }

  return { success: true as const, data: response.data };
}

// World CRUD
export async function createWorld(
  data: Omit<World, "id" | "createdAt" | "updatedAt" | "roadmap" | "stories" | "translations"> & {
    translationSource?: string;
    translations?: Array<{ languageCode: string; name: string }>;
  },
) {
  const response = await apiRequest<ApiResponse<World>>("/worlds", {
    method: "POST",
    body: JSON.stringify(data),
  });

  if (isApiError(response)) {
    console.error(
      "[Content Server API] Failed to create world:",
      response.error.message,
    );
    return { success: false as const, error: response.error.message };
  }

  if (!response.success) {
    console.error(
      "[Content Server API] Failed to create world: API returned success=false",
    );
    return {
      success: false as const,
      error: response.error?.message || "Failed to create world",
    };
  }

  return { success: true as const, data: response.data };
}

export async function updateWorld(
  id: string,
  data: Partial<
    Omit<World, "id" | "createdAt" | "updatedAt" | "roadmap" | "stories" | "translations">
  > & {
    translationSource?: string;
    translations?: Array<{ languageCode: string; name: string }>;
  },
) {
  const response = await apiRequest<ApiResponse<World>>(`/worlds/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });

  if (isApiError(response)) {
    console.error(
      "[Content Server API] Failed to update world:",
      response.error.message,
    );
    return { success: false as const, error: response.error.message };
  }

  if (!response.success) {
    console.error(
      "[Content Server API] Failed to update world: API returned success=false",
    );
    return {
      success: false as const,
      error: response.error?.message || "Failed to update world",
    };
  }

  return { success: true as const, data: response.data };
}

export async function deleteWorld(id: string) {
  const response = await apiRequest<ApiResponse<{ id: string }>>(
    `/worlds/${id}`,
    { method: "DELETE" },
  );

  if (isApiError(response)) {
    console.error(
      "[Content Server API] Failed to delete world:",
      response.error.message,
    );
    return { success: false as const, error: response.error.message };
  }

  if (!response.success) {
    console.error(
      "[Content Server API] Failed to delete world: API returned success=false",
    );
    return {
      success: false as const,
      error: response.error?.message || "Failed to delete world",
    };
  }

  return { success: true as const, data: response.data };
}

// Story CRUD

/**
 * Create a story with chapters, challenges, and answers atomically
 * All nested data is created in a single transaction or rolled back entirely on error
 */
export async function createStoryWithChapters(
  data: CreateStoryWithChaptersInput,
) {
  const response = await apiRequest<ApiResponse<Story>>(
    "/stories/batch/create",
    {
      method: "POST",
      body: JSON.stringify(data),
    },
  );

  if (isApiError(response)) {
    console.error(
      "[Content Server API] Failed to create story with chapters:",
      response.error.message,
    );
    return { success: false as const, error: response.error.message };
  }

  if (!response.success) {
    console.error(
      "[Content Server API] Failed to create story with chapters: API returned success=false",
    );
    return {
      success: false as const,
      error: response.error?.message || "Failed to create story with chapters",
    };
  }

  return { success: true as const, data: response.data };
}

/**
 * Edit a story with chapters, challenges, and answers atomically
 * Updates story and all nested data in a single transaction or rolled back entirely on error
 */
export async function editStoryWithChapters(
  storyId: string,
  data: CreateStoryWithChaptersInput,
) {
  const response = await apiRequest<ApiResponse<Story>>(
    `/stories/${storyId}/batch/edit`,
    {
      method: "PUT",
      body: JSON.stringify(data),
    },
  );

  if (isApiError(response)) {
    console.error(
      "[Content Server API] Failed to edit story with chapters:",
      response.error.message,
    );
    return { success: false as const, error: response.error.message };
  }

  if (!response.success) {
    console.error(
      "[Content Server API] Failed to edit story with chapters: API returned success=false",
    );
    return {
      success: false as const,
      error: response.error?.message || "Failed to edit story with chapters",
    };
  }

  return { success: true as const, data: response.data };
}

export async function deleteStory(id: string) {
  const response = await apiRequest<ApiResponse<{ id: string }>>(
    `/stories/${id}`,
    { method: "DELETE" },
  );

  if (isApiError(response)) {
    console.error(
      "[Content Server API] Failed to delete story:",
      response.error.message,
    );
    return { success: false as const, error: response.error.message };
  }

  if (!response.success) {
    console.error(
      "[Content Server API] Failed to delete story: API returned success=false",
    );
    return {
      success: false as const,
      error: response.error?.message || "Failed to delete story",
    };
  }

  return { success: true as const, data: response.data };
}
