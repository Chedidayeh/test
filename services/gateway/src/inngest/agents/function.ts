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
  ChildProfile,
  GeneratedStory,
  LanguageCode,
  Progress,
  Story,
} from "@shared/src/types";
import { logger } from "../../utils/logger";
import { triggerTTSGenerationForAllChapters } from "./queue";
import { PROGRESS_SERVICE_URL } from "src/helpers/progress.helpers";

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
        return await axios.post<
          ApiResponse<{
            audioUrl: string;
            challengeAudioUrl: string | undefined;
          }>
        >(
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

/**
 * Inngest cron job: Generate weekly AI storytelling stories for all children
 * Runs every week on Sunday at 6:00 AM UTC
 *
 * Process:
 * 1. STEP 1: Fetch all children profiles with storytelling enabled from Progress Service
 * 2. STEP 2: For each child, call AI Service to generate a new story based on their preferences
 * 3. STEP 3: Handle failures with retry logic and logging
 */
export const generateWeeklyAIStories = inngest.createFunction(
  {
    id: "generate-weekly-ai-stories",
    retries: 2,
    concurrency: { limit: 1 }, // Process up to 1 child at a time
  },
  { cron: "0 6 * * 0" }, // Every Sunday at 6:00 AM UTC
  async ({ step }) => {
    logger.info(
      "[Story Generation Cron] Starting weekly AI storytelling generation",
    );

    try {
      // ========================================================================
      // STEP 1: Fetch all children profiles with storytelling enabled
      // ========================================================================
      const allChildrenProfiles = (await step.run(
        "fetch-all-children-with-storytelling",
        async () => {
          logger.debug(
            "[Story Generation Cron] Fetching all children profiles from Progress Service",
          );

          if (!PROGRESS_SERVICE_URL) {
            throw new Error("PROGRESS_SERVICE_URL not configured");
          }

          const url = `${PROGRESS_SERVICE_URL}${API_BASE_URL_V1}/children/storytelling-all`;
          const response = await axios.get<ApiResponse<ChildProfile[]>>(url, {
            validateStatus: () => true,
          });

          if (response.status !== 200 || !response.data.success) {
            logger.error(
              "[Story Generation Cron] Failed to fetch children profiles",
              {
                status: response.status,
                error: response.data.error,
              },
            );
            throw new Error(
              `Failed to fetch children profiles: ${response.status}`,
            );
          }

          logger.info(
            "[Story Generation Cron] Successfully fetched children profiles",
            {
              totalCount: response.data.data?.length || 0,
            },
          );

          return response.data.data || [];
        },
      )) as unknown as ChildProfile[];

      if (!allChildrenProfiles || allChildrenProfiles.length === 0) {
        logger.info("[Story Generation Cron] No children profiles found");
        return {
          success: true,
          message: "No children profiles found",
          processedCount: 0,
        };
      }

      // ========================================================================
      // STEP 2: Generate stories for each child with storytelling enabled
      // ========================================================================
      const generationResults = await step.run(
        "generate-stories-for-all-children",
        async () => {
          logger.info(
            "[Story Generation Cron] Starting story generation for children",
            {
              totalChildren: allChildrenProfiles.length,
            },
          );

          const results = {
            successful: 0,
            failed: 0,
            skipped: 0,
            errors: [] as string[],
          };

          // Process each child profile
          for (const childProfile of allChildrenProfiles) {
            try {
              // Check if child has storytelling profile
              if (!childProfile.storytelling) {
                logger.debug(
                  "[Story Generation Cron] Skipping child without storytelling profile",
                  {
                    childProfileId: childProfile.id,
                    childName: childProfile.name,
                  },
                );
                results.skipped++;
                continue;
              }

              logger.debug(
                "[Story Generation Cron] Generating story for child",
                {
                  childProfileId: childProfile.id,
                  childName: childProfile.name,
                  childLanguage: childProfile.storytelling?.childLanguage,
                },
              );

              // Call AI Service to generate story
              if (!AI_SERVICE_URL) {
                throw new Error("AI_SERVICE_URL not configured");
              }

              const storyGenerationUrl = `${AI_SERVICE_URL}${API_BASE_URL_V1}/generate-child-storytelling`;

              // Create payload with childProfile for AI Service
              const storyPayload = {
                childProfile: childProfile,
              };

              const storyResponse = await axios.post<ApiResponse<GeneratedStory | { done: boolean }>>(
                storyGenerationUrl,
                storyPayload,
                {
                  validateStatus: () => true,
                },
              );

              if (storyResponse.status !== 200 || !storyResponse.data.success) {
                logger.error(
                  "[Story Generation Cron] Failed to generate story for child",
                  {
                    childProfileId: childProfile.id,
                    childName: childProfile.name,
                    status: storyResponse.status,
                    error: storyResponse.data.error,
                  },
                );
                results.failed++;
                results.errors.push(
                  `Child ${childProfile.name} (${childProfile.id}): ${storyResponse.data.error?.message || "Unknown error"}`,
                );
                continue;
              }

              // Check if a GeneratedStory was actually generated
              const generatedStory = storyResponse.data.data as GeneratedStory

              if (!generatedStory) {
                logger.info(
                  "[Story Generation Cron] No new story generated for child (plan complete or all stories done)",
                  {
                    childProfileId: childProfile.id,
                    childName: childProfile.name,
                  },
                );
                results.skipped++;
                continue;
              }

              // SYNC WITH CONTENT SERVICE: Create new story in content database
              logger.debug(
                "[Story Generation Cron] Syncing generated story with Content Service",
                {
                  childProfileId: childProfile.id,
                  storyId: generatedStory.id,
                  storyTitle: generatedStory.title,
                },
              );

              let contentStory: Story | null = null;

              try {
                if (!CONTENT_SERVICE_URL) {
                  throw new Error("CONTENT_SERVICE_URL not configured");
                }

                const contentSyncUrl = `${CONTENT_SERVICE_URL}${API_BASE_URL_V1}/stories/create-storytelling`;
                const storyPayloadForContent = {
                  generatedStory,
                };

                const contentSyncResponse = await axios.post<ApiResponse<Story>>(
                  contentSyncUrl,
                  storyPayloadForContent,
                  {
                    validateStatus: () => true,
                  },
                );

                if (contentSyncResponse.status === 200 || contentSyncResponse.status === 201) {
                  contentStory = contentSyncResponse.data.data as Story;
                  logger.debug(
                    "[Story Generation Cron] Story synced with Content Service",
                    {
                      storyId: contentStory?.id,
                      storyTitle: contentStory?.title,
                    },
                  );
                } else {
                  throw new Error(
                    `Content Service returned ${contentSyncResponse.status}: ${JSON.stringify(contentSyncResponse.data?.error)}`,
                  );
                }
              } catch (contentServiceError) {
                logger.error(
                  "[Story Generation Cron] Failed to sync with Content Service",
                  {
                    storyId: generatedStory.id,
                    error: String(contentServiceError),
                  },
                );
                throw contentServiceError; // Stop and retry via Inngest
              }

              // SYNC WITH PROGRESS SERVICE: Update child's story progress
              if (!contentStory) {
                throw new Error("No story returned from Content Service");
              }

              logger.debug(
                "[Story Generation Cron] Updating progress in Progress Service",
                {
                  childProfileId: childProfile.id,
                  storyId: contentStory.id,
                },
              );

              try {
                if (!PROGRESS_SERVICE_URL) {
                  throw new Error("PROGRESS_SERVICE_URL not configured");
                }

                const progressUpdateUrl = `${PROGRESS_SERVICE_URL}${API_BASE_URL_V1}/children/${childProfile.id}/storytelling/update`;
                const progressPayload = {
                  story: contentStory,
                };

                const progressResponse = await axios.put<ApiResponse<ChildProfile>>(
                  progressUpdateUrl,
                  progressPayload,
                  {
                    validateStatus: () => true,
                  },
                );

                if (progressResponse.status !== 200) {
                  throw new Error(
                    `Progress Service returned ${progressResponse.status}: ${JSON.stringify(progressResponse.data?.error)}`,
                  );
                }

                logger.debug(
                  "[Story Generation Cron] Progress updated in Progress Service",
                  {
                    childProfileId: childProfile.id,
                    storyId: contentStory.id,
                  },
                );
              } catch (progressServiceError) {
                logger.error(
                  "[Story Generation Cron] Failed to update Progress Service",
                  {
                    childProfileId: childProfile.id,
                    error: String(progressServiceError),
                  },
                );
                throw progressServiceError; // Stop and retry via Inngest
              }

              logger.info(
                "[Story Generation Cron] Story generated and synced successfully for child",
                {
                  childProfileId: childProfile.id,
                  childName: childProfile.name,
                  storyId: generatedStory.id,
                  storyTitle: generatedStory.title,
                },
              );
              results.successful++;
            } catch (error) {
              logger.error(
                "[Story Generation Cron] Exception while generating story for child",
                {
                  childProfileId: childProfile.id,
                  childName: childProfile.name,
                  error: String(error),
                },
              );
              results.failed++;
              results.errors.push(
                `Child ${childProfile.name} (${childProfile.id}): ${error instanceof Error ? error.message : String(error)}`,
              );
            }
          }

          return results;
        },
      );

      logger.info("[Story Generation Cron] Weekly story generation completed", {
        successful: generationResults.successful,
        failed: generationResults.failed,
        skipped: generationResults.skipped,
        total: allChildrenProfiles.length,
        errors:
          generationResults.errors.length > 0
            ? generationResults.errors
            : undefined,
      });

      return {
        success: true,
        message: "Weekly story generation completed",
        results: generationResults,
        processedCount:
          generationResults.successful +
          generationResults.failed +
          generationResults.skipped,
      };
    } catch (error) {
      logger.error("[Story Generation Cron] Weekly story generation failed", {
        error: String(error),
      });

      throw error; // Inngest will handle retries
    }
  },
);

/**
 * Inngest cron job: Generate weekly AI progress analytics for all children
 * Runs every week on Monday at 2:00 AM UTC
 *
 * Process:
 * 1. Fetch all child profiles from Progress Service
 * 2. Fetch each child's progress data (stories, challenges, attempts)
 * 3. Fetch stories content from Content Service that child has read
 * 4. Call AI Service to generate embeddings and insights for each child
 * 5. Handle failures with retry logic
 */
export const generateWeeklyAIAnalytics = inngest.createFunction(
  {
    id: "generate-weekly-ai-analytics",
    retries: 2,
    concurrency: { limit: 3 }, // Process up to 3 children in parallel per hour
  },
  { cron: "0 2 * * 1" }, // Every Monday at 2:00 AM UTC
  async ({ step }) => {
    logger.info(
      "[AI Analytics Cron] Starting weekly AI progress analytics generation",
    );

    try {
      // ========================================================================
      // STEP 1: Fetch all child profiles from Progress Service
      // ========================================================================
      const allChildren = (await step.run(
        "fetch-all-child-profiles",
        async () => {
          logger.debug(
            "[AI Analytics Cron] Fetching all child profiles from Progress Service",
          );

          const response = await axios.get<
            ApiResponse<{ children: ChildProfile[]; total: number }>
          >(`${PROGRESS_SERVICE_URL}${API_BASE_URL_V1}/children/all`, {
            headers: { "Content-Type": "application/json" },
            validateStatus: () => true,
          });

          if (response.status !== 200 || !response.data.success) {
            logger.error("[AI Analytics Cron] Failed to fetch child profiles", {
              status: response.status,
              error: response.data.error,
            });
            throw new Error(
              `Failed to fetch child profiles with status ${response.status}`,
            );
          }

          const rawChildren = response.data.data?.children || [];
          const total = response.data.data?.total || 0;

          // Deserialize child profiles to convert string dates to Date objects
          const children: ChildProfile[] = rawChildren.map(
            deserializeChildProfile,
          );

          logger.info("[AI Analytics Cron] Fetched child profiles", {
            totalChildren: children.length,
            total: total,
          });

          return children;
        },
      )) as unknown as ChildProfile[];

      if (!allChildren || allChildren.length === 0) {
        logger.info(
          "[AI Analytics Cron] No children found, completing cron job",
        );
        return {
          success: true,
          message: "No children found to process",
          processedCount: 0,
          failedCount: 0,
        };
      }

      // ========================================================================
      // STEP 2: Process each child - fetch data and generate analytics
      // ========================================================================
      const analyticsResults = await step.run(
        "generate-analytics-for-all-children",
        async () => {
          logger.debug(
            "[AI Analytics Cron] Generating analytics for all children",
            {
              totalToProcess: allChildren.length,
            },
          );

          const results = {
            successful: 0,
            failed: 0,
            errors: [] as Array<{ childId: string; error: string }>,
          };

          // Process children in batches to avoid overwhelming services
          const batchSize = 3;
          for (let i = 0; i < allChildren.length; i += batchSize) {
            const batch = allChildren.slice(
              i,
              Math.min(i + batchSize, allChildren.length),
            );

            const batchPromises = batch.map((child) =>
              processChildAnalytics(child).then(
                () => {
                  results.successful++;
                },
                (error) => {
                  results.failed++;
                  results.errors.push({
                    childId: child.id,
                    error: String(error),
                  });
                },
              ),
            );

            await Promise.all(batchPromises);
          }

          logger.info("[AI Analytics Cron] Analytics generation completed", {
            totalProcessed: allChildren.length,
            successful: results.successful,
            failed: results.failed,
            errorCount: results.errors.length,
          });

          return results;
        },
      );

      logger.info(
        "[AI Analytics Cron] Weekly AI analytics generation completed",
        {
          totalChildren: allChildren.length,
          successful: analyticsResults.successful,
          failed: analyticsResults.failed,
          errors:
            analyticsResults.errors.length > 0
              ? analyticsResults.errors
              : undefined,
        },
      );

      return {
        success: true,
        processedCount: allChildren.length,
        successfulCount: analyticsResults.successful,
        failedCount: analyticsResults.failed,
        errors:
          analyticsResults.errors.length > 0
            ? analyticsResults.errors
            : undefined,
      };
    } catch (error) {
      logger.error(
        "[AI Analytics Cron] Weekly AI analytics generation failed",
        {
          error: String(error),
          stack: error instanceof Error ? error.stack : "N/A",
        },
      );

      throw error; // Inngest will handle retries
    }
  },
);

/**
 * Process analytics for a single child
 * Uses progress data already fetched in STEP 1, then:
 * - Fetches stories from Content Service
 * - Calls AI Service to generate embeddings and insights
 */
async function processChildAnalytics(child: ChildProfile): Promise<void> {
  try {
    logger.debug("[AI Analytics] Starting analytics processing for child", {
      childProfileId: child.id,
    });

    // ====================================================================
    // Use child progress data already fetched in STEP 1
    // ====================================================================
    const childProgressData = child;
    const progressRecords = child.progress || [];

    logger.debug("[AI Analytics] Child progress data available", {
      childProfileId: child.id,
      progressCount: progressRecords.length,
    });

    // ====================================================================
    // STEP 2: Fetch stories from Content Service
    // ====================================================================
    logger.debug(
      "[AI Analytics] Fetching stories that child has read from Content Service",
      { childProfileId: child.id },
    );

    const storyIds = progressRecords
      .map((p: Progress) => p.storyId)
      .filter(Boolean);

    let storiesData: Story[] = [];

    if (storyIds.length > 0) {
      try {
        const storiesResponse = await axios.post<ApiResponse<Story[]>>(
          `${CONTENT_SERVICE_URL}${API_BASE_URL_V1}/stories/bulk`,
          { ids: storyIds },
          {
            headers: { "Content-Type": "application/json" },
            validateStatus: () => true,
          },
        );

        if (storiesResponse.status === 200 && storiesResponse.data.success) {
          storiesData = storiesResponse.data.data || [];
          logger.debug("[AI Analytics] Stories fetched from Content Service", {
            childProfileId: child.id,
            requestedCount: storyIds.length,
            fetchedCount: storiesData.length,
          });
        } else {
          logger.warn(
            "[AI Analytics] Failed to fetch stories from Content Service",
            {
              childProfileId: child.id,
              status: storiesResponse.status,
            },
          );
          // Continue without stories if fetch fails
        }
      } catch (storyError) {
        logger.warn(
          "[AI Analytics] Error fetching stories from Content Service",
          {
            childProfileId: child.id,
            error: String(storyError),
          },
        );
        // Continue without stories if fetch fails
      }
    } else {
      logger.info("[AI Analytics] Child has no progress records", {
        childProfileId: child.id,
      });
    }

    // ====================================================================
    // STEP 3: Call AI Service to generate embeddings and insights
    // ====================================================================
    logger.debug("[AI Analytics] Calling AI Service to generate insights", {
      childProfileId: child.id,
      storyCount: storiesData.length,
    });

    const aiPayload = {
      childProfile: child,
      storiesData: storiesData,
    };

    const aiResponse = await axios.post<ApiResponse<any>>(
      `${AI_SERVICE_URL}${API_BASE_URL_V1}/analytics/generate`,
      aiPayload,
      {
        headers: { "Content-Type": "application/json" },
        validateStatus: () => true,
      },
    );

    // ====================================================================
    // STEP 4: Handle AI Service Response
    // ====================================================================
    if (aiResponse.status === 200 && aiResponse.data.success) {
      const analyticsData = aiResponse.data.data;

      logger.info(
        "[AI Analytics] ✅ AI Service analytics generated successfully",
        {
          childProfileId: child.id,
          childName: analyticsData.childName,
          readingLevel: analyticsData.readingLevel,
          engagementScore: analyticsData.engagementScore,
        },
      );

      // Log detailed metrics
      // logger.debug("[AI Analytics] Analytics metrics", {
      //   childProfileId: child.id,
      //   metrics: {
      //     totalStoriesCompleted: analyticsData.metrics.totalStoriesCompleted,
      //     totalChallengesAttempted: analyticsData.metrics.totalChallengesAttempted,
      //     totalChallengesSolved: analyticsData.metrics.totalChallengesSolved,
      //     successRate: `${analyticsData.metrics.successRate.toFixed(2)}%`,
      //     averageAttemptsPerChallenge: analyticsData.metrics.averageAttemptsPerChallenge.toFixed(2),
      //     hintDependencyRate: `${analyticsData.metrics.hintDependencyRate.toFixed(2)}%`,
      //     starAchievementRate: `${analyticsData.metrics.starAchievementRate.toFixed(2)}%`,
      //   },
      // });

      // Log insights summary
      // logger.debug("[AI Analytics] Insights generated", {
      //   childProfileId: child.id,
      //   strengthsCount: analyticsData.insights.strengths.length,
      //   weaknessesCount: analyticsData.insights.weaknesses.length,
      //   recommendationsCount: analyticsData.insights.recommendations.length,
      //   tipsCount: analyticsData.insights.tips.length,
      //   strengths: analyticsData.insights.strengths,
      //   weaknesses: analyticsData.insights.weaknesses,
      //   tips: analyticsData.insights.tips,
      // });

      // logger.debug("[AI Analytics] Analytics period", {
      //   childProfileId: child.id,
      //   periodStart: analyticsData.periodStart,
      //   periodEnd: analyticsData.periodEnd,
      // });
    } else {
      logger.error("[AI Analytics] AI Service failed to generate analytics", {
        childProfileId: child.id,
        status: aiResponse.status,
        errorCode: aiResponse.data.error?.code,
        errorMessage: aiResponse.data.error?.message,
        fullResponse: aiResponse.data,
      });

      throw new Error(
        `AI Service analytics generation failed: ${aiResponse.data.error?.message || "Unknown error"}`,
      );
    }
  } catch (error) {
    logger.error("[AI Analytics] Error processing child analytics", {
      childProfileId: child.id,
      error: String(error),
      stack: error instanceof Error ? error.stack : "N/A",
    });
    throw error;
  }
}

/**
 * Deserialize API response into ChildProfile type with proper Date conversion
 * Axios returns dates as strings, need to convert them to Date objects
 */
function deserializeChildProfile(data: any): ChildProfile {
  if (!data) return data;

  // Convert child profile top-level dates
  const profile = {
    ...data,
    createdAt: new Date(data.createdAt),
    updatedAt: new Date(data.updatedAt),
    parent: data.parent
      ? {
          ...data.parent,
          emailVerified: data.parent.emailVerified
            ? new Date(data.parent.emailVerified)
            : undefined,
          createdAt: new Date(data.parent.createdAt),
          updatedAt: new Date(data.parent.updatedAt),
        }
      : undefined,
    child: data.child
      ? {
          ...data.child,
          createdAt: new Date(data.child.createdAt),
          updatedAt: new Date(data.child.updatedAt),
        }
      : undefined,
    progress: data.progress
      ? data.progress.map((p: any) => ({
          ...p,
          completedAt: p.completedAt ? new Date(p.completedAt) : undefined,
          createdAt: new Date(p.createdAt),
          updatedAt: new Date(p.updatedAt),
          gameSession: p.gameSession
            ? {
                ...p.gameSession,
                startedAt: new Date(p.gameSession.startedAt),
                checkpointAt: p.gameSession.checkpointAt
                  ? new Date(p.gameSession.checkpointAt)
                  : null,
                endedAt: p.gameSession.endedAt
                  ? new Date(p.gameSession.endedAt)
                  : null,
                createdAt: new Date(p.gameSession.createdAt),
                updatedAt: new Date(p.gameSession.updatedAt),
                checkpoints: p.gameSession.checkpoints
                  ? p.gameSession.checkpoints.map((cp: any) => ({
                      ...cp,
                      pausedAt: cp.pausedAt ? new Date(cp.pausedAt) : null,
                      resumedAt: cp.resumedAt ? new Date(cp.resumedAt) : null,
                      createdAt: new Date(cp.createdAt),
                      updatedAt: new Date(cp.updatedAt),
                    }))
                  : [],
              }
            : undefined,
        }))
      : [],
    badges: data.badges
      ? data.badges.map((b: any) => ({
          ...b,
          earnedAt: b.earnedAt ? new Date(b.earnedAt) : undefined,
          createdAt: new Date(b.createdAt),
          updatedAt: new Date(b.updatedAt),
        }))
      : [],
  };

  return profile;
}

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
