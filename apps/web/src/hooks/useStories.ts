/**
 * Custom Hook: useStories
 * Client-side hook for fetching stories with pagination and filters
 * Can be used in Client Components alongside Server Components
 */

"use client";

import { useState, useCallback, useEffect } from "react";
import { apiClient } from "@/src/lib/api-client";

interface Story {
  id: string;
  worldId: string;
  title: string;
  description?: string;
  difficulty: number;
  isMandatory: boolean;
  order: number;
}

interface UseStoriesOptions {
  autoFetch?: boolean;
  limit?: number;
  offset?: number;
  worldId?: string;
  difficulty?: number;
}

interface UseStoriesReturn {
  stories: Story[];
  loading: boolean;
  error: Error | null;
  pagination: {
    total: number;
    limit: number;
    offset: number;
    pages: number;
  } | null;
  fetchStories: (params?: Record<string, any>) => Promise<void>;
  refetch: () => Promise<void>;
}

export function useStories(options: UseStoriesOptions = {}): UseStoriesReturn {
  const { autoFetch = true, limit = 20, offset = 0, ...filters } = options;

  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [pagination, setPagination] = useState<UseStoriesReturn["pagination"]>(null);

  const fetchStories = useCallback(
    async (params?: Record<string, any>) => {
      try {
        setLoading(true);
        setError(null);

        const queryParams = {
          limit,
          offset,
          ...filters,
          ...params,
        };

        const response = await apiClient.get("/api/stories", {
          params: queryParams,
        });

        if (response?.data) {
          setStories(response.data);
          if (response.pagination) {
            setPagination(response.pagination);
          }
        }
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err));
        setError(error);
        console.error("Error fetching stories:", error);
      } finally {
        setLoading(false);
      }
    },
    [limit, offset, filters]
  );

  const refetch = useCallback(() => {
    return fetchStories();
  }, [fetchStories]);

  useEffect(() => {
    if (autoFetch) {
      fetchStories();
    }
  }, [autoFetch, fetchStories]);

  return {
    stories,
    loading,
    error,
    pagination,
    fetchStories,
    refetch,
  };
}
