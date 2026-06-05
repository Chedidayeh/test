"use client";

import { InngestJob } from "@/src/lib/jobs-service/server-api";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/src/components/ui/dialog";
import { StatusBadge } from "./StatusBadge";
import { JobTypeIcon } from "./JobTypeIcon";
import { format } from "date-fns";
import { Badge } from "@/src/components/ui/badge";
import { ScrollArea } from "@/src/components/ui/scroll-area";

interface JobDetailsModalProps {
  job: InngestJob | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function JobDetailsModal({
  job,
  open,
  onOpenChange,
}: JobDetailsModalProps) {
  if (!job) return null;

  const formatDate = (date: Date | string | undefined) => {
    if (!date) return "N/A";
    return format(new Date(date), "MMM dd, yyyy HH:mm:ss");
  };

  const calculateDuration = () => {
    if (!job.startedAt || !job.completedAt) return "N/A";
    const start = new Date(job.startedAt).getTime();
    const end = new Date(job.completedAt).getTime();
    const durationSeconds = Math.floor((end - start) / 1000);
    
    if (durationSeconds < 60) return `${durationSeconds}s`;
    const minutes = Math.floor(durationSeconds / 60);
    const seconds = durationSeconds % 60;
    return `${minutes}m ${seconds}s`;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl! max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <JobTypeIcon jobType={job.jobType} showLabel={false} />
            Job Details
          </DialogTitle>
          <DialogDescription>
            Event ID: <code className="text-xs">{job.eventId}</code>
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="h-[60vh] pr-4">
          <div className="space-y-6">
            {/* Status Section */}
            <div>
              <h3 className="text-sm font-semibold text-slate-900 mb-2">
                Status
              </h3>
              <div className="flex items-center gap-3">
                <StatusBadge status={job.status} />
                {job.retryCount > 0 && (
                  <Badge variant="outline">
                    Retries: {job.retryCount}/{job.maxRetries}
                  </Badge>
                )}
              </div>
            </div>

            {/* Job Information */}
            <div>
              <h3 className="text-sm font-semibold text-slate-900 mb-2">
                Job Information
              </h3>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-slate-600">Type:</span>
                  <div className="mt-1">
                    <JobTypeIcon jobType={job.jobType} />
                  </div>
                </div>
                <div>
                  <span className="text-slate-600">Function ID:</span>
                  <p className="font-mono text-xs mt-1">
                    {job.functionId || "N/A"}
                  </p>
                </div>
                {job.storyId && (
                  <div>
                    <span className="text-slate-600">Story ID:</span>
                    <p className="font-mono text-xs mt-1">{job.storyId}</p>
                  </div>
                )}
                {job.chapterId && (
                  <div>
                    <span className="text-slate-600">Chapter ID:</span>
                    <p className="font-mono text-xs mt-1">{job.chapterId}</p>
                  </div>
                )}
                {job.languageCode && (
                  <div>
                    <span className="text-slate-600">Language:</span>
                    <p className="font-medium mt-1">{job.languageCode}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Timing Information */}
            <div>
              <h3 className="text-sm font-semibold text-slate-900 mb-2">
                Timing
              </h3>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-slate-600">Queued At:</span>
                  <p className="text-xs mt-1">{formatDate(job.queuedAt)}</p>
                </div>
                <div>
                  <span className="text-slate-600">Started At:</span>
                  <p className="text-xs mt-1">{formatDate(job.startedAt)}</p>
                </div>
                <div>
                  <span className="text-slate-600">Completed At:</span>
                  <p className="text-xs mt-1">{formatDate(job.completedAt)}</p>
                </div>
                <div>
                  <span className="text-slate-600">Duration:</span>
                  <p className="text-xs mt-1">{calculateDuration()}</p>
                </div>
              </div>
            </div>

            {/* Metadata */}
            {job.metadata && Object.keys(job.metadata).length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-slate-900 mb-2">
                  Metadata
                </h3>
                <pre className="bg-slate-50 p-3 rounded-md text-xs overflow-x-auto">
                  {JSON.stringify(job.metadata, null, 2)}
                </pre>
              </div>
            )}

            {/* Output */}
            {job.output && (
              <div>
                <h3 className="text-sm font-semibold text-slate-900 mb-2">
                  Output
                </h3>
                <pre className="bg-slate-50 p-3 rounded-md text-xs overflow-x-auto">
                  {JSON.stringify(job.output, null, 2)}
                </pre>
              </div>
            )}

            {/* Error */}
            {job.error && (
              <div>
                <h3 className="text-sm font-semibold text-red-900 mb-2">
                  Error
                </h3>
                <div className="bg-red-50 border border-red-200 p-3 rounded-md">
                  <pre className="text-xs text-red-800 overflow-x-auto">
                    {JSON.stringify(job.error, null, 2)}
                  </pre>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
