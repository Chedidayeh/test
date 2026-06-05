"use client";

import { InngestJob } from "@/src/lib/jobs-service/server-api";
import { StatusBadge } from "./StatusBadge";
import { JobTypeIcon } from "./JobTypeIcon";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/src/components/ui/table";
import { format, formatDistanceToNow } from "date-fns";
import { Button } from "@/src/components/ui/button";
import { Eye, ExternalLink } from "lucide-react";
import { useState } from "react";
import { JobDetailsModal } from "./JobDetailsModal";
import Link from "next/link";

interface JobsTableProps {
  jobs: InngestJob[];
  emptyMessage?: string;
}

export function JobsTable({
  jobs,
  emptyMessage = "No jobs found",
}: JobsTableProps) {
  const [selectedJob, setSelectedJob] = useState<InngestJob | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);

  const handleViewDetails = (job: InngestJob) => {
    setSelectedJob(job);
    setDetailsOpen(true);
  };

  const formatDate = (date: Date | string | undefined) => {
    if (!date) return "N/A";
    try {
      const dateObj = new Date(date);
      return format(dateObj, "MMM dd, HH:mm:ss");
    } catch {
      return "Invalid date";
    }
  };

  const formatRelativeTime = (date: Date | string | undefined) => {
    if (!date) return "N/A";
    try {
      return formatDistanceToNow(new Date(date), { addSuffix: true });
    } catch {
      return "N/A";
    }
  };

  if (jobs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="text-slate-400 mb-2">
          <svg
            className="w-16 h-16 mx-auto"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
            />
          </svg>
        </div>
        <p className="text-slate-600 font-medium">{emptyMessage}</p>
        <p className="text-sm text-slate-500 mt-1">
          Jobs will appear here when background tasks are created
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Type</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Story</TableHead>
              <TableHead>Language</TableHead>
              <TableHead>Queued</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {jobs.map((job) => {
              const duration =
                job.startedAt && job.completedAt
                  ? Math.floor(
                    (new Date(job.completedAt).getTime() -
                      new Date(job.startedAt).getTime()) /
                    1000,
                  )
                  : null;

              return (
                <TableRow key={job.id} className="hover:bg-slate-50">
                  <TableCell>
                    <JobTypeIcon jobType={job.jobType} />
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={job.status} />
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      {job.storyId && (
                        <div
                          className="text-xs text-blue-600 flex items-center gap-1"
                        >
                          {job.storyTitle || job.storyId.slice(0, 8) + "..."}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    {job.languageCode ? (
                      <span className="px-2 py-1 bg-slate-100 rounded text-xs font-medium">
                        {job.languageCode}
                      </span>
                    ) : (
                      <span className="text-slate-400 text-xs">N/A</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <p className="text-xs">{formatDate(job.queuedAt)}</p>
                      <p className="text-xs text-slate-500">
                        {formatRelativeTime(job.queuedAt)}
                      </p>
                    </div>
                  </TableCell>
                  {/* <TableCell>
                    {duration !== null ? (
                      <span className="text-xs">
                        {duration < 60
                          ? `${duration}s`
                          : `${Math.floor(duration / 60)}m ${duration % 60}s`}
                      </span>
                    ) : (
                      <span className="text-slate-400 text-xs">
                        {job.status === "running" ? "In progress..." : "N/A"}
                      </span>
                    )}
                  </TableCell> */}
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleViewDetails(job)}
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      Details
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      <JobDetailsModal
        job={selectedJob}
        open={detailsOpen}
        onOpenChange={setDetailsOpen}
      />
    </>
  );
}
