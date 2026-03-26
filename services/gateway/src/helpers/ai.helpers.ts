import { Request, Response } from "express";

import axios from "axios";
import { logger } from "../utils/logger";
import { ChildProfileMatcher, ParentProfileMatcher } from "../services";
import {
  ApiResponse,
  ChildProfile,
  Child,
  User,
  ParentUser,
  Story,
  GameSession,
  Progress,
  ChallengeAttempt,
  StarEvent,
  SessionCheckpoint,
  AdminDashboardStats,
  API_BASE_URL_V1,
} from "@shared/src/types";

export const PROGRESS_SERVICE_URL =
  process.env.PROGRESS_SERVICE_URL
const AUTH_SERVICE_URL =
  process.env.AUTH_SERVICE_URL
const CONTENT_SERVICE_URL =
  process.env.CONTENT_SERVICE_URL
const AI_SERVICE_URL =
  process.env.AI_SERVICE_URL

export async function generateStorytelling(req: Request, res: Response) {
  try {
    // ====== STEP 1: Save Storytelling Profile ======
    // Extract payload from request body
    const {
      childProfileId,
      name,
      childLanguage,
      favoriteThemes,
      learningObjectives,
    } = req.body;

    // Validate required fields
    if (!childProfileId || !name || !childLanguage || !Array.isArray(favoriteThemes)) {
      logger.error("Invalid storytelling payload - missing required fields", {
        childProfileId,
        name,
        childLanguage,
        favoriteThemes,
      });
      return res.status(400).json({
        success: false,
        error: {
          code: "INVALID_PAYLOAD",
          message: "Missing required fields: childProfileId, name, childLanguage, favoriteThemes",
        },
      });
    }

    // Call progress service to save storytelling profile
    if (!PROGRESS_SERVICE_URL) {
      logger.error("PROGRESS_SERVICE_URL not configured");
      return res.status(500).json({
        success: false,
        error: {
          code: "CONFIG_ERROR",
          message: "Progress service not configured",
        },
      });
    }

    const saveStorytellingUrl = `${PROGRESS_SERVICE_URL}${API_BASE_URL_V1}/storytelling/profile`;
    const storytellingPayload = {
      childProfileId,
      childName: name,
      childLanguage,
      favoriteThemes,
      learningObjectives: learningObjectives || [],
    };

    const storytellingResponse = await axios.post(saveStorytellingUrl, storytellingPayload, {
    });

    if (!storytellingResponse.data.success) {
      logger.error("Failed to save storytelling profile", {
        error: storytellingResponse.data.error,
      });
      return res.status(400).json({
        success: false,
        error: {
          code: "STORYTELLING_SAVE_FAILED",
          message: "Failed to save storytelling profile",
        },
      });
    }

    logger.info("Storytelling profile saved successfully", {
      childProfileId,
      childName: name,
    });

    // Return success response with saved profile
    return res.status(200).json({
      success: true,
      data: {
        message: "Storytelling profile saved successfully",
        storytellingProfile: storytellingResponse.data.data,
      },
    });
  } catch (error) {
    logger.error("Error in generateStorytelling - Step 1", {
      error: error instanceof Error ? error.message : String(error),
    });

    if (axios.isAxiosError(error) && error.response) {
      return res.status(error.response.status).json(error.response.data);
    }

    return res.status(500).json({
      success: false,
      error: {
        code: "SERVICE_ERROR",
        message: "Failed to process storytelling generation",
      },
    });
  }
}
