import { Router, Request, Response } from "express";
import axios from "axios";
import { logger } from "../utils/logger";
import { API_BASE_URL_V1, ApiResponse } from "@shared/src/types";

const router = Router();

const AI_SERVICE_URL = process.env.AI_SERVICE_URL;

/**
 * GET /api/v1/jobs - Get all jobs with optional filters
 * Database status is now authoritative (updated by Inngest functions)
 */
router.get("/jobs", async (req: Request, res: Response) => {
  try {
    if (!AI_SERVICE_URL) {
      logger.error("AI_SERVICE_URL not configured");
      return res.status(500).json({
        success: false,
        error: { code: "CONFIG_ERROR", message: "AI service not configured" },
      });
    }

    // Forward to AI service - database has accurate status from Inngest functions
    const url = `${AI_SERVICE_URL}${API_BASE_URL_V1}/jobs`;
    const response = await axios.get(url, {
      params: req.query,
      headers: { "Content-Type": "application/json" },
      validateStatus: () => true,
    });

    return res.status(response.status).json(response.data);
  } catch (error) {
    logger.error("Error fetching jobs", {
      error: error instanceof Error ? error.message : String(error),
    });

    return res.status(500).json({
      success: false,
      error: { code: "SERVER_ERROR", message: "Failed to fetch jobs" },
    });
  }
});

/**
 * GET /api/v1/jobs/stats - Get job statistics
 */
router.get("/jobs/stats", async (req: Request, res: Response) => {
  try {
    if (!AI_SERVICE_URL) {
      logger.error("AI_SERVICE_URL not configured");
      return res.status(500).json({
        success: false,
        error: { code: "CONFIG_ERROR", message: "AI service not configured" },
      });
    }

    const url = `${AI_SERVICE_URL}${API_BASE_URL_V1}/jobs/stats`;
    const response = await axios.get(url, {
      validateStatus: () => true,
    });

    return res.status(response.status).json(response.data);
  } catch (error) {
    logger.error("Error fetching job stats", {
      error: error instanceof Error ? error.message : String(error),
    });

    if (axios.isAxiosError(error) && error.response) {
      return res.status(error.response.status).json(error.response.data);
    }

    return res.status(500).json({
      success: false,
      error: { code: "SERVER_ERROR", message: "Failed to fetch job stats" },
    });
  }
});

/**
 * GET /api/v1/jobs/story/:storyId - Get all jobs for a story
 */
router.get("/jobs/story/:storyId", async (req: Request, res: Response) => {
  try {
    if (!AI_SERVICE_URL) {
      logger.error("AI_SERVICE_URL not configured");
      return res.status(500).json({
        success: false,
        error: { code: "CONFIG_ERROR", message: "AI service not configured" },
      });
    }

    const { storyId } = req.params;
    const url = `${AI_SERVICE_URL}${API_BASE_URL_V1}/jobs/story/${storyId}`;
    const response = await axios.get(url, {
      validateStatus: () => true,
    });

    return res.status(response.status).json(response.data);
  } catch (error) {
    logger.error("Error fetching jobs for story", {
      error: error instanceof Error ? error.message : String(error),
    });

    if (axios.isAxiosError(error) && error.response) {
      return res.status(error.response.status).json(error.response.data);
    }

    return res.status(500).json({
      success: false,
      error: {
        code: "SERVER_ERROR",
        message: "Failed to fetch jobs for story",
      },
    });
  }
});

/**
 * GET /api/v1/jobs/:eventId - Get a single job by event ID
 */
router.get("/jobs/:eventId", async (req: Request, res: Response) => {
  try {
    if (!AI_SERVICE_URL) {
      logger.error("AI_SERVICE_URL not configured");
      return res.status(500).json({
        success: false,
        error: { code: "CONFIG_ERROR", message: "AI service not configured" },
      });
    }

    const { eventId } = req.params;
    const url = `${AI_SERVICE_URL}${API_BASE_URL_V1}/jobs/${eventId}`;
    const response = await axios.get(url, {
      validateStatus: () => true,
    });

    return res.status(response.status).json(response.data);
  } catch (error) {
    logger.error("Error fetching job", {
      error: error instanceof Error ? error.message : String(error),
    });

    if (axios.isAxiosError(error) && error.response) {
      return res.status(error.response.status).json(error.response.data);
    }

    return res.status(500).json({
      success: false,
      error: { code: "SERVER_ERROR", message: "Failed to fetch job" },
    });
  }
});

/**
 * PATCH /api/v1/jobs/:eventId - Update job status (mainly for manual updates)
 */
router.patch("/jobs/:eventId", async (req: Request, res: Response) => {
  try {
    if (!AI_SERVICE_URL) {
      logger.error("AI_SERVICE_URL not configured");
      return res.status(500).json({
        success: false,
        error: { code: "CONFIG_ERROR", message: "AI service not configured" },
      });
    }

    const { eventId } = req.params;
    const url = `${AI_SERVICE_URL}${API_BASE_URL_V1}/jobs/${eventId}`;
    const response = await axios.patch(url, req.body, {
      headers: { "Content-Type": "application/json" },
    });

    return res.status(response.status).json(response.data);
  } catch (error) {
    logger.error("Error updating job", {
      error: error instanceof Error ? error.message : String(error),
    });

    if (axios.isAxiosError(error) && error.response) {
      return res.status(error.response.status).json(error.response.data);
    }

    return res.status(500).json({
      success: false,
      error: { code: "SERVER_ERROR", message: "Failed to update job" },
    });
  }
});

export default router;
