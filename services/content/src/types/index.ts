/**
 * Content Service Types
 * Imports and re-exports from global shared types, plus service-specific DTOs
 */

import type {
  // Core entities
  AgeGroup,
  Theme,
  Roadmap,
  World,
  Story,
  Chapter,
  Challenge,
  Answer,
  Level,
  Badge,
  // API types
  ApiResponse,
  PaginationMeta,
  PaginatedResponse,
} from "@shared/src/types";

import { ChallengeType } from "@shared/src/types";

// Re-export all shared types for convenience
export type {
  AgeGroup,
  Theme,
  Roadmap,
  World,
  Story,
  Chapter,
  Challenge,
  Answer,
  Level,
  Badge,
  ApiResponse,
  PaginationMeta,
  PaginatedResponse,
};

export { ChallengeType };



// ============================================================================
// API QUERY PARAMETERS
// ============================================================================

/**
 * Base pagination query parameters
 */
export interface PaginationQuery {
  limit?: number;
  offset?: number;
  page?: number;
  pageSize?: number;
}

/**
 * Story filtering and pagination parameters
 */
export interface StoryQuery extends PaginationQuery {
  worldId?: string;
  difficulty?: number;
  isMandatory?: boolean;
  searchTerm?: string;
}

/**
 * Challenge filtering and pagination parameters
 */
export interface ChallengeQuery extends PaginationQuery {
  storyId?: string;
  chapterId?: string;
  type?: ChallengeType;
  searchTerm?: string;
}

/**
 * World filtering and pagination parameters
 */
export interface WorldQuery extends PaginationQuery {
  roadmapId?: string;
  locked?: boolean;
  searchTerm?: string;
}

/**
 * Roadmap filtering and pagination parameters
 */
export interface RoadmapQuery extends PaginationQuery {
  ageGroupId?: string;
  themeId?: string;
  searchTerm?: string;
}

// ============================================================================
// API RESPONSE TYPES
// ============================================================================

/**
 * Standard list response for stories
 */
export interface StoriesResponse extends PaginatedResponse<Story> {}

/**
 * Standard list response for chapters
 */
export interface ChaptersResponse extends PaginatedResponse<Chapter> {}

/**
 * Standard list response for challenges
 */
export interface ChallengesResponse extends PaginatedResponse<Challenge> {}

/**
 * Standard list response for worlds
 */
export interface WorldsResponse extends PaginatedResponse<World> {}

/**
 * Standard list response for roadmaps
 */
export interface RoadmapsResponse extends PaginatedResponse<Roadmap> {}

/**
 * Standard list response for age groups
 */
export interface AgeGroupsResponse extends PaginatedResponse<AgeGroup> {}

/**
 * Standard list response for themes
 */
export interface ThemesResponse extends PaginatedResponse<Theme> {}
