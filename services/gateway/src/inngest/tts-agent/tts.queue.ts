
import { logger } from "src/utils/logger";
import { TTS_GENERATE_REQUESTED, TTSGenerateRequestedEvent } from "../events";
import { LanguageCode } from "@shared/src/types";
import { inngest } from "../inngest";

/**
 * Queue a TTS generation request to Inngest
 * Returns immediately with the event ID
 */
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
