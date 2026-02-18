/**
 * Custom Hook: useAgeGroups
 * Client-side hook for fetching age groups
 */

"use client";

import { useState, useCallback, useEffect } from "react";
import { apiClient } from "@/src/lib/api-client";

interface AgeGroup {
  id: string;
  name: string;
  minAge: number;
  maxAge: number;
  roadmaps?: any[];
}

interface UseAgeGroupsReturn {
  ageGroups: AgeGroup[];
  loading: boolean;
  error: Error | null;
  fetchAgeGroups: () => Promise<void>;
  refetch: () => Promise<void>;
}

export function useAgeGroups(autoFetch = true): UseAgeGroupsReturn {
  const [ageGroups, setAgeGroups] = useState<AgeGroup[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchAgeGroups = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await apiClient.get("/api/age-groups");

      if (response?.data) {
        setAgeGroups(Array.isArray(response.data) ? response.data : []);
      }
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      console.error("Error fetching age groups:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  const refetch = useCallback(() => {
    return fetchAgeGroups();
  }, [fetchAgeGroups]);

  useEffect(() => {
    if (autoFetch) {
      fetchAgeGroups();
    }
  }, [autoFetch, fetchAgeGroups]);

  return {
    ageGroups,
    loading,
    error,
    fetchAgeGroups,
    refetch,
  };
}
