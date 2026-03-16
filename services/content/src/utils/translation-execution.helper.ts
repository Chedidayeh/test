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
 * Enriched challenge record with chapter context
 * Used in MANUAL mode to correctly map translations to each challenge
 */
interface EnrichedChallengeRecord {
  challengeId: string;
  chapterId: string;
  chapIdx: number;
  record: TranslationRecord;
  inputChapter: any; // Input chapter containing challenge data
  storyChapter: Chapter; // Story chapter for reference
}

/**
 * Enriched answer record with chapter and challenge context
 * Used in MANUAL mode to correctly map translations to each answer
 */
interface EnrichedAnswerRecord {
  answerId: string;
  chapterId: string;
  challengeId: string;
  chapIdx: number;
  ansIdx: number;
  record: TranslationRecord;
  inputChapter: any; // Input chapter containing challenge
  inputChallenge: any; // Input challenge containing answers
  storyChapter: Chapter; // Story chapter for reference
  storyChallenge: Challenge; // Story challenge for reference
}

/**
 * Build mapping of chapters from input and story by ID
 * Handles matching chapters by order within the story to support AUTO mode robustness
 * when story structure changes (new chapters added/deleted)
 *
 * @param inputChapters Chapters from the edit input
 * @param storyChapters Chapters from the current story in database
 * @returns Map of story chapterId to matched input chapter with metadata
 */
function buildChapterContextMap(
  inputChapters: any[],
  storyChapters: Chapter[],
): Map<string, { inputChapter: any; chapIdx: number; storyChapter: Chapter }> {
  const contextMap = new Map<string, { inputChapter: any; chapIdx: number; storyChapter: Chapter }>();

  for (let chapIdx = 0; chapIdx < storyChapters.length; chapIdx++) {
    const storyChapter = storyChapters[chapIdx] as Chapter;
    const inputChapter = inputChapters[chapIdx];

    if (!inputChapter) {
      logger.warn("Input chapter not found for story chapter", {
        chapIdx,
        storyChapterId: storyChapter.id,
        totalStoryChapters: storyChapters.length,
        totalInputChapters: inputChapters.length,
      });
      continue; // Skip chapters without input data
    }

    contextMap.set(storyChapter.id, {
      inputChapter,
      chapIdx,
      storyChapter,
    });

    logger.debug("Chapter context mapped", {
      storyChapterId: storyChapter.id,
      chapIdx,
      hasInputChallenge: !!inputChapter.challenge,
    });
  }

  logger.info("Chapter context map built", {
    mappedChapters: contextMap.size,
    totalStoryChapters: storyChapters.length,
  });

  return contextMap;
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
            translations: true,
            challenge: {
              include: {
                translations: true,
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

    // Extract challenge records WITH chapter context for correct mapping in MANUAL mode
    // Enhanced for AUTO mode robustness: Still creates records even if input chapter doesn't match
    const challengeRecords = story.chapters
      .map((chapter, chapIdx) => {
        if (!chapter.challenge) {
          logger.debug("Story chapter has no challenge", {
            chapterId: chapter.id,
            chapIdx,
          });
          return null;
        }

        const inputChapter = input.chapters[chapIdx];

        // For AUTO mode robustness: Create record even if input chapter missing
        // AUTO mode doesn't need input challenge data - it generates from story content
        // MANUAL mode will use fallback to story data if input is missing
        if (!inputChapter) {
          logger.warn("Input chapter not found for story chapter", {
            chapterId: chapter.id,
            chapIdx,
            totalStoryChapters: story.chapters.length,
            totalInputChapters: input.chapters.length,
          });

          // Still create record for AUTO mode processing
          return {
            challengeId: chapter.challenge.id,
            chapterId: chapter.id,
            chapIdx,
            record: extractChallengeTranslationRecord(
              chapter.challenge as Challenge,
              undefined, // No input challenge data
            ),
            inputChapter: undefined, // Signal that input is missing
            storyChapter: chapter as Chapter,
          } as EnrichedChallengeRecord;
        }

        // Input chapter exists, use it
        return {
          challengeId: chapter.challenge.id,
          chapterId: chapter.id,
          chapIdx,
          record: extractChallengeTranslationRecord(
            chapter.challenge as Challenge,
            inputChapter.challenge,
          ),
          inputChapter,
          storyChapter: chapter as Chapter,
        } as EnrichedChallengeRecord;
      })
      .filter((r) => r !== null) as EnrichedChallengeRecord[];

    logger.info("Challenge records extracted with context", {
      storyId,
      challengeCount: challengeRecords.length,
      mismatchWarnings: challengeRecords.filter((r) => !r.inputChapter).length,
    });

    // Extract answer records WITH chapter and challenge context
    // Enhanced for AUTO mode robustness: Still creates records even if input chapter doesn't match
    // This ensures each answer is properly associated with its challenge and chapter
    const answerRecords = story.chapters.flatMap((chapter, chapIdx) => {
      if (!chapter.challenge) {
        logger.debug("Story chapter has no challenge, skipping answers", {
          chapterId: chapter.id,
          chapIdx,
        });
        return [];
      }

      const inputChapter = input.chapters[chapIdx];
      const inputChallenge = inputChapter?.challenge;

      return chapter.challenge.answers.map((answer, ansIdx) => {
        // For AUTO mode robustness: Create record even if input challenge missing
        // AUTO mode doesn't need input answer data - it generates from story content
        // MANUAL mode will use fallback to story data if input is missing
        if (!inputChallenge) {
          logger.debug("Input challenge not found for story challenge", {
            answerId: answer.id,
            ansIdx,
            challengeId: chapter.challenge!.id,
            chapterId: chapter.id,
            chapIdx,
          });

          return {
            answerId: answer.id,
            chapterId: chapter.id,
            challengeId: chapter.challenge!.id,
            chapIdx,
            ansIdx,
            record: extractAnswerTranslationRecord(answer as Answer),
            inputChapter: undefined, // Signal that input chapter is missing
            inputChallenge: undefined, // Signal that input challenge is missing
            storyChapter: chapter as Chapter,
            storyChallenge: chapter.challenge as Challenge,
          } as EnrichedAnswerRecord;
        }

        // Input challenge exists, use it
        return {
          answerId: answer.id,
          chapterId: chapter.id,
          challengeId: chapter.challenge!.id,
          chapIdx,
          ansIdx,
          record: extractAnswerTranslationRecord(answer as Answer),
          inputChapter,
          inputChallenge,
          storyChapter: chapter as Chapter,
          storyChallenge: chapter.challenge as Challenge,
        } as EnrichedAnswerRecord;
      });
    });

    logger.info("Answer records extracted with context", {
      storyId,
      answerCount: answerRecords.length,
      mismatchWarnings: answerRecords.filter((r) => !r.inputChallenge).length,
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
    let filteredTranslations = buildTranslationRecords(
      input.translations,
      input.translationSource,
    );

    // Handle empty translations based on mode
    if (!filteredTranslations || filteredTranslations.length === 0) {
      // MANUAL mode: Skip translation execution, use base content
      if (input.translationSource === TranslationSourceType.MANUAL) {
        logger.info("MANUAL mode with no translations - skipping translation execution", {
          storyId,
          translationSource: input.translationSource,
        });
        return story as Story;
      }

      // AUTO mode: Extract base content from story to use as translation source
      // This allows DeepL to translate from base language to target languages
      logger.info(
        "AUTO mode with no input translations - extracting base content for DeepL",
        {
          storyId,
          translationSource: input.translationSource,
        },
      );

      // Extract translation records from story's base content
      const storyTranslationRecord = extractStoryTranslationRecord(story as Story);
      
      // Set as source for DeepL translation (will translate to target languages)
      filteredTranslations = [storyTranslationRecord];
      
      logger.debug("Created source language record from story base content", {
        storyId,
        sourceLanguage: storyTranslationRecord.languageCode,
      });
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
      // FIXED: Now uses enriched challenge records that carry chapter context
      // Each challenge gets ONLY its own chapter's translations, not the first chapter found
      // Enhanced for AUTO mode: Handles missing input chapters gracefully
      challengeTranslationResults = challengeRecords.map((ch: EnrichedChallengeRecord) => {
        // Use the chapter context carried in the enriched record
        const inputChapterWithChallenge = ch.inputChapter;

        // Handle case where input chapter is missing (AUTO mode robustness)
        if (!inputChapterWithChallenge) {
          logger.debug(
            "Challenge missing input chapter data - using story fallback",
            {
              challengeId: ch.challengeId,
              chapterId: ch.chapterId,
              chapIdx: ch.chapIdx,
              mode: input.translationSource,
            },
          );

          // Return translations using fallback to record data
          return {
            challengeId: ch.challengeId,
            result: {
              sourceLanguage: null,
              targetLanguages: filteredTranslations.map(
                (t: any) => t.languageCode,
              ),
              records: new Map(
                filteredTranslations.map((t: any) => [
                  t.languageCode,
                  {
                    languageCode: t.languageCode,
                    question: ch.record.question,
                  },
                ]),
              ),
            },
          } as ChallengeTranslationResult;
        }

        if (!inputChapterWithChallenge?.challenge?.translations) {
          logger.debug("Challenge has no translations from input", {
            challengeId: ch.challengeId,
            chapterId: ch.chapterId,
            chapIdx: ch.chapIdx,
          });

          // Return translations using fallback to record data
          return {
            challengeId: ch.challengeId,
            result: {
              sourceLanguage: null,
              targetLanguages: filteredTranslations.map(
                (t: any) => t.languageCode,
              ),
              records: new Map(
                filteredTranslations.map((t: any) => [
                  t.languageCode,
                  {
                    languageCode: t.languageCode,
                    question: ch.record.question,
                  },
                ]),
              ),
            },
          } as ChallengeTranslationResult;
        }

        // Use THIS challenge's chapter's translations
        const inputChallengeTranslations =
          inputChapterWithChallenge.challenge.translations;

        logger.debug(
          "Mapping challenge translations from input chapter",
          {
            challengeId: ch.challengeId,
            chapterId: ch.chapterId,
            chapIdx: ch.chapIdx,
            translationLanguages: inputChallengeTranslations.map(
              (t: any) => t.languageCode,
            ),
          },
        );

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
      // FIXED: Now uses enriched answer records that carry chapter and challenge context
      // Each answer gets ONLY its own challenge's translations, not pooled from all chapters
      // Enhanced for AUTO mode: Handles missing input challenges gracefully
      answerTranslationResults = answerRecords.map((ans: EnrichedAnswerRecord) => {
        // Use the challenge and chapter context carried in the enriched record
        const inputChallenge = ans.inputChallenge;

        // Handle case where input challenge is missing (AUTO mode robustness)
        if (!inputChallenge) {
          logger.debug(
            "Answer missing input challenge data - using story fallback",
            {
              answerId: ans.answerId,
              ansIdx: ans.ansIdx,
              challengeId: ans.challengeId,
              chapterId: ans.chapterId,
              mode: input.translationSource,
            },
          );

          // Return translations using fallback to record data
          return {
            answerId: ans.answerId,
            result: {
              sourceLanguage: null,
              targetLanguages: filteredTranslations.map(
                (t: any) => t.languageCode,
              ),
              records: new Map(
                filteredTranslations.map((t: any) => [
                  t.languageCode,
                  {
                    languageCode: t.languageCode,
                    text: ans.record.text,
                  },
                ]),
              ),
            },
          } as AnswerTranslationResult;
        }

        if (!inputChallenge?.answers) {
          logger.debug("Challenge has no answers in input", {
            answerId: ans.answerId,
            challengeId: ans.challengeId,
            chapterId: ans.chapterId,
          });

          // Return translations using fallback to record data
          return {
            answerId: ans.answerId,
            result: {
              sourceLanguage: null,
              targetLanguages: filteredTranslations.map(
                (t: any) => t.languageCode,
              ),
              records: new Map(
                filteredTranslations.map((t: any) => [
                  t.languageCode,
                  {
                    languageCode: t.languageCode,
                    text: ans.record.text,
                  },
                ]),
              ),
            },
          } as AnswerTranslationResult;
        }

        // Find THIS specific answer from the input challenge (by order, since IDs don't exist yet)
        const inputAnswer = inputChallenge.answers[ans.ansIdx];

        if (!inputAnswer?.translations) {
          logger.debug("Answer has no translations from input", {
            answerId: ans.answerId,
            ansIdx: ans.ansIdx,
            challengeId: ans.challengeId,
            chapterId: ans.chapterId,
          });

          // Return translations using fallback to record data
          return {
            answerId: ans.answerId,
            result: {
              sourceLanguage: null,
              targetLanguages: filteredTranslations.map(
                (t: any) => t.languageCode,
              ),
              records: new Map(
                filteredTranslations.map((t: any) => [
                  t.languageCode,
                  {
                    languageCode: t.languageCode,
                    text: ans.record.text,
                  },
                ]),
              ),
            },
          } as AnswerTranslationResult;
        }

        // Use THIS answer's translations from its input challenge
        const inputAnswerTranslations = inputAnswer.translations;

        logger.debug(
          "Mapping answer translations from input challenge",
          {
            answerId: ans.answerId,
            ansIdx: ans.ansIdx,
            challengeId: ans.challengeId,
            chapterId: ans.chapterId,
            translationLanguages: inputAnswerTranslations.map(
              (t: any) => t.languageCode,
            ),
          },
        );

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
