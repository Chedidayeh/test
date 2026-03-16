import {
  TTS_GENERATE_REQUESTED,
  TTSGenerateRequestedEvent,
  TRANSLATION_STORY_REQUESTED,
  TranslationStoryRequestedEvent,
} from "../events";
import { inngest } from "../inngest";
import axios from "axios";
import {
  AI_SERVICE_URL,
  CONTENT_SERVICE_URL,
} from "../../helpers/content.helpers";
import {
  API_BASE_URL_V1,
  ApiResponse,
  LanguageCode,
  Story,
} from "@shared/src/types";
import { logger } from "../../utils/logger";
import { triggerTTSGenerationForAllChapters } from "./queue";

/**
 * Deserialize API response into Story type with proper Date conversion
 * Axios returns dates as strings, need to convert them to Date objects
 */
function deserializeStory(data: any): Story {
  if (!data) return data;

  // Convert createdAt and updatedAt strings to Date objects
  const story = {
    ...data,
    createdAt: new Date(data.createdAt),
    updatedAt: new Date(data.updatedAt),
  };

  // Convert world dates
  if (story.world) {
    story.world = {
      ...story.world,
      createdAt: new Date(story.world.createdAt),
      updatedAt: new Date(story.world.updatedAt),
    };
  }

  // Convert chapter dates and nested dates
  if (story.chapters && Array.isArray(story.chapters)) {
    story.chapters = story.chapters.map((ch: any) => ({
      ...ch,
      createdAt: new Date(ch.createdAt),
      updatedAt: new Date(ch.updatedAt),
      challenge: ch.challenge
        ? {
            ...ch.challenge,
            createdAt: new Date(ch.challenge.createdAt),
            updatedAt: new Date(ch.challenge.updatedAt),
            answers:
              ch.challenge.answers?.map((ans: any) => ({
                ...ans,
                createdAt: new Date(ans.createdAt),
                updatedAt: new Date(ans.updatedAt),
              })) || [],
          }
        : undefined,
    }));
  }

  return story;
}

/**
 * Inngest function: Trigger translation generation in background
 * Triggered by translation/story.requested event from gateway
 * Calls content service endpoint to execute translations
 * Receives full input data from gateway to forward to content service
 */
export const generateStoryTranslations = inngest.createFunction(
  {
    id: "gateway-trigger-story-translations",
    retries: 3,
    concurrency: { limit: 1 },
  },
  { event: TRANSLATION_STORY_REQUESTED },
  async ({ event, step }) => {
    const eventData = event.data as TranslationStoryRequestedEvent;

    logger.info("[Translation Handler] Processing story translation trigger", {
      storyId: eventData.storyId,
      translationSource: eventData.input.translationSource,
    });

    try {
      // Call content service to trigger translation execution
      const result = await step.run(
        "trigger-content-translations",
        async () => {
          logger.debug(
            "[Translation Handler] Calling content service to trigger translations",
            {
              storyId: eventData.storyId,
              translationSource: eventData.input.translationSource,
            },
          );

          const contentUrl = `${CONTENT_SERVICE_URL}${API_BASE_URL_V1}/stories/${eventData.storyId}/translations/execute`;

          return await axios.post<ApiResponse<Story>>(
            contentUrl,

            eventData.input,

            {
              headers: { "Content-Type": "application/json" },
              validateStatus: () => true,
            },
          );
        },
      );

      if (result.status !== 200 || !result.data.success) {
        logger.error("[Translation Handler] Translation trigger failed", {
          storyId: eventData.storyId,
          translationSource: eventData.input.translationSource,
          status: result.status,
          responseData: result.data,
        });
        throw new Error(
          `Translation trigger failed with status ${result.status}`,
        );
      }

      logger.info("[Translation Handler] Translation trigger completed", {
        storyId: eventData.storyId,
        translationSource: eventData.input.translationSource,
        result: result.data.data,
      });

      // Deserialize response
      const story = deserializeStory(result.data.data);

      // Only trigger TTS generation if explicitly requested via generateAudio flag
      if (eventData.generateAudio) {
        logger.info("[Translation Handler] Triggering TTS generation", {
          storyId: eventData.storyId,
          generateAudio: eventData.generateAudio,
        });
        await triggerTTSGenerationForAllChapters(story);
      } else {
        logger.info(
          "[Translation Handler] Skipping TTS generation - generateAudio flag not set",
          {
            storyId: eventData.storyId,
            generateAudio: eventData.generateAudio,
          },
        );
      }

      return {
        success: true,
        storyId: eventData.storyId,
        translationSource: eventData.input.translationSource,
        result: result.data.data,
      };
    } catch (error) {
      logger.error("[Translation Handler] Story translation trigger failed", {
        storyId: eventData.storyId,
        translationSource: eventData.input.translationSource,
        error: String(error),
      });

      throw error; // Inngest will handle retries
    }
  },
);
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

      challengeQuestion: eventData.challengeQuestion,
    });

    try {
      // Retry logic: use step.run for resilient execution with retries
      const result = await step.run("synthesize-text", async () => {
        logger.debug("[TTS Handler] Calling synthesizeText");
        return await axios.post<ApiResponse<{ audioUrl: string; challengeAudioUrl: string | undefined }>>(
          `${AI_SERVICE_URL}${API_BASE_URL_V1}/tts`,
          {
            text: eventData.text,
            languageCode: eventData.languageCode,
            storyId: eventData.storyId,
            chapterId: eventData.chapterId,
            challengeId: eventData.challengeId,
            challengeQuestion: eventData.challengeQuestion,
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
        challengeAudioUrl: result.data.data?.challengeAudioUrl,
      });

      const audioUrl = result.data.data?.audioUrl;
      const challengeAudioUrl = result.data.data?.challengeAudioUrl;

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
            challengeAudioUrl,
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
          challengeAudioUrl,
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
