import { TTS_GENERATE_REQUESTED, TTSGenerateRequestedEvent } from "../events";
import { inngest } from "../inngest";
import axios from "axios";
import {
  AI_SERVICE_URL,
  CONTENT_SERVICE_URL,
} from "../../helpers/content.helpers";
import { API_BASE_URL_V1, ApiResponse, LanguageCode } from "@shared/src/types";
import { logger } from "../../utils/logger";

/**
 * Inngest function: Generate TTS audio in the background
 * Triggered by tts/generate.requested event
 */
export const generateTTSAudio = inngest.createFunction(
  {
    id: "ai-tts-generate",
    retries: 3,
    concurrency: { limit: 1 }, // ← Process one language at a time
  },
  { event: TTS_GENERATE_REQUESTED },
  async ({ event, step }) => {
    const eventData = event.data as TTSGenerateRequestedEvent;

    logger.info("[TTS Handler] Processing TTS generation", {
      storyId: eventData.storyId,
      chapterId: eventData.chapterId,
      languageCode: eventData.languageCode,
      textLength: eventData.text.length,
    });

    try {
      // Retry logic: use step.run for resilient execution with retries
      const result = await step.run("synthesize-text", async () => {
        logger.debug("[TTS Handler] Calling synthesizeText");
        return await axios.post<ApiResponse<{ audioUrl: string }>>(
          `${AI_SERVICE_URL}${API_BASE_URL_V1}/tts`,
          {
            text: eventData.text,
            languageCode: eventData.languageCode,
            storyId: eventData.storyId,
            chapterId: eventData.chapterId,
          },
          {
            headers: { "Content-Type": "application/json" },
            validateStatus: () => true,
          },
        );
      });

      if (result.status !== 200 || !result.data.success) {
        logger.error("[TTS Handler] TTS generation failed", {
          storyId: eventData.storyId,
          chapterId: eventData.chapterId,
          languageCode: eventData.languageCode,
          status: result.status,
          responseData: result.data,
        });
        throw new Error(`TTS generation failed with status ${result.status}`);
      }

      logger.info("[TTS Handler] TTS generation completed", {
        storyId: eventData.storyId,
        chapterId: eventData.chapterId,
        languageCode: eventData.languageCode,
        audioUrl: result.data.data?.audioUrl,
      });

      const audioUrl = result.data.data?.audioUrl;

      // Step 2: Update chapter audio in content service
      await step.run("update-chapter-audio", async () => {
        logger.debug(
          "[TTS Handler] Updating chapter audio in content service",
          {
            storyId: eventData.storyId,
            chapterId: eventData.chapterId,
            languageCode: eventData.languageCode,
            audioUrl,
          },
        );

        const updateUrl = `${CONTENT_SERVICE_URL}${API_BASE_URL_V1}/chapters/${eventData.chapterId}/audio`;

        const updateResponse = await axios.patch<ApiResponse<any>>(
          updateUrl,
          {
            audioUrl,
            languageCode: eventData.languageCode,
          },
          {
            headers: { "Content-Type": "application/json" },
            validateStatus: () => true,
          },
        );

        if (updateResponse.status !== 200 || !updateResponse.data.success) {
          logger.error(
            "[TTS Handler] Failed to update chapter audio in content service",
            {
              storyId: eventData.storyId,
              chapterId: eventData.chapterId,
              languageCode: eventData.languageCode,
              status: updateResponse.status,
              responseData: updateResponse.data,
            },
          );
          throw new Error(
            `Failed to update chapter audio with status ${updateResponse.status}`,
          );
        }

        logger.info("[TTS Handler] Chapter audio updated in content service", {
          storyId: eventData.storyId,
          chapterId: eventData.chapterId,
          languageCode: eventData.languageCode,
          audioUrl,
        });
      });

      return {
        success: true,
        audioUrl,
        storyId: eventData.storyId,
        chapterId: eventData.chapterId,
        languageCode: eventData.languageCode,
      };
    } catch (error) {
      logger.error("[TTS Handler] TTS generation failed", {
        storyId: eventData.storyId,
        chapterId: eventData.chapterId,
        languageCode: eventData.languageCode,
        error: String(error),
      });

      throw error; // Inngest will handle retries
    }
  },
);
