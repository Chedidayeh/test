/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";

import { apiRequest, isApiError } from "../helpers";
import { ApiResponse } from "@readdly/shared-types";

/**
 * Job data structure
 */
export interface InngestJob {
  id: string;
  eventId: string;
  functionId?: string;
  runId?: string;
  jobType: string;
  status: string;
  storyId?: string;
  storyTitle?: string; // Story display title (augmented on server-side)
  chapterId?: string;
  challengeId?: string;
  languageCode?: string;
  metadata?: any;
  queuedAt: Date;
  startedAt?: Date;
  completedAt?: Date;
  output?: any;
  error?: any;
  retryCount: number;
  maxRetries: number;
  nextRetryAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface JobFilters {
  jobType?: string;
  status?: string;
  storyId?: string;
  search?: string; // Search by story ID or story title
  chapterId?: string;
  languageCode?: string;
  limit?: number;
  offset?: number;
}

export interface JobStats {
  total: number;
  queued: number;
  running: number;
  completed: number;
  failed: number;
  cancelled: number;
}

/**
 * Get all jobs with optional filters
 * Jobs are enhanced with live status from Inngest API
 *
 * @param filters - Optional filters (jobType, status, storyId, search, etc.)
 * @returns Jobs list with pagination
 *
 * @example
 * const { jobs, pagination } = await getAllJobs({ status: 'running', limit: 20 });
 * const { jobs, pagination } = await getAllJobs({ search: 'My Story', limit: 20 });
 */
export async function getAllJobs(filters?: JobFilters) {
  const queryParams = new URLSearchParams();

  if (filters?.jobType) queryParams.append("jobType", filters.jobType);
  if (filters?.status) queryParams.append("status", filters.status);
  
  // Handle search: if search is provided, find matching story IDs by title
  if (filters?.search && filters.search.trim().length > 0) {
    // Import here to avoid circular dependencies
    const { searchStoryIdsByTitle } = await import("../content-service/server-api");
    
    const matchingStoryIds = await searchStoryIdsByTitle(filters.search);
    
    // If search looks like it might be a story ID (alphanumeric), include direct ID search
    const searchTerm = filters.search.trim();
    const mightBeId = /^[a-zA-Z0-9-_]+$/.test(searchTerm);
    
    if (mightBeId) {
      matchingStoryIds.push(searchTerm);
    }
    
    if (matchingStoryIds.length > 0) {
      // Use storyIds parameter to filter by multiple IDs
      queryParams.append("storyIds", matchingStoryIds.join(","));
    } else {
      // No matching stories found, return empty result
      console.log("[Jobs Service API] No stories found matching search term:", filters.search);
      return {
        jobs: [],
        pagination: { total: 0, page: 1, pageSize: filters?.limit || 20, hasMore: false },
      };
    }
  } else if (filters?.storyId) {
    queryParams.append("storyId", filters.storyId);
  }
  
  if (filters?.chapterId) queryParams.append("chapterId", filters.chapterId);
  if (filters?.languageCode)
    queryParams.append("languageCode", filters.languageCode);
  if (filters?.limit) queryParams.append("limit", filters.limit.toString());
  if (filters?.offset) queryParams.append("offset", filters.offset.toString());

  const queryString = queryParams.toString();
  const endpoint = `/jobs${queryString ? `?${queryString}` : ""}`;

  console.log("[Jobs Service API] Fetching jobs with filters:", filters);

  const response = await apiRequest<ApiResponse<InngestJob[]>>(endpoint);

  if (isApiError(response)) {
    console.warn(
      "[Jobs Service API] Failed to fetch jobs:",
      response.error.message,
    );
    return {
      jobs: [],
      pagination: undefined,
    };
  }

  if (!response.success) {
    console.warn(
      "[Jobs Service API] Failed to fetch jobs: API returned success=false",
    );
    return {
      jobs: [],
      pagination: undefined,
    };
  }

  return {
    jobs: response.data || [],
    pagination: response.pagination,
  };
}

/**
 * Get a single job by event ID with detailed run information
 *
 * @param eventId - The Inngest event ID
 * @returns Job details with all runs
 *
 * @example
 * const job = await getJobByEventId('01H...');
 * if (job) console.log(`Status: ${job.liveStatus}`);
 */
export async function getJobByEventId(
  eventId: string,
): Promise<InngestJob | null> {
  console.log("[Jobs Service API] Fetching job by eventId:", eventId);

  const response = await apiRequest<ApiResponse<InngestJob>>(
    `/jobs/${eventId}`,
  );

  if (isApiError(response)) {
    console.warn(
      "[Jobs Service API] Failed to fetch job:",
      response.error.message,
    );
    return null;
  }

  if (!response.success) {
    console.warn(
      "[Jobs Service API] Failed to fetch job: API returned success=false",
    );
    return null;
  }

  return response.data || null;
}

/**
 * Get all jobs for a specific story
 * Useful for showing job status on story detail pages
 *
 * @param storyId - The story ID
 * @returns List of jobs for the story
 *
 * @example
 * const jobs = await getJobsByStory('story123');
 * const translationJob = jobs.find(j => j.jobType === 'translation');
 */
export async function getJobsByStory(storyId: string): Promise<InngestJob[]> {
  console.log("[Jobs Service API] Fetching jobs for story:", storyId);

  const response = await apiRequest<ApiResponse<InngestJob[]>>(
    `/jobs/story/${storyId}`,
  );

  if (isApiError(response)) {
    console.warn(
      "[Jobs Service API] Failed to fetch jobs for story:",
      response.error.message,
    );
    return [];
  }

  if (!response.success) {
    console.warn(
      "[Jobs Service API] Failed to fetch jobs for story: API returned success=false",
    );
    return [];
  }

  return response.data || [];
}

/**
 * Get job statistics
 * Shows counts by status
 *
 * @returns Job statistics
 *
 * @example
 * const stats = await getJobStats();
 * console.log(`${stats.running} jobs currently running`);
 */
export async function getJobStats(): Promise<JobStats> {
  console.log("[Jobs Service API] Fetching job statistics");

  const defaultStats: JobStats = {
    total: 0,
    queued: 0,
    running: 0,
    completed: 0,
    failed: 0,
    cancelled: 0,
  };

  const response = await apiRequest<ApiResponse<JobStats>>("/jobs/stats");

  if (isApiError(response)) {
    console.warn(
      "[Jobs Service API] Failed to fetch job stats:",
      response.error.message,
    );
    return defaultStats;
  }

  if (!response.success) {
    console.warn(
      "[Jobs Service API] Failed to fetch job stats: API returned success=false",
    );
    return defaultStats;
  }

  return response.data || defaultStats;
}
