/**
 * Transaction Helper for Story Creation
 * Manages atomic database transactions for nested story creation
 * Ensures all operations succeed together or rollback as a unit
 */

import { PrismaClient, LanguageCode } from "@prisma/client";
import { logger } from "./logger";
import type { Story } from "../types";
import { CreateStoryWithChaptersInput, ChallengeType, TranslationSourceType } from "@shared/src/types";
import {
  buildTranslationRecords,
  getTranslationStrategyForSource,
  buildCompleteTranslationResult,
  validateTranslationRecord,
  TranslationRecord,
} from "./translation-builder";


/**
 * Create a story with chapters, challenges, and answers in an atomic transaction
 * All operations succeed together or rollback on failure
 *
 * @param prisma PrismaClient instance
 * @param input Complete story data with nested chapters/challenges/answers
 * @returns Created story with all relations populated
 * @throws Error if any operation fails (entire transaction rolled back)
 */
export async function createStoryWithChaptersTransaction(
  prisma: PrismaClient,
  input: CreateStoryWithChaptersInput
): Promise<Story> {
  try {
    logger.info("Starting story creation transaction", {
      title: input.title,
      worldId: input.worldId,
      chaptersCount: input.chapters.length,
    });

    const result = await prisma.$transaction(
      async (tx) => {
        // Step 1: Create the story
        const story = await tx.story.create({
          data: {
            worldId: input.worldId,
            title: input.title,
            description: input.description || null,
            difficulty: input.difficulty,
            order: input.order,
          },
        });

      logger.info("Story created in transaction", {
        storyId: story.id,
        title: story.title,
      });

      // Step 1b: Create story translations based on translation source
      let storyTranslationsCreated = 0;
      if (input.translationSource) {
        if (input.translationSource === TranslationSourceType.MANUAL) {
          await createManualTranslationRecordsForStory(tx, story.id, input.translations);
        } else {
          await createTranslationRecordsForStory(
            tx,
            story.id,
            input.translationSource,
            input.translations
          );
        }
        storyTranslationsCreated = 1; // Track that translations were created
      }

      let chaptersCreated = 0;
      let challengesCreated = 0;
      let answersCreated = 0;
      let chapterTranslationsCreated = 0;
      let challengeTranslationsCreated = 0;
      let answerTranslationsCreated = 0;

      // Step 2: Create chapters with challenges and answers
      for (const chapterInput of input.chapters) {
        const chapter = await tx.chapter.create({
          data: {
            storyId: story.id,
            content: chapterInput.content,
            imageUrl: chapterInput.imageUrl || null,
            audioUrl: chapterInput.audioUrl || null,
            order: chapterInput.order,
          },
        });

        chaptersCreated++;
        logger.info("Chapter created in transaction", {
          chapterId: chapter.id,
        });

        // Step 2b: Create chapter translations
        if (input.translationSource) {
          if (input.translationSource === TranslationSourceType.MANUAL) {
            await createManualTranslationRecordsForChapter(
              tx,
              chapter.id,
              chapterInput.translations
            );
          } else {
            await createTranslationRecordsForChapter(
              tx,
              chapter.id,
              input.translationSource,
              chapterInput.translations
            );
          }
          chapterTranslationsCreated++;
        }

        // Step 3: Create challenge if provided
        if (chapterInput.challenge) {
          const challenge = await tx.challenge.create({
            data: {
              chapterId: chapter.id,
              type: chapterInput.challenge.type,
              question: chapterInput.challenge.question,
              baseStars: chapterInput.challenge.baseStars || 20,
              order: chapterInput.challenge.order,
              hints: chapterInput.challenge.hints || [],
            },
          });

          challengesCreated++;
          logger.info("Challenge created in transaction", {
            challengeId: challenge.id,
            type: challenge.type,
          });

          // Step 3b: Create challenge translations
          if (input.translationSource) {
            if (input.translationSource === TranslationSourceType.MANUAL) {
              await createManualTranslationRecordsForChallenge(
                tx,
                challenge.id,
                chapterInput.challenge.translations
              );
            } else {
              await createTranslationRecordsForChallenge(
                tx,
                challenge.id,
                input.translationSource,
                chapterInput.challenge.translations
              );
            }
            challengeTranslationsCreated++;
          }

          // Step 4: Create answers for challenge
          for (const answerInput of chapterInput.challenge.answers) {
            const answer = await tx.answer.create({
              data: {
                challengeId: challenge.id,
                text: answerInput.text,
                isCorrect: answerInput.isCorrect,
                order: answerInput.order ?? null,
              },
            });

            answersCreated++;
            logger.info("Answer created in transaction", {
              answerId: answer.id,
              text: answerInput.text,
            });

            // Step 4b: Create answer translations
            if (input.translationSource) {
              if (input.translationSource === TranslationSourceType.MANUAL) {
                await createManualTranslationRecordsForAnswer(
                  tx,
                  answer.id,
                  answerInput.translations
                );
              } else {
                await createTranslationRecordsForAnswer(
                  tx,
                  answer.id,
                  input.translationSource,
                  answerInput.translations
                );
              }
              answerTranslationsCreated++;
            }
          }
        }
      }

      // Fetch complete story with all relations
      const completeStory = await tx.story.findUnique({
        where: { id: story.id },
        include: {
          world: true,
          chapters: {
            include: {
              translations: true,
              challenge: {
                include: {
                  answers: {
                    orderBy: { order: "asc" },
                  },
                },
              },
            },
            orderBy: { order: "asc" },
          },
        },
      });

      if (!completeStory) {
        throw new Error("Failed to fetch created story");
      }

      return completeStory
    },
      { timeout: 60000 }
    );

    logger.info("Story creation transaction completed successfully", {
      storyId: result.id,
      chaptersCreated: result.chapters.length,
      challengesCreated: result.chapters.filter(c => c.challenge !== null).length,
      answersCreated: result.chapters.reduce((acc, chapter) => {
        return acc + (chapter.challenge?.answers.length || 0);
      }, 0),
      translationSource: input.translationSource,
    });

    return result as Story;
  } catch (error) {
    logger.error("Story creation transaction failed - rolling back", {
      error: String(error),
      input: { ...input, chapters: input.chapters.length },
    });
    throw error;
  }
}

/**
 * Validate story creation input before transaction
 * Runs basic checks to prevent unnecessary transaction attempts
 *
 * @param input Story creation input
 * @throws Error if validation fails
 */
export function validateStoryCreationInput(
  input: CreateStoryWithChaptersInput
): void {
  // Validate story fields
  if (!input.worldId || input.worldId.trim() === "") {
    throw new Error("World ID is required");
  }

  if (!input.title || input.title.trim() === "") {
    throw new Error("Story title is required");
  }

  if (input.difficulty < 1 || input.difficulty > 5) {
    throw new Error("Difficulty must be between 1 and 5");
  }

  if (input.order < 0) {
    throw new Error("Order must be non-negative");
  }

  if (!input.chapters || input.chapters.length === 0) {
    throw new Error("At least one chapter is required");
  }

  // Validate chapters
  input.chapters.forEach((chapter, index) => {

    if (!chapter.content || chapter.content.trim() === "") {
      throw new Error(`Chapter ${index + 1}: Content is required`);
    }

    if (chapter.order < 0) {
      throw new Error(`Chapter ${index + 1}: Order must be non-negative`);
    }

    // Validate challenge if provided
    if (chapter.challenge) {
      if (!chapter.challenge.question || chapter.challenge.question.trim() === "") {
        throw new Error(`Chapter ${index + 1}: Challenge question is required`);
      }

      if (!chapter.challenge.type || chapter.challenge.type.trim() === "") {
        throw new Error(`Chapter ${index + 1}: Challenge type is required`);
      }

      if (chapter.challenge.order < 0) {
        throw new Error(`Chapter ${index + 1}: Challenge order must be non-negative`);
      }

      if (chapter.challenge.baseStars && chapter.challenge.baseStars < 0) {
        throw new Error(`Chapter ${index + 1}: Base stars must be non-negative`);
      }

      // Validate answers if provided
      if (
        chapter.challenge.answers &&
        chapter.challenge.answers.length > 0
      ) {
        chapter.challenge.answers.forEach((answer, answerIndex) => {
          if (!answer.text || answer.text.trim() === "") {
            throw new Error(
              `Chapter ${index + 1}, Answer ${answerIndex + 1}: Text is required`
            );
          }

          if (typeof answer.isCorrect !== "boolean") {
            throw new Error(
              `Chapter ${index + 1}, Answer ${answerIndex + 1}: isCorrect must be boolean`
            );
          }

          if (answer.order !== undefined && answer.order !== null && answer.order < 0) {
            throw new Error(
              `Chapter ${index + 1}, Answer ${answerIndex + 1}: Order must be non-negative`
            );
          }
        });

        // Validate answer requirements based on challenge type
        const correctAnswerCount = chapter.challenge.answers.filter((a) => a.isCorrect).length;
        const challengeType = chapter.challenge.type as ChallengeType;

        if (
          challengeType === ChallengeType.CHOOSE_ENDING ||
          challengeType === ChallengeType.MORAL_DECISION
        ) {
          // For CHOOSE_ENDING and MORAL_DECISION, all answers must be correct
          if (correctAnswerCount !== chapter.challenge.answers.length) {
            throw new Error(
              `Chapter ${index + 1}: All answers must be marked as correct for ${challengeType} challenges`
            );
          }
        } else if (
          challengeType === ChallengeType.MULTIPLE_CHOICE ||
          challengeType === ChallengeType.TRUE_FALSE ||
          challengeType === ChallengeType.RIDDLE
        ) {
          // For other types, at least one answer must be correct
          if (correctAnswerCount === 0) {
            throw new Error(
              `Chapter ${index + 1}: At least one answer must be marked as correct for ${challengeType} challenges`
            );
          }
        }
      }
    }
  });

  logger.info("Story creation input validated successfully", {
    worldId: input.worldId,
    chaptersCount: input.chapters.length,
  });
}

/**
 * Edit a story with chapters, challenges, and answers in an atomic transaction
 * Uses upsert to preserve IDs and maintain game session links (instead of delete/recreate)
 * All operations succeed together or rollback on failure
 *
 * @param prisma PrismaClient instance
 * @param storyId ID of the story to edit
 * @param input Complete story data with nested chapters/challenges/answers
 * @returns Updated story with all relations populated
 * @throws Error if any operation fails (entire transaction rolled back)
 */
export async function editStoryWithChaptersTransaction(
  prisma: PrismaClient,
  storyId: string,
  input: CreateStoryWithChaptersInput
): Promise<Story> {
  try {
    logger.info("Starting story edit transaction (upsert mode)", {
      storyId,
      title: input.title,
      chaptersCount: input.chapters.length,
      translationSource: input.translationSource,
      hasTranslations: !!input.translations && input.translations.length > 0,
    });

    // Declare tracking variables outside transaction scope so they're accessible in final logging
    let chaptersUpserted = 0;
    let challengesUpserted = 0;
    let answersUpserted = 0;
    let chaptersDeleted = 0;

    const result = await prisma.$transaction(
      async (tx) => {
        // Step 1: Update the story
        const story = await tx.story.update({
          where: { id: storyId },
          data: {
            worldId: input.worldId,
            title: input.title,
            description: input.description || null,
            difficulty: input.difficulty,
            order: input.order,
          },
        });

      logger.info("Story updated in transaction", {
        storyId: story.id,
        title: story.title,
      });

      // Step 1b: Delete old story translations and create new ones
      await tx.storyTranslation.deleteMany({
        where: { storyId: story.id },
      });

      if (input.translationSource) {
        if (input.translationSource === TranslationSourceType.MANUAL) {
          await createManualTranslationRecordsForStory(tx, story.id, input.translations);
        } else {
          await createTranslationRecordsForStory(
            tx,
            story.id,
            input.translationSource,
            input.translations
          );
        }
      }

      // Step 2: Fetch existing chapters to merge with new data
      const existingChapters = await tx.chapter.findMany({
        where: { storyId: story.id },
        include: {
          challenge: {
            include: { answers: true },
          },
        },
      });

      logger.info("Fetched existing chapters for upsert", {
        storyId: story.id,
        existingChaptersCount: existingChapters.length,
      });

      // Step 3: Create map of existing chapters by order for efficient lookup
      const existingChaptersByOrder = new Map(
        existingChapters.map((ch) => [ch.order, ch])
      );

      // Step 4: Upsert chapters from input
      for (const chapterInput of input.chapters) {
        const existingChapter = existingChaptersByOrder.get(chapterInput.order);
        
        let chapter;
        if (existingChapter) {
          // Update existing chapter
          chapter = await tx.chapter.update({
            where: { id: existingChapter.id },
            data: {
              content: chapterInput.content,
              imageUrl: chapterInput.imageUrl || null,
              audioUrl: chapterInput.audioUrl || null,
              order: chapterInput.order,
            },
          });
          
          logger.info("Chapter updated in edit transaction", {
            chapterId: chapter.id,
          });
        } else {
          // Create new chapter
          chapter = await tx.chapter.create({
            data: {
              storyId: story.id,
              content: chapterInput.content,
              imageUrl: chapterInput.imageUrl || null,
              audioUrl: chapterInput.audioUrl || null,
              order: chapterInput.order,
            },
          });
          
          logger.info("Chapter created in edit transaction", {
            chapterId: chapter.id,
          });
        }

        chaptersUpserted++;

        // Step 4b: Upsert chapter translations
        if (input.translationSource) {
          // Delete old translations and recreate
          await tx.chapterTranslation.deleteMany({
            where: { chapterId: chapter.id },
          });

          if (input.translationSource === TranslationSourceType.MANUAL) {
            await createManualTranslationRecordsForChapter(
              tx,
              chapter.id,
              chapterInput.translations
            );
          } else {
            await createTranslationRecordsForChapter(
              tx,
              chapter.id,
              input.translationSource,
              chapterInput.translations
            );
          }
        }

        // Step 5: Upsert challenge if provided
        if (chapterInput.challenge) {
          const existingChallenge = existingChapter?.challenge;

          let challenge;
          if (existingChallenge) {
            // Update existing challenge
            challenge = await tx.challenge.update({
              where: { id: existingChallenge.id },
              data: {
                type: chapterInput.challenge.type,
                question: chapterInput.challenge.question,
                baseStars: chapterInput.challenge.baseStars || 20,
                order: chapterInput.challenge.order,
                hints: chapterInput.challenge.hints || [],
              },
            });

            logger.info("Challenge updated in edit transaction", {
              challengeId: challenge.id,
              type: challenge.type,
            });
          } else {
            // Create new challenge
            challenge = await tx.challenge.create({
              data: {
                chapterId: chapter.id,
                type: chapterInput.challenge.type,
                question: chapterInput.challenge.question,
                baseStars: chapterInput.challenge.baseStars || 20,
                order: chapterInput.challenge.order,
                hints: chapterInput.challenge.hints || [],
              },
            });

            logger.info("Challenge created in edit transaction", {
              challengeId: challenge.id,
              type: challenge.type,
            });
          }

          challengesUpserted++;

          // Step 5b: Upsert challenge translations
          if (input.translationSource) {
            // Delete old translations and recreate
            await tx.challengeTranslation.deleteMany({
              where: { challengeId: challenge.id },
            });

            if (input.translationSource === TranslationSourceType.MANUAL) {
              await createManualTranslationRecordsForChallenge(
                tx,
                challenge.id,
                chapterInput.challenge.translations
              );
            } else {
              await createTranslationRecordsForChallenge(
                tx,
                challenge.id,
                input.translationSource,
                chapterInput.challenge.translations
              );
            }
          }

          // Step 6: Upsert answers for challenge
          const existingAnswers = existingChallenge?.answers || [];
          const answerInputs = chapterInput.challenge.answers;
          
          // Map existing answers by order for efficient lookup
          const existingAnswersByOrder = new Map(
            existingAnswers.map((ans) => [ans.order ?? -1, ans])
          );

          for (let ansIdx = 0; ansIdx < answerInputs.length; ansIdx++) {
            const answerInput = answerInputs[ansIdx];
            const existingAnswer = existingAnswersByOrder.get(answerInput.order ?? -1);

            let answer;
            if (existingAnswer) {
              // Update existing answer
              answer = await tx.answer.update({
                where: { id: existingAnswer.id },
                data: {
                  text: answerInput.text,
                  isCorrect: answerInput.isCorrect,
                  order: answerInput.order ?? null,
                },
              });

              logger.info("Answer updated in edit transaction", {
                answerId: answer.id,
                text: answerInput.text,
              });
            } else {
              // Create new answer
              answer = await tx.answer.create({
                data: {
                  challengeId: challenge.id,
                  text: answerInput.text,
                  isCorrect: answerInput.isCorrect,
                  order: answerInput.order ?? null,
                },
              });

              logger.info("Answer created in edit transaction", {
                answerId: answer.id,
                text: answerInput.text,
              });
            }

            answersUpserted++;

            // Step 6b: Upsert answer translations
            if (input.translationSource) {
              // Delete old translations and recreate
              await tx.answerTranslation.deleteMany({
                where: { answerId: answer.id },
              });

              if (input.translationSource === TranslationSourceType.MANUAL) {
                await createManualTranslationRecordsForAnswer(
                  tx,
                  answer.id,
                  answerInput.translations
                );
              } else {
                await createTranslationRecordsForAnswer(
                  tx,
                  answer.id,
                  input.translationSource,
                  answerInput.translations
                );
              }
            }
          }

          // Delete answers that are in existing but not in input
          const answerIdsToKeep = new Set(
            answerInputs
              .map((a) => existingAnswersByOrder.get(a.order ?? -1)?.id)
              .filter((id): id is string => !!id)
          );

          const answersToDelete = existingAnswers.filter(
            (ans) => !answerIdsToKeep.has(ans.id)
          );

          for (const answerToDelete of answersToDelete) {
            await tx.answer.delete({
              where: { id: answerToDelete.id },
            });
            logger.info("Answer deleted in edit transaction", {
              answerId: answerToDelete.id,
            });
          }
        } else if (existingChapter?.challenge) {
          // Challenge was removed - delete it
          await tx.challenge.delete({
            where: { id: existingChapter.challenge.id },
          });
          logger.info("Challenge deleted in edit transaction", {
            challengeId: existingChapter.challenge.id,
          });
        }
      }

      // Step 7: Delete chapters that were removed (exist in DB but not in input)
      const inputChapterOrders = new Set(input.chapters.map((ch) => ch.order));
      const chaptersToDelete = existingChapters.filter(
        (ch) => !inputChapterOrders.has(ch.order)
      );

      for (const chapterToDelete of chaptersToDelete) {
        await tx.chapter.delete({
          where: { id: chapterToDelete.id },
        });
        chaptersDeleted++;
        logger.info("Chapter deleted in edit transaction", {
          chapterId: chapterToDelete.id,
        });
      }

      // Fetch complete story with all relations
      const completeStory = await tx.story.findUnique({
        where: { id: story.id },
        include: {
          world: true,
          chapters: {
            include: {
              translations: true,
              challenge: {
                include: {
                  answers: {
                    orderBy: { order: "asc" },
                  },
                },
              },
            },
            orderBy: { order: "asc" },
          },
        },
      });

      if (!completeStory) {
        throw new Error("Failed to fetch updated story");
      }

      return completeStory;
    },
      { timeout: 60000 }
    );

    logger.info("Story edit transaction completed successfully", {
      storyId: result.id,
      chaptersCount: result.chapters.length,
      chaptersUpserted,
      chaptersDeleted,
      challengesUpserted,
      answersUpserted,
      challengesExisting: result.chapters.filter(c => c.challenge !== null).length,
      answersExisting: result.chapters.reduce((acc, chapter) => {
        return acc + (chapter.challenge?.answers.length || 0);
      }, 0),
    });

    return result as Story;
  } catch (error) {
    logger.error("Story edit transaction failed - rolling back", {
      error: String(error),
      storyId,
      chaptersCount: input.chapters.length,
    });
    throw error;
  }
}

/**
 * Create story translation records based on translation source mode
 * For AUTO modes: generates translations via DeepL
 * @param tx Prisma transaction context
 * @param storyId Story ID to create translations for
 * @param translationSource Translation mode
 * @param translations Input translations (source language for AUTO, all languages for MANUAL)
 */
async function createTranslationRecordsForStory(
  tx: any,
  storyId: string,
  translationSource: TranslationSourceType,
  translations: TranslationRecord[] | undefined
): Promise<void> {
  try {
    // Build translations based on mode
    const builtTranslations = buildTranslationRecords(translations, translationSource);
    if (!builtTranslations || builtTranslations.length === 0) {
      logger.debug("No translations to create for story", { storyId });
      return;
    }

    // Get translation strategy (source + target languages)
    const strategy = getTranslationStrategyForSource(translationSource);

    // For AUTO modes: translate content
    let translationResult =
      translationSource !== TranslationSourceType.MANUAL
        ? await buildCompleteTranslationResult(
            translationSource,
            builtTranslations[0],
            strategy
          )
        : null;

    // Create translation records
    if (translationResult) {
      // AUTO mode: create records from translation result
      for (const record of translationResult.records.values()) {
        validateTranslationRecord(record, "story");
        await tx.storyTranslation.create({
          data: {
            storyId,
            languageCode: LanguageCode[record.languageCode as keyof typeof LanguageCode],
            title: record.title || "",
            description: record.description || null,
          },
        });
      }
      logger.info("Story translations created (AUTO mode)", {
        storyId,
        count: translationResult.records.size,
        languages: Array.from(translationResult.records.keys()),
      });
    } else {
      // MANUAL mode should not reach here (handled by createManualTranslationRecordsForStory)
      logger.warn("Unexpected state: MANUAL mode in createTranslationRecordsForStory");
    }
  } catch (error) {
    logger.error("Failed to create story translations", {
      storyId,
      error: error instanceof Error ? error.message : String(error),
    });
    throw error;
  }
}

/**
 * Create manual story translation records (user-provided translations)
 */
async function createManualTranslationRecordsForStory(
  tx: any,
  storyId: string,
  translations: TranslationRecord[] | undefined
): Promise<void> {
  try {
    if (!translations || translations.length === 0) {
      logger.debug("No manual translations to create for story", { storyId });
      return;
    }

    for (const translation of translations) {
      validateTranslationRecord(translation, "story");
      await tx.storyTranslation.create({
        data: {
          storyId,
          languageCode: LanguageCode[translation.languageCode as keyof typeof LanguageCode],
          title: translation.title || "",
          description: translation.description || null,
        },
      });
    }

    logger.info("Story translations created (MANUAL mode)", {
      storyId,
      count: translations.length,
      languages: translations.map((t) => t.languageCode),
    });
  } catch (error) {
    logger.error("Failed to create manual story translations", {
      storyId,
      error: error instanceof Error ? error.message : String(error),
    });
    throw error;
  }
}

/**
 * Create chapter translation records based on translation source mode
 */
async function createTranslationRecordsForChapter(
  tx: any,
  chapterId: string,
  translationSource: TranslationSourceType,
  translations: TranslationRecord[] | undefined
): Promise<void> {
  try {
    const builtTranslations = buildTranslationRecords(translations, translationSource);
    if (!builtTranslations || builtTranslations.length === 0) {
      logger.debug("No translations to create for chapter", { chapterId });
      return;
    }

    const strategy = getTranslationStrategyForSource(translationSource);

    let translationResult =
      translationSource !== TranslationSourceType.MANUAL
        ? await buildCompleteTranslationResult(translationSource, builtTranslations[0], strategy)
        : null;

    if (translationResult) {
      for (const record of translationResult.records.values()) {
        validateTranslationRecord(record, "chapter");
        await tx.chapterTranslation.create({
          data: {
            chapterId,
            languageCode: LanguageCode[record.languageCode as keyof typeof LanguageCode],
            content: record.content || "",
            audioUrl: record.audioUrl || null,
          },
        });
      }
      logger.info("Chapter translations created (AUTO mode)", {
        chapterId,
        count: translationResult.records.size,
      });
    }
  } catch (error) {
    logger.error("Failed to create chapter translations", {
      chapterId,
      error: error instanceof Error ? error.message : String(error),
    });
    throw error;
  }
}

/**
 * Create manual chapter translation records
 */
async function createManualTranslationRecordsForChapter(
  tx: any,
  chapterId: string,
  translations: TranslationRecord[] | undefined
): Promise<void> {
  try {
    if (!translations || translations.length === 0) {
      logger.debug("No manual translations to create for chapter", { chapterId });
      return;
    }

    for (const translation of translations) {
      validateTranslationRecord(translation, "chapter");
      await tx.chapterTranslation.create({
        data: {
          chapterId,
          languageCode: LanguageCode[translation.languageCode as keyof typeof LanguageCode],
          content: translation.content || "",
          audioUrl: translation.audioUrl || null,
        },
      });
    }

    logger.info("Chapter translations created (MANUAL mode)", {
      chapterId,
      count: translations.length,
    });
  } catch (error) {
    logger.error("Failed to create manual chapter translations", {
      chapterId,
      error: error instanceof Error ? error.message : String(error),
    });
    throw error;
  }
}

/**
 * Create challenge translation records based on translation source mode
 */
async function createTranslationRecordsForChallenge(
  tx: any,
  challengeId: string,
  translationSource: TranslationSourceType,
  translations: TranslationRecord[] | undefined
): Promise<void> {
  try {
    const builtTranslations = buildTranslationRecords(translations, translationSource);
    if (!builtTranslations || builtTranslations.length === 0) {
      logger.debug("No translations to create for challenge", { challengeId });
      return;
    }

    const strategy = getTranslationStrategyForSource(translationSource);

    let translationResult =
      translationSource !== TranslationSourceType.MANUAL
        ? await buildCompleteTranslationResult(translationSource, builtTranslations[0], strategy)
        : null;

    if (translationResult) {
      for (const record of translationResult.records.values()) {
        validateTranslationRecord(record, "challenge");
        await tx.challengeTranslation.create({
          data: {
            challengeId,
            languageCode: LanguageCode[record.languageCode as keyof typeof LanguageCode],
            question: record.question || "",
            hints: record.hints || [],
          },
        });
      }
      logger.info("Challenge translations created (AUTO mode)", {
        challengeId,
        count: translationResult.records.size,
      });
    }
  } catch (error) {
    logger.error("Failed to create challenge translations", {
      challengeId,
      error: error instanceof Error ? error.message : String(error),
    });
    throw error;
  }
}

/**
 * Create manual challenge translation records
 */
async function createManualTranslationRecordsForChallenge(
  tx: any,
  challengeId: string,
  translations: TranslationRecord[] | undefined
): Promise<void> {
  try {
    if (!translations || translations.length === 0) {
      logger.debug("No manual translations to create for challenge", { challengeId });
      return;
    }

    for (const translation of translations) {
      validateTranslationRecord(translation, "challenge");
      await tx.challengeTranslation.create({
        data: {
          challengeId,
          languageCode: LanguageCode[translation.languageCode as keyof typeof LanguageCode],
          question: translation.question || "",
          hints: translation.hints || [],
        },
      });
    }

    logger.info("Challenge translations created (MANUAL mode)", {
      challengeId,
      count: translations.length,
    });
  } catch (error) {
    logger.error("Failed to create manual challenge translations", {
      challengeId,
      error: error instanceof Error ? error.message : String(error),
    });
    throw error;
  }
}

/**
 * Create answer translation records based on translation source mode
 */
async function createTranslationRecordsForAnswer(
  tx: any,
  answerId: string,
  translationSource: TranslationSourceType,
  translations: TranslationRecord[] | undefined
): Promise<void> {
  try {
    const builtTranslations = buildTranslationRecords(translations, translationSource);
    if (!builtTranslations || builtTranslations.length === 0) {
      logger.debug("No translations to create for answer", { answerId });
      return;
    }

    const strategy = getTranslationStrategyForSource(translationSource);

    let translationResult =
      translationSource !== TranslationSourceType.MANUAL
        ? await buildCompleteTranslationResult(translationSource, builtTranslations[0], strategy)
        : null;

    if (translationResult) {
      for (const record of translationResult.records.values()) {
        validateTranslationRecord(record, "answer");
        await tx.answerTranslation.create({
          data: {
            answerId,
            languageCode: LanguageCode[record.languageCode as keyof typeof LanguageCode],
            text: record.text || "",
          },
        });
      }
      logger.info("Answer translations created (AUTO mode)", {
        answerId,
        count: translationResult.records.size,
      });
    }
  } catch (error) {
    logger.error("Failed to create answer translations", {
      answerId,
      error: error instanceof Error ? error.message : String(error),
    });
    throw error;
  }
}

/**
 * Create manual answer translation records
 */
async function createManualTranslationRecordsForAnswer(
  tx: any,
  answerId: string,
  translations: TranslationRecord[] | undefined
): Promise<void> {
  try {
    if (!translations || translations.length === 0) {
      logger.debug("No manual translations to create for answer", { answerId });
      return;
    }

    for (const translation of translations) {
      validateTranslationRecord(translation, "answer");
      await tx.answerTranslation.create({
        data: {
          answerId,
          languageCode: LanguageCode[translation.languageCode as keyof typeof LanguageCode],
          text: translation.text || "",
        },
      });
    }

    logger.info("Answer translations created (MANUAL mode)", {
      answerId,
      count: translations.length,
    });
  } catch (error) {
    logger.error("Failed to create manual answer translations", {
      answerId,
      error: error instanceof Error ? error.message : String(error),
    });
    throw error;
  }
}
