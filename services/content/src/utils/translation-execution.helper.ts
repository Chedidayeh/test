/**
 * Translation Execution Helper
 * Handles atomic execution of translations for existing stories
 * Fetches story content, generates translations, and persists them
 * Separate from create/edit transactions - focuses only on translation generation
 */

import { PrismaClient, LanguageCode } from "@prisma/client";
import { logger } from "./logger";
import {
  TranslationSourceType,
  CreateStoryWithChaptersInput,
  Chapter,
  Story,
  Challenge,
  Answer,
} from "@shared/src/types";
import {
  buildTranslationRecords,
  getTranslationStrategyForSource,
  buildCompleteTranslationResult,
  TranslationRecord,
} from "./translation-builder";

/**
 * Translation result containing records for multiple target languages
 */
interface TranslationResult {
  sourceLanguage: string | null;
  targetLanguages: string[];
  records: Map<string, Record<string, any>>;
}

/**
 * Story translation result
 */
interface StoryTranslationResult extends TranslationResult {}

/**
 * Chapter translation result with chapter reference
 */
interface ChapterTranslationResult {
  chapterId: string;
  result: TranslationResult;
}

/**
 * Challenge translation result with challenge reference
 */
interface ChallengeTranslationResult {
  challengeId: string;
  result: TranslationResult;
}

/**
 * Answer translation result with answer reference
 */
interface AnswerTranslationResult {
  answerId: string;
  result: TranslationResult;
}

/**
 * Execute translations for an existing story
 * Phase 1: Fetch story structure with all nested relations
 * Phase 2: Generate translations via DeepL for all content
 * Phase 3: Persist all translation records atomically
 *
 * Does NOT modify story/chapters/challenges/answers structure
 * Only creates/upserts translation records
 *
 * @param prisma PrismaClient instance
 * @param storyId ID of story to translate
 * @param input Translation execution input containing source and optional manual translations
 * @returns Updated story with populated translation relations
 * @throws Error if any phase fails (transaction rolled back)
 */
export async function executeStoryTranslationsTransaction(
  prisma: PrismaClient,
  storyId: string,
  input: CreateStoryWithChaptersInput,
): Promise<Story> {
  try {
    logger.info("Starting story translation execution", {
      storyId,
      translationSource: input.translationSource,
      hasInputTranslations:
        !!input.translations && input.translations.length > 0,
    });

    // ========== PHASE 1: FETCH STORY STRUCTURE ==========
    logger.debug("PHASE 1: Fetching story structure with all relations", {
      storyId,
    });

    const story = await prisma.story.findUnique({
      where: { id: storyId },
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

    if (!story) {
      throw new Error(`Story with ID ${storyId} not found`);
    }

    logger.info("Story structure fetched", {
      storyId,
      chaptersCount: story.chapters.length,
      challengesCount: story.chapters.filter((c) => c.challenge).length,
      answersCount: story.chapters.reduce(
        (acc, c) => acc + (c.challenge?.answers.length || 0),
        0,
      ),
    });

    // Extract translatable content from existing story
    const storyTranslationRecord = extractStoryTranslationRecord(
      story as Story,
    );
    const chapterRecords = story.chapters.map((ch, idx) =>
      extractChapterTranslationRecord(ch as Chapter),
    );
    const challengeRecords = story.chapters
      .map((chapter, chapIdx) => {
        const inputChapter = input.chapters[chapIdx];
        if (!chapter.challenge || !inputChapter?.challenge) return null;
        return {
          challengeId: chapter.challenge.id,
          record: extractChallengeTranslationRecord(
            chapter.challenge as Challenge,
            inputChapter.challenge,
          ),
        };
      })
      .filter((r) => r !== null);

    const answerRecords = story.chapters.flatMap((chapter, chapIdx) => {
      const inputChapter = input.chapters[chapIdx];
      if (!chapter.challenge || !inputChapter?.challenge) return [];
      return chapter.challenge.answers.map((answer, ansIdx) => ({
        answerId: answer.id,
        record: extractAnswerTranslationRecord(answer as Answer),
      }));
    });

    // ========== PHASE 2: GENERATE TRANSLATIONS ==========
    logger.debug("PHASE 2: Generating translations via DeepL/MANUAL", {
      translationSource: input.translationSource,
      storyId,
    });

    // Determine translation strategy
    const strategy =
      input.translationSource === TranslationSourceType.MANUAL
        ? null
        : getTranslationStrategyForSource(input.translationSource);

    // Filter input to source language for AUTO modes
    const filteredTranslations = buildTranslationRecords(
      input.translations,
      input.translationSource,
    );

    if (!filteredTranslations || filteredTranslations.length === 0) {
      logger.warn("No translations to process after filtering", {
        storyId,
        translationSource: input.translationSource,
      });
      throw new Error("No valid translations provided for execution");
    }

    // Build translation results for each entity type
    let storyTranslationResult: StoryTranslationResult | null = null;
    let chapterTranslationResults: ChapterTranslationResult[] = [];
    let challengeTranslationResults: ChallengeTranslationResult[] = [];
    let answerTranslationResults: AnswerTranslationResult[] = [];

    if (input.translationSource === TranslationSourceType.MANUAL) {
      // MANUAL mode: Use user-provided translations from input structure
      logger.debug("MANUAL mode: Using user-provided translations from input", {
        storyId,
      });

      // Story translations from input.translations
      storyTranslationResult = {
        sourceLanguage: null,
        targetLanguages: filteredTranslations.map((t) => t.languageCode),
        records: new Map(
          filteredTranslations.map((t) => [
            t.languageCode,
            {
              languageCode: t.languageCode,
              title: t.title || storyTranslationRecord.title,
              description: t.description || storyTranslationRecord.description,
            },
          ]),
        ),
      } as StoryTranslationResult;

      // Chapter translations from input.chapters[].translations
      chapterTranslationResults = chapterRecords.map((ch, idx) => {
        const inputChapterTranslations =
          input.chapters[idx]?.translations || [];
        return {
          chapterId: ch.chapter?.id,
          result: {
            sourceLanguage: null,
            targetLanguages: filteredTranslations.map((t) => t.languageCode),
            records: new Map(
              filteredTranslations.map((t) => {
                const inputTrans = inputChapterTranslations.find(
                  (trans) =>
                    trans.languageCode.toUpperCase() ===
                    t.languageCode.toUpperCase(),
                );
                return [
                  t.languageCode,
                  {
                    languageCode: t.languageCode,
                    content: inputTrans?.content || ch.record.content,
                  },
                ];
              }),
            ),
          },
        } as ChapterTranslationResult;
      });

      // Challenge translations from input.chapters[].challenge?.translations
      challengeTranslationResults = challengeRecords.map((ch) => {
        // Find the corresponding input chapter that has this challenge
        let inputChallengeTranslations: any[] = [];
        for (const inputChapter of input.chapters) {
          if (inputChapter.challenge && inputChapter.challenge.translations) {
            inputChallengeTranslations = inputChapter.challenge.translations;
            break;
          }
        }

        return {
          challengeId: ch.challengeId,
          result: {
            sourceLanguage: null,
            targetLanguages: filteredTranslations.map(
              (t: any) => t.languageCode,
            ),
            records: new Map(
              filteredTranslations.map((t: any) => {
                const inputTrans = inputChallengeTranslations.find(
                  (trans: any) =>
                    trans.languageCode.toUpperCase() ===
                    t.languageCode.toUpperCase(),
                );
                return [
                  t.languageCode,
                  {
                    languageCode: t.languageCode,
                    question: inputTrans?.question || ch.record.question,
                  },
                ];
              }),
            ),
          },
        } as ChallengeTranslationResult;
      });

      // Answer translations from input.chapters[].challenge?.answers[].translations
      answerTranslationResults = answerRecords.map((ans) => {
        // Collect all answer translations from all input chapters
        let inputAnswerTranslations: any[] = [];
        for (const inputChapter of input.chapters) {
          if (inputChapter.challenge?.answers) {
            for (const inputAnswer of inputChapter.challenge.answers) {
              if (inputAnswer.translations) {
                inputAnswerTranslations.push(...inputAnswer.translations);
              }
            }
          }
        }

        return {
          answerId: ans.answerId,
          result: {
            sourceLanguage: null,
            targetLanguages: filteredTranslations.map(
              (t: any) => t.languageCode,
            ),
            records: new Map(
              filteredTranslations.map((t: any) => {
                const inputTrans = inputAnswerTranslations.find(
                  (trans: any) =>
                    trans.languageCode.toUpperCase() ===
                    t.languageCode.toUpperCase(),
                );
                return [
                  t.languageCode,
                  {
                    languageCode: t.languageCode,
                    text: inputTrans?.text || ans.record.text,
                  },
                ];
              }),
            ),
          },
        } as AnswerTranslationResult;
      });
    } else {
      // AUTO mode: Translate to target languages
      logger.debug("AUTO mode: Translating to target languages", {
        storyId,
        sourceLanguage: strategy?.sourceLanguage,
        targetLanguages: strategy?.targetLanguages,
      });

      // Build story translations
      storyTranslationResult = (await buildCompleteTranslationResult(
        input.translationSource,
        storyTranslationRecord,
        strategy!,
      )) as StoryTranslationResult;

      // Build chapter translations in parallel
      chapterTranslationResults = await Promise.all(
        chapterRecords.map(async (ch) => ({
          chapterId: ch.chapter?.id || "",
          result: (await buildCompleteTranslationResult(
            input.translationSource,
            ch.record,
            strategy!,
          )) as TranslationResult,
        })),
      );

      // Build challenge translations in parallel
      challengeTranslationResults = await Promise.all(
        challengeRecords.map(async (ch) => ({
          challengeId: ch.challengeId,
          result: (await buildCompleteTranslationResult(
            input.translationSource,
            ch.record,
            strategy!,
          )) as TranslationResult,
        })),
      );

      // Build answer translations in parallel
      answerTranslationResults = await Promise.all(
        answerRecords.map(async (ans) => ({
          answerId: ans.answerId,
          result: (await buildCompleteTranslationResult(
            input.translationSource,
            ans.record,
            strategy!,
          )) as TranslationResult,
        })),
      );
    }

    // ========== PHASE 3: PERSIST TRANSLATIONS ATOMICALLY ==========
    logger.debug("PHASE 3: Persisting translations atomically", { storyId });

    const result = await prisma.$transaction(
      async (tx) => {
        // Upsert story translations
        if (storyTranslationResult) {
          for (const [languageCode, record] of storyTranslationResult.records) {
            await tx.storyTranslation.upsert({
              where: {
                storyId_languageCode: {
                  storyId: story.id,
                  languageCode: languageCode as LanguageCode,
                },
              },
              create: {
                storyId: story.id,
                languageCode: languageCode as LanguageCode,
                title: record.title || story.title,
                description: record.description || story.description,
              },
              update: {
                title: record.title || story.title,
                description: record.description || story.description,
                updatedAt: new Date(),
              },
            });
          }
          logger.debug("Story translations upserted", {
            storyId,
            languagesCount: storyTranslationResult.records.size,
          });
        }

        // Upsert chapter translations
        for (const { chapterId, result } of chapterTranslationResults) {
          for (const [languageCode, record] of result.records) {
            const chapter = story.chapters.find((c) => c.id === chapterId);
            if (!chapter) continue;

            await tx.chapterTranslation.upsert({
              where: {
                chapterId_languageCode: {
                  chapterId,
                  languageCode: languageCode as LanguageCode,
                },
              },
              create: {
                chapterId,
                languageCode: languageCode as LanguageCode,
                content: record.content || chapter.content,
              },
              update: {
                content: record.content || chapter.content,
                updatedAt: new Date(),
              },
            });
          }
        }
        logger.debug("Chapter translations upserted", {
          storyId,
          chaptersCount: chapterTranslationResults.length,
        });

        // Upsert challenge translations
        for (const { challengeId, result } of challengeTranslationResults) {
          const challenge = story.chapters
            .flatMap((c) => c.challenge)
            .find((ch) => ch?.id === challengeId);
          if (!challenge) continue;

          for (const [languageCode, record] of result.records) {
            await tx.challengeTranslation.upsert({
              where: {
                challengeId_languageCode: {
                  challengeId,
                  languageCode: languageCode as LanguageCode,
                },
              },
              create: {
                challengeId,
                languageCode: languageCode as LanguageCode,
                question: record.question || challenge.question,
                hints: record.hints || challenge.hints || [],
              },
              update: {
                question: record.question || challenge.question,
                hints: record.hints || challenge.hints || [],
                updatedAt: new Date(),
              },
            });
          }
        }
        logger.debug("Challenge translations upserted", {
          storyId,
          challengesCount: challengeTranslationResults.length,
        });

        // Upsert answer translations
        for (const { answerId, result } of answerTranslationResults) {
          const answer = story.chapters
            .flatMap((c) => c.challenge?.answers || [])
            .find((a) => a.id === answerId);
          if (!answer) continue;

          for (const [languageCode, record] of result.records) {
            await tx.answerTranslation.upsert({
              where: {
                answerId_languageCode: {
                  answerId,
                  languageCode: languageCode as LanguageCode,
                },
              },
              create: {
                answerId,
                languageCode: languageCode as LanguageCode,
                text: record.text || answer.text,
              },
              update: {
                text: record.text || answer.text,
                updatedAt: new Date(),
              },
            });
          }
        }
        logger.debug("Answer translations upserted", {
          storyId,
          answersCount: answerTranslationResults.length,
        });

        // Fetch complete story with all translations
        const completeStory = await tx.story.findUnique({
          where: { id: storyId },
          include: {
            world: true,
            translations: true,
            chapters: {
              include: {
                translations: true,
                challenge: {
                  include: {
                    translations: true,
                    answers: {
                      include: {
                        translations: true,
                      },
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
          throw new Error("Failed to fetch updated story after translation");
        }

        return completeStory;
      },
      { timeout: 60000 },
    );

    logger.info("Story translation execution completed successfully", {
      storyId: result.id,
      chaptersCount: result.chapters.length,
      storyTranslationsCount: result.translations?.length || 0,
      chapterTranslationsCount: result.chapters.reduce(
        (acc, c) => acc + (c.translations?.length || 0),
        0,
      ),
      challengeTranslationsCount: result.chapters.reduce(
        (acc, c) => acc + (c.challenge?.translations?.length || 0),
        0,
      ),
      answerTranslationsCount: result.chapters.reduce(
        (acc, c) =>
          acc +
          (c.challenge?.answers.reduce(
            (a, ans) => a + (ans.translations?.length || 0),
            0,
          ) || 0),
        0,
      ),
    });

    return result as Story;
  } catch (error) {
    logger.error("Story translation execution failed - rolling back", {
      storyId,
      translationSource: input.translationSource,
      error: String(error),
    });
    throw error;
  }
}

/**
 * Extract translatable content from story entity
 * Creates a TranslationRecord from current story fields
 */
function extractStoryTranslationRecord(story: Story): TranslationRecord {
  return {
    languageCode: LanguageCode[LanguageCode.EN],
    title: story.title,
    description: story.description || undefined,
  };
}

/**
 * Extract translatable content from chapter entity
 * Combines existing chapter data with input chapter definitions
 */
function extractChapterTranslationRecord(chapter: Chapter) {
  return {
    chapter: chapter,
    record: {
      languageCode: LanguageCode[LanguageCode.EN],
      content: chapter.content,
    },
  };
}

/**
 * Extract translatable content from challenge entity
 * Combines existing challenge data with input challenge definitions
 */
function extractChallengeTranslationRecord(
  challenge: Challenge,
  inputChallenge?: CreateStoryWithChaptersInput["chapters"][number]["challenge"],
): TranslationRecord {
  return {
    languageCode: LanguageCode[LanguageCode.EN],
    question: challenge.question,
    hints: inputChallenge?.hints || challenge.hints || [],
  };
}

/**
 * Extract translatable content from answer entity
 * Combines existing answer data with input answer definitions
 */
function extractAnswerTranslationRecord(answer: Answer): TranslationRecord {
  return {
    languageCode: LanguageCode[LanguageCode.EN],
    text: answer.text,
  };
}
