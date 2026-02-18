/**
 * Custom Hook: useWorlds
 * Client-side hook for fetching worlds
 */

"use client";

import { useState, useCallback, useEffect } from "react";
import { apiClient } from "@/src/lib/api-client";

interface World {
  id: string;
  roadmapId: string;
  name: string;
  description?: string;
  order: number;
  locked: boolean;
  requiredStarCount: number;
  stories?: any[];
}

interface UseWorldsReturn {
  worlds: World[];
  loading: boolean;
  error: Error | null;
  fetchWorlds: () => Promise<void>;
  refetch: () => Promise<void>;
}

export function useWorlds(autoFetch = true): UseWorldsReturn {
  const [worlds, setWorlds] = useState<World[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchWorlds = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await apiClient.get("/api/worlds");

      if (response?.data) {
        setWorlds(Array.isArray(response.data) ? response.data : []);
      }
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      console.error("Error fetching worlds:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  const refetch = useCallback(() => {
    return fetchWorlds();
  }, [fetchWorlds]);

  useEffect(() => {
    if (autoFetch) {
      fetchWorlds();
    }
  }, [autoFetch, fetchWorlds]);

  return {
    worlds,
    loading,
    error,
    fetchWorlds,
    refetch,
  };
}
