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
