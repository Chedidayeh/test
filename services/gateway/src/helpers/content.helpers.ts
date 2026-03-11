import { Request, Response } from "express";

import axios from "axios";
import { logger } from "../utils/logger";
import { ApiResponse, Story, API_BASE_URL_V1, Chapter, LanguageCode } from "@shared/src/types";

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

    logger.info("Content service createStory response", {
      status: response.status,
      hasData: !!response.data?.data,
    });

    if (response.status >= 200 && response.status < 300) {
      // Extract first chapter and generate TTS for each language (awaiting each)
      try {
        const story = response.data?.data as Story | undefined;
        const firstChapter = story?.chapters?.find((c: Chapter) => c.order === 1) || story?.chapters?.[0];
        if (story && firstChapter) {
          const ttsUrl = `${AI_SERVICE_URL}${API_BASE_URL_V1}/tts`;
          const headers: Record<string, string> = { "Content-Type": "application/json" };
          if (req.headers.authorization) headers["authorization"] = String(req.headers.authorization);

          // Generate TTS for each language translation
          const translations = firstChapter.translations || [];
          
          // If no translations exist, use the chapter's base content with default language
          if (translations.length === 0 && firstChapter.content) {
            logger.info("No translations found for first chapter, generating TTS for base content")
            const defaultLanguageCode = (req.body && req.body.languageCode) || LanguageCode.EN;
            const ttsPayload = {
              text: firstChapter.content,
              languageCode: defaultLanguageCode,
              prompt: (req.body && req.body.prompt) || undefined,
              storyId: story.id,
              chapterId: firstChapter.id,
            };

            try {
              const r = await axios.post<ApiResponse<{ audioUrl: string }>>(ttsUrl, ttsPayload, { headers });
              logger.info("Completed AI TTS for first chapter (default language)", { 
                storyId: story.id, 
                chapterId: firstChapter.id,
                languageCode: defaultLanguageCode,
                status: r.status 
              });

              // Update chapter base audio URL
              if (r.data.success && r.data.data?.audioUrl) {
                try {
                  const updateUrl = `${CONTENT_SERVICE_URL}${API_BASE_URL_V1}/chapters/${firstChapter.id}/audio`;
                    await axios.patch(updateUrl, {
                    audioUrl: r.data.data.audioUrl,
                  }, { headers });

                  logger.info("Updated chapter base audio URL", {
                    chapterId: firstChapter.id,
                    audioUrl: r.data.data.audioUrl,
                  });
                } catch (updateErr) {
                  logger.error("Failed to update chapter base audio URL", {
                    chapterId: firstChapter.id,
                    error: String(updateErr),
                  });
                }
              }
            } catch (err) {
              logger.error("Failed to generate AI TTS for first chapter (default language)", { 
                storyId: story.id, 
                chapterId: firstChapter.id,
                languageCode: defaultLanguageCode,
                error: String(err) 
              });
            }
          } else {
            logger.info("Generating TTS for first chapter translations")
            // Generate TTS for each translation (sequentially)
            for (const translation of translations) {
              const ttsPayload = {
                text: translation.content,
                languageCode: translation.languageCode,
                prompt: (req.body && req.body.prompt) || undefined,
                storyId: story.id,
                chapterId: firstChapter.id,
              };

              try {
                const r = await axios.post<ApiResponse<{ audioUrl: string }>>(ttsUrl, ttsPayload, { headers });
                logger.info("Completed AI TTS for first chapter translation", { 
                  storyId: story.id, 
                  chapterId: firstChapter.id,
                  languageCode: translation.languageCode,
                  status: r.status 
                });

                // Update chapter translation with audio URL
                if (r.data.success && r.data.data?.audioUrl) {
                  try {
                    const updateUrl = `${CONTENT_SERVICE_URL}${API_BASE_URL_V1}/chapters/${firstChapter.id}/audio`;
                    await axios.patch(updateUrl, {
                      audioUrl: r.data.data.audioUrl,
                      languageCode: translation.languageCode,
                    }, { headers });

                    logger.info("Updated chapter translation audio URL", {
                      chapterId: firstChapter.id,
                      languageCode: translation.languageCode,
                      audioUrl: r.data.data.audioUrl,
                    });
                  } catch (updateErr) {
                    logger.error("Failed to update chapter translation audio URL", {
                      chapterId: firstChapter.id,
                      languageCode: translation.languageCode,
                      error: String(updateErr),
                    });
                  }
                }
              } catch (err) {
                logger.error("Failed to generate AI TTS for first chapter translation", { 
                  storyId: story.id, 
                  chapterId: firstChapter.id,
                  languageCode: translation.languageCode,
                  error: String(err) 
                });
              }
            }
          }
        }

      } catch (err) {
        logger.error("Error while generating AI TTS after content create", { error: String(err) });
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
