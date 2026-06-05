import { Request, Response } from "express";
import { JobTrackingService } from "../services/job-tracking.service";
import { ApiResponse } from "@shared/src/types";

/**
 * Controller for Inngest job tracking endpoints
 */
export class JobTrackingController {
  /**
   * POST /api/v1/jobs - Create a new job tracking entry
   */
  async createJob(req: Request, res: Response<ApiResponse<any>>) {
    try {
      const {
        eventId,
        functionId,
        jobType,
        storyId,
        chapterId,
        challengeId,
        languageCode,
        metadata,
      } = req.body;

      if (!eventId || !jobType) {
        return res.status(400).json({
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "eventId and jobType are required",
          },
          timestamp: new Date(),
        });
      }

      const job = await JobTrackingService.createJob({
        eventId,
        functionId,
        jobType,
        storyId,
        chapterId,
        challengeId,
        languageCode,
        metadata,
      });

      return res.status(201).json({
        success: true,
        data: job,
        timestamp: new Date(),
      });
    } catch (error) {
      console.error("[Job Tracking] Error creating job:", error);
      return res.status(500).json({
        success: false,
        error: {
          code: "SERVER_ERROR",
          message: "Failed to create job",
        },
        timestamp: new Date(),
      });
    }
  }

  /**
   * PATCH /api/v1/jobs/:eventId - Update job status
   */
  async updateJob(req: Request, res: Response<ApiResponse<any>>) {
    try {
      const { eventId } = req.params;
      const updateData = req.body;

      const job = await JobTrackingService.updateJobByEventId(
        eventId,
        updateData,
      );

      if (!job) {
        return res.status(404).json({
          success: false,
          error: {
            code: "NOT_FOUND",
            message: `Job with eventId ${eventId} not found`,
          },
          timestamp: new Date(),
        });
      }

      return res.status(200).json({
        success: true,
        data: job,
        timestamp: new Date(),
      });
    } catch (error) {
      console.error("[Job Tracking] Error updating job:", error);
      return res.status(500).json({
        success: false,
        error: {
          code: "SERVER_ERROR",
          message: "Failed to update job",
        },
        timestamp: new Date(),
      });
    }
  }

  /**
   * GET /api/v1/jobs - Get all jobs with filters
   */
  async getAllJobs(req: Request, res: Response<ApiResponse<any>>) {
    try {
      const filters = {
        jobType: req.query.jobType as string | undefined,
        status: req.query.status as string | undefined,
        storyId: req.query.storyId as string | undefined,
        storyIds: req.query.storyIds 
          ? (req.query.storyIds as string).split(',').filter(id => id.trim())
          : undefined,
        chapterId: req.query.chapterId as string | undefined,
        languageCode: req.query.languageCode as string | undefined,
        limit: req.query.limit ? parseInt(req.query.limit as string) : 50,
        offset: req.query.offset ? parseInt(req.query.offset as string) : 0,
      };

      const { jobs, total } = await JobTrackingService.getAllJobs(filters);

      return res.status(200).json({
        success: true,
        data: jobs,
        pagination: {
          total,
          page: Math.floor((filters.offset || 0) / (filters.limit || 50)) + 1,
          pageSize: filters.limit || 50,
          hasMore: (filters.offset || 0) + jobs.length < total,
        },
        timestamp: new Date(),
      });
    } catch (error) {
      console.error("[Job Tracking] Error fetching jobs:", error);
      return res.status(500).json({
        success: false,
        error: {
          code: "SERVER_ERROR",
          message: "Failed to fetch jobs",
        },
        timestamp: new Date(),
      });
    }
  }

  /**
   * GET /api/v1/jobs/:eventId - Get a single job by event ID
   */
  async getJobByEventId(req: Request, res: Response<ApiResponse<any>>) {
    try {
      const { eventId } = req.params;

      const job = await JobTrackingService.getJobByEventId(eventId);

      if (!job) {
        return res.status(404).json({
          success: false,
          error: {
            code: "NOT_FOUND",
            message: `Job with eventId ${eventId} not found`,
          },
          timestamp: new Date(),
        });
      }

      return res.status(200).json({
        success: true,
        data: job,
        timestamp: new Date(),
      });
    } catch (error) {
      console.error("[Job Tracking] Error fetching job:", error);
      return res.status(500).json({
        success: false,
        error: {
          code: "SERVER_ERROR",
          message: "Failed to fetch job",
        },
        timestamp: new Date(),
      });
    }
  }

  /**
   * GET /api/v1/jobs/story/:storyId - Get all jobs for a story
   */
  async getJobsByStory(req: Request, res: Response<ApiResponse<any>>) {
    try {
      const { storyId } = req.params;

      const jobs = await JobTrackingService.getJobsByStory(storyId);

      return res.status(200).json({
        success: true,
        data: jobs,
        timestamp: new Date(),
      });
    } catch (error) {
      console.error("[Job Tracking] Error fetching jobs by story:", error);
      return res.status(500).json({
        success: false,
        error: {
          code: "SERVER_ERROR",
          message: "Failed to fetch jobs",
        },
        timestamp: new Date(),
      });
    }
  }

  /**
   * GET /api/v1/jobs/chapter/:chapterId - Get all jobs for a chapter
   */
  async getJobsByChapter(req: Request, res: Response<ApiResponse<any>>) {
    try {
      const { chapterId } = req.params;

      const jobs = await JobTrackingService.getJobsByChapter(chapterId);

      return res.status(200).json({
        success: true,
        data: jobs,
        timestamp: new Date(),
      });
    } catch (error) {
      console.error("[Job Tracking] Error fetching jobs by chapter:", error);
      return res.status(500).json({
        success: false,
        error: {
          code: "SERVER_ERROR",
          message: "Failed to fetch jobs",
        },
        timestamp: new Date(),
      });
    }
  }

  /**
   * GET /api/v1/jobs/stats - Get job statistics
   */
  async getJobStats(req: Request, res: Response<ApiResponse<any>>) {
    try {
      const stats = await JobTrackingService.getJobStats();

      return res.status(200).json({
        success: true,
        data: stats,
        timestamp: new Date(),
      });
    } catch (error) {
      console.error("[Job Tracking] Error fetching job stats:", error);
      return res.status(500).json({
        success: false,
        error: {
          code: "SERVER_ERROR",
          message: "Failed to fetch job stats",
        },
        timestamp: new Date(),
      });
    }
  }
}

export const jobTrackingController = new JobTrackingController();
