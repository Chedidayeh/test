import { Request, Response } from "express";

import axios from "axios";
import { logger } from "../utils/logger";
import {
  ApiResponse,
  Story,
  API_BASE_URL_V1,
  Chapter,
  LanguageCode,
  CreateStoryWithChaptersInput,
} from "@shared/src/types";
import {
  queueTTSGeneration,
  queueTranslationForStory,
} from "../inngest/agents/queue";

export const CONTENT_SERVICE_URL = process.env.CONTENT_SERVICE_URL;
export const AI_SERVICE_URL = process.env.AI_SERVICE_URL;
/**
 * Helper function to forward requests to the content service
 */
export async function forwardToContentService(
  req: Request,
  res: Response,
  basePath: string,
): Promise<void> {
  try {
    const contentUrl = `${CONTENT_SERVICE_URL}${basePath}`;

    logger.debug("Forwarding content request to service", {
      method: req.method,
      path: req.path,
      targetUrl: contentUrl,
      queryParams: req.query,
    });

    const response = await axios({
      method: req.method,
      url: contentUrl,
      params: req.query,
      data: req.body,
      headers: {
        "Content-Type": "application/json",
      },
      validateStatus: () => true,
    });

    res.status(response.status).json(response.data);
  } catch (error) {
    logger.error("Content service forward error", {
      error: String(error),
      path: req.path,
    });
    res.status(503).json({ error: "Content service unavailable" });
  }
}

export async function createStoryWithChapters(
  req: Request,
  res: Response<ApiResponse<Story>>,
) {
  try {
    // Step 1: Call content service to create story with chapters
    const contentUrl = `${CONTENT_SERVICE_URL}${API_BASE_URL_V1}/stories/batch/create`;

    logger.info("Forwarding createStoryWithChapters to content service", {
      url: contentUrl,
      chapters: Array.isArray(req.body?.chapters)
        ? req.body.chapters.length
        : undefined,
    });

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...(req.headers.authorization
        ? { Authorization: String(req.headers.authorization) }
        : {}),
    };

    const input: CreateStoryWithChaptersInput = req.body;

    const response = await axios.post<ApiResponse<Story>>(contentUrl, input, {
      headers,
      validateStatus: () => true,
    });

    logger.info("Content service createStory response", {
      status: response.status,
      hasData: !!response.data?.data,
    });

    if (response.status >= 200 && response.status < 300) {
      // Step 2: Trigger TTS generation for ALL chapters via AI service (async, non-blocking)
      // This happens in the background without blocking the API response
      try {
        const story = response.data?.data as Story | undefined;

        if (story && story.chapters && story.chapters.length > 0) {
          // trigger Translation for the story in the background (fire-and-forget)
          await triggerTranslationForStory(story.id, input);
          // Only trigger TTS generation when client requested audio generation
          // if (input.generateAudio) {
          //   // Trigger TTS generation for all chapters in AI service (fire-and-forget)
          //   await triggerTTSGenerationForAllChapters(story);
          // } else {
          //   logger.info(
          //     "[Gateway] Skipping TTS trigger because generateAudio=false",
          //   );
          // }
        }
      } catch (err) {
        logger.error("Error while triggering TTS after content create", {
          error: String(err),
        });
        // Non-fatal: story was created successfully, TTS trigger failure shouldn't break response
      }

      // Return story immediately (TTS triggered in background)
      return res.status(response.status).json(response.data);
    }

    if (response.status === 404) {
      logger.warn("Content service returned 404 for createStoryWithChapters", {
        url: contentUrl,
      });
      return res.status(404).json({
        success: false,
        error: { code: "NOT_FOUND", message: "Resource not found" },
        timestamp: new Date(),
      });
    }

    logger.error("Content service returned error for createStoryWithChapters", {
      status: response.status,
      body: response.data,
    });
    return res.status(response.status).json(response.data);
  } catch (error) {
    logger.error("Error forwarding createStoryWithChapters", {
      error: String(error),
    });
    return res.status(503).json({
      success: false,
      error: {
        code: "SERVICE_UNAVAILABLE",
        message: "Content service unavailable",
      },
      timestamp: new Date(),
    });
  }
}

export async function editStoryWithChapters(
  req: Request,
  res: Response<ApiResponse<Story>>,
) {
  try {
    const { id } = req.params;

    if (!id) {
      logger.warn("Edit story request missing ID in URL");
      return res.status(400).json({
        success: false,
        error: {
          code: "INVALID_PARAM",
          message: "Story ID is required in URL",
        },
        timestamp: new Date(),
      });
    }
    // Step 1: Call content service to edit story with chapters
    const contentUrl = `${CONTENT_SERVICE_URL}${API_BASE_URL_V1}/stories/${id}/batch/edit`;

    logger.info("Forwarding editStoryWithChapters to content service", {
      url: contentUrl,
      chapters: Array.isArray(req.body?.chapters)
        ? req.body.chapters.length
        : undefined,
    });

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...(req.headers.authorization
        ? { Authorization: String(req.headers.authorization) }
        : {}),
    };

    const response = await axios.put<ApiResponse<Story>>(contentUrl, req.body, {
      headers,
      validateStatus: () => true,
    });

    logger.info("Content service editStory response", {
      status: response.status,
      hasData: !!response.data?.data,
    });

    if (response.status >= 200 && response.status < 300) {
      // Step 2: Trigger TTS generation for ALL chapters via AI service (async, non-blocking)
      // This happens in the background without blocking the API response
      try {
        const story = response.data?.data as Story | undefined;

        if (story && story.chapters && story.chapters.length > 0) {
          // Trigger translation for the story in the background (fire-and-forget)
          const input: CreateStoryWithChaptersInput = req.body;
          await triggerTranslationForStory(story.id, input);
        }
      } catch (err) {
        logger.error("Error while triggering TTS after content edit", {
          error: String(err),
        });
        // Non-fatal: story was edited successfully, TTS trigger failure shouldn't break response
      }

      // Return story immediately (TTS triggered in background)
      return res.status(response.status).json(response.data);
    }

    if (response.status === 404) {
      logger.warn("Content service returned 404 for editStoryWithChapters", {
        url: contentUrl,
      });
      return res.status(404).json({
        success: false,
        error: { code: "NOT_FOUND", message: "Resource not found" },
        timestamp: new Date(),
      });
    }

    logger.error("Content service returned error for editStoryWithChapters", {
      status: response.status,
      body: response.data,
    });
    return res.status(response.status).json(response.data);
  } catch (error) {
    logger.error("Error forwarding editStoryWithChapters", {
      error: String(error),
    });
    return res.status(503).json({
      success: false,
      error: {
        code: "SERVICE_UNAVAILABLE",
        message: "Content service unavailable",
      },
      timestamp: new Date(),
    });
  }
}

async function triggerTranslationForStory(
  storyId: string,
  input: CreateStoryWithChaptersInput,
): Promise<void> {
  try {
    if (!storyId) {
      logger.warn("[Gateway] No story ID provided for translation trigger");
      return;
    }

    if (!input.translationSource) {
      logger.info(
        "[Gateway] No translation source specified, skipping translation trigger",
        { storyId },
      );
      return;
    }

    logger.info("[Gateway] Triggering translation for story", {
      storyId,
      translationSource: input.translationSource,
    });

    // Queue the translation event to Inngest
    // This is fire-and-forget: returns immediately without waiting for translation to complete
    await queueTranslationForStory(storyId, input);

    logger.info("[Gateway] Translation event queued successfully", {
      storyId,
      translationSource: input.translationSource,
    });
  } catch (err) {
    logger.error("[Gateway] Failed to queue translation event", {
      storyId,
      translationSource: input.translationSource,
      error: String(err),
    });
    // Non-fatal: story was created successfully, translation trigger failure shouldn't break response
  }
}


