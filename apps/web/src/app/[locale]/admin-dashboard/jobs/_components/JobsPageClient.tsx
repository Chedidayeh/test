/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState, useCallback } from "react";
import { 
  InngestJob, 
  JobStats, 
  getAllJobs, 
  getJobStats 
} from "@/src/lib/jobs-service/server-api";
import { getStoryTitlesByIds } from "@/src/lib/content-service/server-api";
import { JobsTable } from "./JobsTable";
import { Button } from "@/src/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/src/components/ui/select";
import { Input } from "@/src/components/ui/input";
import { RefreshCw, Filter, ChevronLeft, ChevronRight } from "lucide-react";
import { Card } from "@/src/components/ui/card";
import { Badge } from "@/src/components/ui/badge";

interface JobsPageClientProps {
  initialJobs: InngestJob[];
  initialStats: JobStats;
  initialPagination?: any;
}

export function JobsPageClient({
  initialJobs,
  initialStats,
  initialPagination,
}: JobsPageClientProps) {
  const [jobs, setJobs] = useState<InngestJob[]>(initialJobs);
  const [stats, setStats] = useState<JobStats>(initialStats);
  const [loading, setLoading] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [lastRefreshed, setLastRefreshed] = useState<Date>(new Date());

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalJobs, setTotalJobs] = useState(initialPagination?.total || 0);
  const pageSize = 20;
  const totalPages = Math.ceil(totalJobs / pageSize);

  // Filters
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");

  const fetchJobs = useCallback(async (page: number = currentPage) => {
    setLoading(true);
    console.log("[JobsPageClient] Fetching jobs...", new Date().toISOString());
    try {
      // Build filters object for server action
      const offset = (page - 1) * pageSize;
      const filters: any = { limit: pageSize, offset };
      if (statusFilter !== "all") filters.status = statusFilter;
      if (typeFilter !== "all") filters.jobType = typeFilter;
      
      // Use search parameter for cross-page search
      if (searchQuery) {
        filters.search = searchQuery;
      }

      console.log("[JobsPageClient] Filters:", filters);

      // Call server actions directly (they handle authentication)
      const [{ jobs: newJobs, pagination }, newStats] = await Promise.all([
        getAllJobs(filters),
        getJobStats(),
      ]);

      console.log("[JobsPageClient] Fetched jobs count:", newJobs.length);
      console.log("[JobsPageClient] Stats:", newStats);
      console.log("[JobsPageClient] Pagination:", pagination);

      // Update total count from pagination
      if (pagination?.total !== undefined) {
        setTotalJobs(pagination.total);
      }

      // Extract unique story IDs from jobs
      const uniqueStoryIds = [
        ...new Set(
          newJobs
            .map((job) => job.storyId)
            .filter((id): id is string => Boolean(id))
        ),
      ];

      // Batch fetch story titles for all unique story IDs
      const storyTitles = uniqueStoryIds.length > 0 
        ? await getStoryTitlesByIds(uniqueStoryIds)
        : {};

      // Augment jobs with story titles
      const jobsWithTitles = newJobs.map((job) => ({
        ...job,
        storyTitle: job.storyId ? storyTitles[job.storyId] : undefined,
      }));

      setJobs(jobsWithTitles);
      setStats(newStats);
      setLastRefreshed(new Date());
      console.log("[JobsPageClient] State updated successfully");
    } catch (error) {
      console.error("[JobsPageClient] Failed to fetch jobs:", error);
    } finally {
      setLoading(false);
    }
  }, [statusFilter, typeFilter, searchQuery, currentPage, pageSize]);

  // Auto-refresh every 15 seconds if enabled
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      fetchJobs();
    }, 15000);

    return () => clearInterval(interval);
  }, [autoRefresh, fetchJobs]);

  const handleRefresh = () => {
    fetchJobs(currentPage);
  };

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    fetchJobs(newPage);
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      handlePageChange(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      handlePageChange(currentPage + 1);
    }
  };

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
    fetchJobs(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter, typeFilter, searchQuery]);

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
        <Card className="p-4">
          <div className="text-sm text-slate-600 mb-1">Total</div>
          <div className="text-2xl font-bold">{stats.total}</div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-slate-600 mb-1">Queued</div>
          <div className="text-2xl font-bold text-slate-600">
            {stats.queued}
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-slate-600 mb-1">Running</div>
          <div className="text-2xl font-bold text-yellow-600">
            {stats.running}
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-slate-600 mb-1">Completed</div>
          <div className="text-2xl font-bold text-green-600">
            {stats.completed}
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-slate-600 mb-1">Failed</div>
          <div className="text-2xl font-bold text-red-600">{stats.failed}</div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-slate-600 mb-1">Cancelled</div>
          <div className="text-2xl font-bold text-gray-600">
            {stats.cancelled}
          </div>
        </Card>
      </div>

      {/* Filters and Actions */}
      <Card className="p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <Input
              placeholder="Search by Story ID or Name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="max-w-sm"
            />
          </div>

          <div className="flex gap-2">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[140px]">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="queued">Queued</SelectItem>
                <SelectItem value="running">Running</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>

            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-[160px]">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="translation">Translation</SelectItem>
                <SelectItem value="tts_audio">Audio Generation</SelectItem>
                <SelectItem value="weekly_analytics">
                  Weekly Analytics
                </SelectItem>
              </SelectContent>
            </Select>

            <Button
              variant="outline"
              onClick={handleRefresh}
              disabled={loading}
            >
              <RefreshCw
                className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`}
              />
              Refresh
            </Button>
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <label className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer">
              <input
                type="checkbox"
                checked={autoRefresh}
                onChange={(e) => setAutoRefresh(e.target.checked)}
                className="rounded border-slate-300"
              />
              Auto-refresh every 15s
            </label>
            {autoRefresh && (
              <Badge variant="outline" className="text-xs">
                Live
              </Badge>
            )}
          </div>

          <div className="flex items-center gap-4">
            <div className="text-xs text-slate-500">
              Last refreshed: {lastRefreshed.toLocaleTimeString()}
            </div>
            <div className="text-sm text-slate-600">
              Showing {jobs.length} jobs (Page {currentPage} of {totalPages})
            </div>
          </div>
        </div>
      </Card>

      {/* Jobs Table */}
      <JobsTable jobs={jobs} />

      {/* Pagination */}
      {totalPages > 1 && (
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div className="text-sm text-slate-600">
              Page {currentPage} of {totalPages} ({totalJobs} total jobs)
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handlePrevPage}
                disabled={currentPage === 1 || loading}
              >
                <ChevronLeft className="w-4 h-4 mr-1" />
                Previous
              </Button>

              {/* Page Numbers */}
              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }

                  return (
                    <Button
                      key={pageNum}
                      variant={currentPage === pageNum ? "default" : "outline"}
                      size="sm"
                      onClick={() => handlePageChange(pageNum)}
                      disabled={loading}
                      className="w-10"
                    >
                      {pageNum}
                    </Button>
                  );
                })}
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={handleNextPage}
                disabled={currentPage === totalPages || loading}
              >
                Next
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
