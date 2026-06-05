import { Metadata } from "next";
import { getAllJobs, getJobStats } from "@/src/lib/jobs-service/server-api";
import { getStoryTitlesByIds } from "@/src/lib/content-service/server-api";
import { JobsPageClient } from "./_components/JobsPageClient";
import { Activity } from "lucide-react";

export const metadata: Metadata = {
  title: "Background Jobs | Admin Dashboard",
  description: "Monitor and manage background job execution in real-time",
};

export default async function JobsPage() {
  // Fetch initial data
  const [{ jobs, pagination }, stats] = await Promise.all([
    getAllJobs({ limit: 50, offset: 0 }),
    getJobStats(),
  ]);

  // Extract unique story IDs from jobs
  const uniqueStoryIds = [
    ...new Set(
      jobs
        .map((job) => job.storyId)
        .filter((id): id is string => Boolean(id))
    ),
  ];

  // Batch fetch story titles for all unique story IDs
  const storyTitles = uniqueStoryIds.length > 0 
    ? await getStoryTitlesByIds(uniqueStoryIds)
    : {};

  // Augment jobs with story titles
  const jobsWithTitles = jobs.map((job) => ({
    ...job,
    storyTitle: job.storyId ? storyTitles[job.storyId] : undefined,
  }));

  return (
    <div className="space-y-6 p-6">
      {/* Page Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-3">
          <Activity className="w-8 h-8 text-blue-600" />
          <h1 className="text-3xl font-bold text-slate-900">Background Jobs</h1>
        </div>
        <p className="text-slate-600">
          Monitor and track background tasks including audio generation,
          translations, and analytics processing
        </p>
      </div>

      {/* Client Component with Interactive Features */}
      <JobsPageClient
        initialJobs={jobsWithTitles}
        initialStats={stats}
        initialPagination={pagination}
      />
    </div>
  );
}
