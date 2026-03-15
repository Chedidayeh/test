
import { TTS_GENERATE_REQUESTED, TTSGenerateRequestedEvent, TRANSLATION_STORY_REQUESTED, TranslationStoryRequestedEvent } from "../events";
import { LanguageCode, TranslationSourceType, CreateStoryWithChaptersInput, Story } from "@shared/src/types";
import { inngest } from "../inngest";
import { logger } from "../../utils/logger";

/**
 * Queue translation event to Inngest
 * Triggers background translation for story via a dedicated Inngest function
 * Passes full input data to be forwarded to content service endpoint
 */
export async function queueTranslationForStory(
  storyId: string,
  input: CreateStoryWithChaptersInput,
): Promise<{ eventId: string }> {
  try {
    logger.debug("[Translation Queue] Queueing story translation from gateway", {
      storyId,
      translationSource: input.translationSource,
    });

    const eventData: TranslationStoryRequestedEvent = {
      storyId,
      input,
      generateAudio: input.generateAudio, // Pass through the generateAudio flag to control TTS triggering in the translation function
    };

    // Send event to Inngest (non-blocking)
    const result = await inngest.send({
      name: TRANSLATION_STORY_REQUESTED,
      data: eventData,
    });

    const eventId = result.ids?.[0] || "unknown";

    logger.info("[Translation Queue] Story translation queued", {
      eventId,
      storyId,
      translationSource: input.translationSource,
    });

    return { eventId };
  } catch (error) {
    logger.error("[Translation Queue] Failed to queue story translation", {
      error: String(error),
      storyId,
      translationSource: input.translationSource,
    });
    throw error;
  }
}
export async function queueTTSGeneration(
  text: string,
  options: {
    languageCode: LanguageCode;
    storyId: string;
    chapterId: string;
  },
): Promise<{ eventId: string }> {
  try {
    logger.debug("[TTS Queue] Queueing TTS generation", {
      textLength: text.length,
      languageCode: options?.languageCode,
      storyId: options?.storyId,
      chapterId: options?.chapterId,
    });

    const eventData: TTSGenerateRequestedEvent = {
      text,
      languageCode: options?.languageCode,
      storyId: options?.storyId,
      chapterId: options?.chapterId,
    };

    // Send event to Inngest (non-blocking)
    const result = await inngest.send({
      name: TTS_GENERATE_REQUESTED,
      data: eventData,
    });

    logger.info("[TTS Queue] TTS generation queued", {
      eventId: result.ids?.[0],
      storyId: options?.storyId,
      chapterId: options?.chapterId,
    });

    return {
      eventId: result.ids?.[0] || "unknown",
    };
  } catch (error) {
    logger.error("[TTS Queue] Failed to queue TTS generation", {
      error: String(error),
      storyId: options?.storyId,
      chapterId: options?.chapterId,
    });
    throw error;
  }
}



/**
 * Trigger TTS generation for ALL story chapters
 * Queues TTS requests for each chapter and translation
 * The AI service (Inngest) handles concurrent processing in the background
 */
export async function triggerTTSGenerationForAllChapters(story: Story): Promise<void> {
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
              logger.info(
                "[Gateway] No translations found, queuing TTS for chapter base content",
                {
                  storyId: story.id,
                  chapterId: chapter.id,
                  chapterOrder: chapter.order,
                },
              );
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