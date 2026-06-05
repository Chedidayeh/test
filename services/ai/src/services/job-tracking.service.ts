import prisma from "../lib/prisma";
import { InngestJob } from "@prisma/client";

export interface CreateJobData {
  eventId: string;
  functionId?: string;
  jobType: string;
  storyId?: string;
  chapterId?: string;
  challengeId?: string;
  languageCode?: string;
  metadata?: any;
}

export interface UpdateJobData {
  status?: string;
  runId?: string;
  startedAt?: Date;
  completedAt?: Date;
  output?: any;
  error?: any;
  retryCount?: number;
}

export interface JobFilters {
  jobType?: string;
  status?: string;
  storyId?: string;
  storyIds?: string[]; // Multiple story IDs for search
  chapterId?: string;
  languageCode?: string;
  limit?: number;
  offset?: number;
}

/**
 * Service for managing Inngest job tracking in the database
 */
export class JobTrackingService {
  /**
   * Create a new job tracking entry
   */
  static async createJob(data: CreateJobData): Promise<InngestJob> {
    return await prisma.inngestJob.create({
      data: {
        eventId: data.eventId,
        functionId: data.functionId,
        jobType: data.jobType,
        storyId: data.storyId,
        chapterId: data.chapterId,
        challengeId: data.challengeId,
        languageCode: data.languageCode,
        metadata: data.metadata || {},
        status: "queued",
      },
    });
  }

  /**
   * Update an existing job by event ID
   */
  static async updateJobByEventId(
    eventId: string,
    data: UpdateJobData,
  ): Promise<InngestJob | null> {
    try {
      return await prisma.inngestJob.update({
        where: { eventId },
        data,
      });
    } catch (error) {
      console.error(
        `[Job Tracking Service] Failed to update job ${eventId}:`,
        error,
      );
      return null;
    }
  }

  /**
   * Get a single job by event ID
   */
  static async getJobByEventId(eventId: string): Promise<InngestJob | null> {
    return await prisma.inngestJob.findUnique({
      where: { eventId },
    });
  }

  /**
   * Get all jobs with optional filters
   */
  static async getAllJobs(
    filters: JobFilters = {},
  ): Promise<{ jobs: InngestJob[]; total: number }> {
    const where: any = {};

    if (filters.jobType) {
      where.jobType = filters.jobType;
    }

    if (filters.status) {
      where.status = filters.status;
    }

    // Support both single storyId and multiple storyIds
    if (filters.storyId) {
      where.storyId = filters.storyId;
    } else if (filters.storyIds && filters.storyIds.length > 0) {
      where.storyId = { in: filters.storyIds };
    }

    if (filters.chapterId) {
      where.chapterId = filters.chapterId;
    }

    if (filters.languageCode) {
      where.languageCode = filters.languageCode;
    }

    const [jobs, total] = await Promise.all([
      prisma.inngestJob.findMany({
        where,
        orderBy: { createdAt: "desc" },
        take: filters.limit || 50,
        skip: filters.offset || 0,
      }),
      prisma.inngestJob.count({ where }),
    ]);

    return { jobs, total };
  }

  /**
   * Get jobs for a specific story
   */
  static async getJobsByStory(storyId: string): Promise<InngestJob[]> {
    return await prisma.inngestJob.findMany({
      where: { storyId },
      orderBy: { createdAt: "desc" },
    });
  }

  /**
   * Get jobs for a specific chapter
   */
  static async getJobsByChapter(chapterId: string): Promise<InngestJob[]> {
    return await prisma.inngestJob.findMany({
      where: { chapterId },
      orderBy: { createdAt: "desc" },
    });
  }

  /**
   * Delete old completed jobs (cleanup)
   */
  static async deleteOldJobs(olderThanDays: number = 30): Promise<number> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - olderThanDays);

    const result = await prisma.inngestJob.deleteMany({
      where: {
        status: { in: ["completed", "failed", "cancelled"] },
        completedAt: {
          lt: cutoffDate,
        },
      },
    });

    return result.count;
  }

  /**
   * Get job statistics
   */
  static async getJobStats(): Promise<{
    total: number;
    queued: number;
    running: number;
    completed: number;
    failed: number;
    cancelled: number;
  }> {
    const [total, queued, running, completed, failed, cancelled] =
      await Promise.all([
        prisma.inngestJob.count(),
        prisma.inngestJob.count({ where: { status: "queued" } }),
        prisma.inngestJob.count({ where: { status: "running" } }),
        prisma.inngestJob.count({ where: { status: "completed" } }),
        prisma.inngestJob.count({ where: { status: "failed" } }),
        prisma.inngestJob.count({ where: { status: "cancelled" } }),
      ]);

    return { total, queued, running, completed, failed, cancelled };
  }
}
