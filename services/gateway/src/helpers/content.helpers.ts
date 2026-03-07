import { Request, Response } from "express";

import axios from "axios";
import { logger } from "../utils/logger";
import { ApiResponse, Story, API_BASE_URL_V1, Chapter } from "@shared/types";

const CONTENT_SERVICE_URL =
  process.env.CONTENT_SERVICE_URL || "http://localhost:3003";
const AI_SERVICE_URL = process.env.AI_SERVICE_URL || "http://localhost:3005";
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

    const response = await axios.post<ApiResponse<Story>>(
      contentUrl,
      req.body,
      {
        headers,
        validateStatus: () => true,
      },
    );

    logger.debug("Content service createStory response", {
      status: response.status,
      hasData: !!response.data?.data,
    });

    if (response.status >= 200 && response.status < 300) {
      // Fire-and-forget: extract first chapter and ask AI service to generate TTS
      try {
        const story = response.data?.data as Story | undefined;
        const firstChapter = story?.chapters?.find((c: Chapter) => c.order === 1) || story?.chapters?.[0];

        if (story && firstChapter && firstChapter.content) {
          const ttsUrl = `${AI_SERVICE_URL}${API_BASE_URL_V1}/tts`;
          const ttsPayload = {
            text: firstChapter.content,
            voice: (req.body && req.body.voice) || undefined,
            languageCode: (req.body && req.body.languageCode) || undefined,
            prompt: (req.body && req.body.prompt) || undefined,
            storyId: story.id,
            chapterId: firstChapter.id,
          };

          const ttsHeaders: Record<string, string> = { "Content-Type": "application/json" };
          if (req.headers.authorization) ttsHeaders["authorization"] = String(req.headers.authorization);

          // don't block response; log result or error
          axios.post(ttsUrl, ttsPayload, { headers: ttsHeaders }).then((r) => {
            logger.info("Triggered AI TTS for first chapter", { storyId: story.id, chapterId: firstChapter.id, status: r.status });
          }).catch((err) => {
            logger.error("Failed to trigger AI TTS for first chapter", { storyId: story.id, chapterId: firstChapter.id, error: String(err) });
          });
        }

      } catch (err) {
        logger.error("Error while triggering AI TTS after content create", { error: String(err) });
      }

      return res.status(response.status).json(response.data);
    }

    if (response.status === 404) {
      logger.warn("Content service returned 404 for createStoryWithChapters", {
        url: contentUrl,
      });
      return res
        .status(404)
        .json({
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
    return res
      .status(503)
      .json({
        success: false,
        error: {
          code: "SERVICE_UNAVAILABLE",
          message: "Content service unavailable",
        },
        timestamp: new Date(),
      });
  }
}
