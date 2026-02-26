/**
 * Transaction Helper for Story Creation
 * Manages atomic database transactions for nested story creation
 * Ensures all operations succeed together or rollback as a unit
 */

import { PrismaClient } from "@prisma/client";
import { logger } from "./logger";
import type { Story } from "../types";
import { CreateStoryWithChaptersInput, ChallengeType } from "@shared/types";


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

    const result = await prisma.$transaction(async (tx) => {
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

      let chaptersCreated = 0;
      let challengesCreated = 0;
      let answersCreated = 0;

      // Step 2: Create chapters with challenges and answers
      for (const chapterInput of input.chapters) {
        const chapter = await tx.chapter.create({
          data: {
            storyId: story.id,
            title: chapterInput.title,
            content: chapterInput.content,
            imageUrl: chapterInput.imageUrl || null,
            audioUrl: chapterInput.audioUrl || null,
            order: chapterInput.order,
          },
        });

        chaptersCreated++;
        logger.info("Chapter created in transaction", {
          chapterId: chapter.id,
          title: chapter.title,
        });

        // Step 3: Create challenge if provided
        if (chapterInput.challenge) {
          const challenge = await tx.challenge.create({
            data: {
              chapterId: chapter.id,
              type: chapterInput.challenge.type,
              question: chapterInput.challenge.question,
              description: chapterInput.challenge.description || null,
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

          // Step 4: Create answers for challenge
          for (const answerInput of chapterInput.challenge.answers) {
            await tx.answer.create({
              data: {
                challengeId: challenge.id,
                text: answerInput.text,
                isCorrect: answerInput.isCorrect,
                order: answerInput.order ?? null,
              },
            });

            answersCreated++;
            logger.info("Answer created in transaction", {
              challengeId: challenge.id,
              text: answerInput.text,
            });
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
    });

    logger.info("Story creation transaction completed successfully", {
      storyId: result.id,
      chaptersCreated: result.chapters.length,
      challengesCreated: result.chapters.filter(c => c.challenge !== null).length,
      answersCreated: result.chapters.reduce((acc, chapter) => {
        return acc + (chapter.challenge?.answers.length || 0);
      }, 0),
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
    if (!chapter.title || chapter.title.trim() === "") {
      throw new Error(`Chapter ${index + 1}: Title is required`);
    }

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
 * Deletes all existing chapters (cascading to challenges and answers) and creates new ones
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
    logger.info("Starting story edit transaction", {
      storyId,
      title: input.title,
      chaptersCount: input.chapters.length,
    });

    const result = await prisma.$transaction(async (tx) => {
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

      // Step 2: Delete all existing chapters (cascades to challenges and answers)
      await tx.chapter.deleteMany({
        where: { storyId: story.id },
      });

      logger.info("Existing chapters deleted in transaction", {
        storyId: story.id,
      });

      let chaptersCreated = 0;
      let challengesCreated = 0;
      let answersCreated = 0;

      // Step 3: Create new chapters with challenges and answers
      for (const chapterInput of input.chapters) {
        const chapter = await tx.chapter.create({
          data: {
            storyId: story.id,
            title: chapterInput.title,
            content: chapterInput.content,
            imageUrl: chapterInput.imageUrl || null,
            audioUrl: chapterInput.audioUrl || null,
            order: chapterInput.order,
          },
        });

        chaptersCreated++;
        logger.info("Chapter created in edit transaction", {
          chapterId: chapter.id,
          title: chapter.title,
        });

        // Step 4: Create challenge if provided
        if (chapterInput.challenge) {
          const challenge = await tx.challenge.create({
            data: {
              chapterId: chapter.id,
              type: chapterInput.challenge.type,
              question: chapterInput.challenge.question,
              description: chapterInput.challenge.description || null,
              baseStars: chapterInput.challenge.baseStars || 20,
              order: chapterInput.challenge.order,
              hints: chapterInput.challenge.hints || [],
            },
          });

          challengesCreated++;
          logger.info("Challenge created in edit transaction", {
            challengeId: challenge.id,
            type: challenge.type,
          });

          // Step 5: Create answers for challenge
          for (const answerInput of chapterInput.challenge.answers) {
            await tx.answer.create({
              data: {
                challengeId: challenge.id,
                text: answerInput.text,
                isCorrect: answerInput.isCorrect,
                order: answerInput.order ?? null,
              },
            });

            answersCreated++;
            logger.info("Answer created in edit transaction", {
              challengeId: challenge.id,
              text: answerInput.text,
            });
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
    });

    logger.info("Story edit transaction completed successfully", {
      storyId: result.id,
      chaptersCount: result.chapters.length,
      challengesCreated: result.chapters.filter(c => c.challenge !== null).length,
      answersCreated: result.chapters.reduce((acc, chapter) => {
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
