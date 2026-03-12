import { Request, Response } from "express";

import axios from "axios";
import { logger } from "../utils/logger";
import {
  ApiResponse,
  Story,
  API_BASE_URL_V1,
  Chapter,
  LanguageCode,
} from "@shared/src/types";
import { queueTTSGeneration } from "src/inngest/tts-agent/tts.queue";

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
      // Step 2: Trigger TTS generation for ALL chapters via AI service (async, non-blocking)
      // This happens in the background without blocking the API response
      try {
        const story = response.data?.data as Story | undefined;

        if (story && story.chapters && story.chapters.length > 0) {
          // Only trigger TTS generation when client requested audio generation
          if (req.body?.generateAudio) {
            // Trigger TTS generation for all chapters in AI service (fire-and-forget)
            await triggerTTSGenerationForAllChapters(story);
          } else {
            logger.info(
              "[Gateway] Skipping TTS trigger because generateAudio=false",
            );
          }
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
          // Only trigger TTS generation when client requested audio generation
          if (req.body?.generateAudio) {
            // Trigger TTS generation for all chapters in AI service (fire-and-forget)
            await triggerTTSGenerationForAllChapters(story);
          } else {
            logger.info(
              "[Gateway] Skipping TTS trigger because generateAudio=false",
            );
          }
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

/**
 * Trigger TTS generation for ALL story chapters
 * Queues TTS requests for each chapter and translation
 * The AI service (Inngest) handles concurrent processing in the background
 */
async function triggerTTSGenerationForAllChapters(story: Story): Promise<void> {
  try {
    if (!story || !story.chapters || story.chapters.length === 0) {
      logger.warn("[Gateway] No chapters found for TTS generation");
      return;
    }

    logger.info("[Gateway] Triggering TTS generation for all chapters", {
      storyId: story.id,
      chapterCount: story.chapters.length,
      totalTranslations: story.chapters.reduce(
        (sum, ch) => sum + (ch.translations?.length || 0),
        0,
      ),
    });

    let queuedCount = 0;
    let errorCount = 0;

    // Build array of all TTS requests to execute in parallel
    const ttsPromises: Promise<void>[] = [];

    // Process each chapter and collect all TTS requests
    for (const chapter of story.chapters) {
      if (!chapter) continue;

      const translations = chapter.translations || [];

      // If no translations exist, trigger for base content with default language
      if (translations.length === 0 && chapter.content) {
        ttsPromises.push(
          (async () => {
            try {
              logger.info("[Gateway] No translations found, queuing TTS for chapter base content", {
                storyId: story.id,
                chapterId: chapter.id,
                chapterOrder: chapter.order,
              });
              // Trigger TTS generation for base content with default language (e.g., English)
              await queueTTSGeneration(chapter.content, {
                languageCode: LanguageCode.EN,
                storyId: story.id,
                chapterId: chapter.id,
              });

              queuedCount++;
              logger.debug("[Gateway] TTS queued for chapter (base content)", {
                storyId: story.id,
                chapterId: chapter.id,
                chapterOrder: chapter.order,
                languageCode: LanguageCode.EN,
              });
            } catch (err) {
              errorCount++;
              logger.error(
                "[Gateway] Failed to queue TTS for chapter base content",
                {
                  storyId: story.id,
                  chapterId: chapter.id,
                  chapterOrder: chapter.order,
                  error: String(err),
                },
              );
            }
          })(),
        );
      } else {
        // Trigger TTS for each translation
        for (const translation of translations) {
          ttsPromises.push(
            (async () => {
              try {
                logger.info("[Gateway] Queuing TTS for chapter translation", {
                  storyId: story.id,
                  chapterId: chapter.id,
                  chapterOrder: chapter.order,
                  languageCode: translation.languageCode,
                });
                await queueTTSGeneration(translation.content, {
                  languageCode: translation.languageCode,
                  storyId: story.id,
                  chapterId: chapter.id,
                });

                queuedCount++;
                logger.debug("[Gateway] TTS queued for chapter translation", {
                  storyId: story.id,
                  chapterId: chapter.id,
                  chapterOrder: chapter.order,
                  languageCode: translation.languageCode,
                });
              } catch (err) {
                errorCount++;
                logger.error(
                  "[Gateway] Failed to queue TTS for chapter translation",
                  {
                    storyId: story.id,
                    chapterId: chapter.id,
                    chapterOrder: chapter.order,
                    languageCode: translation.languageCode,
                    error: String(err),
                  },
                );
              }
            })(),
          );
        }
      }
    }

    // Execute all TTS requests in parallel
    logger.debug("[Gateway] Queuing TTS requests in parallel", {
      storyId: story.id,
      totalRequests: ttsPromises.length,
    });

    await Promise.all(ttsPromises);

    logger.info("[Gateway] Completed queuing TTS for all chapters", {
      storyId: story.id,
      queuedCount,
      errorCount,
      totalAttempted: queuedCount + errorCount,
      parallelRequests: ttsPromises.length,
    });
  } catch (err) {
    logger.error("[Gateway] Error triggering TTS generation for all chapters", {
      error: String(err),
    });
  }
}
