/**
 * Custom Hook: useRoadmaps
 * Client-side hook for fetching roadmaps
 */

"use client";

import { useState, useCallback, useEffect } from "react";
import { apiClient } from "@/src/lib/api-client";

interface Roadmap {
  id: string;
  ageGroupId: string;
  themeId: string;
  worlds: any[];
}

interface UseRoadmapsReturn {
  roadmaps: Roadmap[];
  loading: boolean;
  error: Error | null;
  fetchRoadmaps: () => Promise<void>;
  refetch: () => Promise<void>;
}

export function useRoadmaps(autoFetch = true): UseRoadmapsReturn {
  const [roadmaps, setRoadmaps] = useState<Roadmap[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchRoadmaps = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await apiClient.get("/api/roadmaps");

      if (response?.data) {
        setRoadmaps(Array.isArray(response.data) ? response.data : []);
      }
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      console.error("Error fetching roadmaps:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  const refetch = useCallback(() => {
    return fetchRoadmaps();
  }, [fetchRoadmaps]);

  useEffect(() => {
    if (autoFetch) {
      fetchRoadmaps();
    }
  }, [autoFetch, fetchRoadmaps]);

  return {
    roadmaps,
    loading,
    error,
    fetchRoadmaps,
    refetch,
  };
}
