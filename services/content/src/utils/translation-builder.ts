/**
 * Translation Builder Module
 * Handles translation logic for story creation/editing
 * Supports both MANUAL (user-provided) and AUTO (DeepL-generated) translation modes
 */

import { LanguageCode } from "@prisma/client";
import { TranslationSourceType } from "@shared/types";
import {
  TRANSLATION_CONFIG,
  TRANSLATION_STRATEGIES,
  TranslationStrategy,
  TranslationStrategyType,
} from "../config/translation-config";
import { TranslationAgent } from "./translationAgent";
import { logger } from "./logger";

/**
 * Generic translation record type for flexible field handling
 * Used across Story, Chapter, Challenge, and Answer translations
 */
export interface TranslationRecord {
  languageCode: string;
  title?: string;
  description?: string;
  content?: string;
  question?: string;
  text?: string;
  hints?: string[];
  audioUrl?: string;
}

/**
 * Result of translation operation for a single entity
 * Contains translations for source language and all target languages
 */
export interface TranslationResult {
  sourceLanguage: LanguageCode;
  targetLanguages: LanguageCode[];
  records: Map<LanguageCode, TranslationRecord>; // Map of language -> translated content
}

/**
 * Build translation records based on translation source mode
 * Filters input translations to include only relevant languages based on mode
 *
 * @param translations - Input translations from form/API
 * @param translationSource - Translation mode (MANUAL, EN_TO_FR_AR, FR_TO_AR_EN)
 * @returns Filtered translations array, or undefined if empty
 *
 * @example
 * // MANUAL mode - returns all provided translations
 * buildTranslationRecords(
 *   [{ languageCode: "EN", title: "..." }, { languageCode: "FR", title: "..." }],
 *   TranslationSourceType.MANUAL
 * ) // returns all 2 translations
 *
 * // AUTO mode - filters to source language only (API will generate targets)
 * buildTranslationRecords(
 *   [{ languageCode: "EN", title: "..." }, { languageCode: "FR", title: "..." }],
 *   TranslationSourceType.EN_TO_FR_AR
 * ) // returns only EN translation
 */
export function buildTranslationRecords(
  translations: TranslationRecord[] | undefined,
  translationSource: TranslationSourceType
): TranslationRecord[] | undefined {
  // No translations provided
  if (!translations || translations.length === 0) {
    return undefined;
  }

  // MANUAL mode: return all provided translations as-is
  if (translationSource === TranslationSourceType.MANUAL) {
    logger.info("[TranslationBuilder] MANUAL mode: including all provided translations", {
      count: translations.length,
      languages: translations.map((t) => t.languageCode),
    });
    return translations;
  }

  // AUTO modes: filter to source language only
  // API will call TranslationAgent to generate target languages
  const sourceLanguage = getSourceLanguageForMode(translationSource);

  if (!sourceLanguage) {
    logger.warn("[TranslationBuilder] Could not determine source language for mode", {
      mode: translationSource,
    });
    return undefined;
  }

  const filtered = translations.filter((t) => t.languageCode.toUpperCase() === sourceLanguage);

  logger.info("[TranslationBuilder] AUTO mode: filtered to source language only", {
    mode: translationSource,
    sourceLanguage,
    originalCount: translations.length,
    filteredCount: filtered.length,
  });

  return filtered.length > 0 ? filtered : undefined;
}

/**
 * Get source language code string for a translation mode
 * Used internally by buildTranslationRecords
 *
 * @param source - Translation source type
 * @returns Language code (EN, FR) or null if MANUAL mode
 */
function getSourceLanguageForMode(
  source: TranslationSourceType
): string | null {
  switch (source) {
    case TranslationSourceType.EN_TO_FR_AR:
      return "EN";
    case TranslationSourceType.FR_TO_AR_EN:
      return "FR";
    case TranslationSourceType.MANUAL:
      return null; // All languages in manual mode
  }
}

/**
 * Get translation strategy for a given translation source type
 * Defines source language and target languages for auto-translation
 *
 * @param translationSource - Translation source type
 * @returns TranslationStrategy with source and target languages
 * @throws Error if translation source is MANUAL or invalid
 *
 * @example
 * const strategy = getTranslationStrategyForSource(TranslationSourceType.EN_TO_FR_AR);
 * // { sourceLanguage: LanguageCode.EN, targetLanguages: [LanguageCode.FR, LanguageCode.AR] }
 */
export function getTranslationStrategyForSource(
  translationSource: TranslationSourceType
): TranslationStrategy {
  if (translationSource === TranslationSourceType.MANUAL) {
    throw new Error(
      "Cannot get translation strategy for MANUAL mode - translations are user-provided"
    );
  }

  // Cast to strategy type (EN_TO_FR_AR or FR_TO_AR_EN)
  const strategyType = translationSource as TranslationStrategyType;
  const strategy = TRANSLATION_STRATEGIES[strategyType];

  if (!strategy) {
    throw new Error(`Unknown translation strategy: ${translationSource}`);
  }

  logger.info("[TranslationBuilder] Retrieved translation strategy", {
    source: translationSource,
    sourceLanguage: strategy.sourceLanguage,
    targetLanguages: strategy.targetLanguages,
  });

  return strategy;
}

/**
 * Translate a single content field from source to target language
 * Handles retry logic and error management via TranslationAgent
 *
 * @param text - Text to translate
 * @param sourceLanguage - Source language
 * @param targetLanguage - Target language
 * @param fieldName - Name of field being translated (for logging)
 * @returns Translated text
 * @throws Error if translation fails after retries
 */
async function translateField(
  text: string | undefined,
  sourceLanguage: LanguageCode,
  targetLanguage: LanguageCode,
  fieldName: string
): Promise<string | undefined> {
  if (!text || text.trim().length === 0) {
    logger.debug(`[TranslationBuilder] Skipping empty ${fieldName}`, {
      sourceLanguage,
      targetLanguage,
    });
    return undefined;
  }

  try {
    logger.info(`[TranslationBuilder] Translating ${fieldName}`, {
      sourceLanguage,
      targetLanguage,
      textLength: text.length,
    });

    const translated = await TranslationAgent.translateText(text, sourceLanguage, targetLanguage);

    logger.info(`[TranslationBuilder] ${fieldName} translated successfully`, {
      sourceLanguage,
      targetLanguage,
      originalLength: text.length,
      translatedLength: translated.length,
    });

    return translated;
  } catch (error) {
    logger.error(`[TranslationBuilder] Failed to translate ${fieldName}`, {
      sourceLanguage,
      targetLanguage,
      error: error instanceof Error ? error.message : String(error),
    });
    throw error;
  }
}

/**
 * Translate multiple items in parallel (batch translation)
 * More efficient than individual calls for translating arrays like hints
 *
 * @param items - Array of strings to translate
 * @param sourceLanguage - Source language
 * @param targetLanguage - Target language
 * @param fieldName - Name of field being translated (for logging)
 * @returns Array of translated items in same order
 * @throws Error if translation fails after retries
 */
async function translateBatchField(
  items: string[] | undefined,
  sourceLanguage: LanguageCode,
  targetLanguage: LanguageCode,
  fieldName: string
): Promise<string[] | undefined> {
  if (!items || items.length === 0) {
    logger.debug(`[TranslationBuilder] Skipping empty ${fieldName} array`, {
      sourceLanguage,
      targetLanguage,
    });
    return undefined;
  }

  try {
    logger.info(`[TranslationBuilder] Batch translating ${fieldName}`, {
      sourceLanguage,
      targetLanguage,
      count: items.length,
    });

    const translated = await TranslationAgent.translateBatch(
      items,
      sourceLanguage,
      targetLanguage
    );

    logger.info(`[TranslationBuilder] ${fieldName} batch translated successfully`, {
      sourceLanguage,
      targetLanguage,
      count: translated.length,
    });

    return translated;
  } catch (error) {
    logger.error(`[TranslationBuilder] Failed to batch translate ${fieldName}`, {
      sourceLanguage,
      targetLanguage,
      count: items.length,
      error: error instanceof Error ? error.message : String(error),
    });
    throw error;
  }
}

/**
 * Translate content fields from source language to target language
 * Handles all possible fields: title, description, content, question, text, hints, audioUrl
 *
 * @param sourceRecord - Translation record in source language (with content to translate)
 * @param sourceLanguage - Source language
 * @param targetLanguage - Target language
 * @returns TranslationRecord in target language with same structure as source
 * @throws Error if any field translation fails
 *
 * @example
 * const sourceRecord = { languageCode: "EN", title: "My Story", description: "..." };
 * const frenchRecord = await translateContentFields(
 *   sourceRecord,
 *   LanguageCode.EN,
 *   LanguageCode.FR
 * );
 * // Returns: { languageCode: "FR", title: "Mon Histoire", description: "..." }
 */
export async function translateContentFields(
  sourceRecord: TranslationRecord,
  sourceLanguage: LanguageCode,
  targetLanguage: LanguageCode
): Promise<TranslationRecord> {
  logger.info("[TranslationBuilder] Starting content field translation", {
    sourceLanguage,
    targetLanguage,
    fields: Object.keys(sourceRecord).filter((k) => k !== "languageCode"),
  });

  const translatedRecord: TranslationRecord = {
    languageCode: LanguageCode[targetLanguage],
  };

  // Translate scalar string fields in parallel
  const [
    translatedTitle,
    translatedDescription,
    translatedContent,
    translatedQuestion,
    translatedText,
    translatedHints,
    translatedAudioUrl, // Note: audioUrl typically not translated, but included for completeness
  ] = await Promise.all([
    translateField(sourceRecord.title, sourceLanguage, targetLanguage, "title"),
    translateField(sourceRecord.description, sourceLanguage, targetLanguage, "description"),
    translateField(sourceRecord.content, sourceLanguage, targetLanguage, "content"),
    translateField(sourceRecord.question, sourceLanguage, targetLanguage, "question"),
    translateField(sourceRecord.text, sourceLanguage, targetLanguage, "text"),
    translateBatchField(sourceRecord.hints, sourceLanguage, targetLanguage, "hints"),
    Promise.resolve(sourceRecord.audioUrl), // audioUrl is not translated, just copied
  ]);

  // Assemble translated record with only populated fields
  if (translatedTitle !== undefined) translatedRecord.title = translatedTitle;
  if (translatedDescription !== undefined) translatedRecord.description = translatedDescription;
  if (translatedContent !== undefined) translatedRecord.content = translatedContent;
  if (translatedQuestion !== undefined) translatedRecord.question = translatedQuestion;
  if (translatedText !== undefined) translatedRecord.text = translatedText;
  if (translatedHints !== undefined) translatedRecord.hints = translatedHints;
  if (translatedAudioUrl !== undefined) translatedRecord.audioUrl = translatedAudioUrl;

  logger.info("[TranslationBuilder] Content field translation completed", {
    sourceLanguage,
    targetLanguage,
    resultFields: Object.keys(translatedRecord).filter((k) => k !== "languageCode"),
  });

  return translatedRecord;
}

/**
 * Build complete translation result for an entity
 * Includes source language record + auto-generated target language records
 *
 * Used internally by entity-specific translation creators
 * Orchestrates the full translation pipeline for a content entity
 *
 * @param translationSource - Translation source type (determines if auto-translate)
 * @param sourceRecord - The source language record (must include content to translate)
 * @param translation - Translation strategy from getTranslationStrategyForSource()
 * @returns TranslationResult with source + all target language records
 * @throws Error if translation fails
 */
export async function buildCompleteTranslationResult(
  translationSource: TranslationSourceType,
  sourceRecord: TranslationRecord,
  strategy: TranslationStrategy
): Promise<TranslationResult> {
  logger.info("[TranslationBuilder] Building complete translation result", {
    translationSource,
    sourceLanguage: strategy.sourceLanguage,
    targetLanguages: strategy.targetLanguages,
  });

  const records = new Map<LanguageCode, TranslationRecord>();

  // Always include source language record
  records.set(strategy.sourceLanguage, {
    ...sourceRecord,
    languageCode: LanguageCode[strategy.sourceLanguage],
  });

  logger.debug("[TranslationBuilder] Added source language record", {
    language: strategy.sourceLanguage,
  });

  // Auto-translate to target languages
  for (const targetLanguage of strategy.targetLanguages) {
    try {
      const translatedRecord = await translateContentFields(
        sourceRecord,
        strategy.sourceLanguage,
        targetLanguage
      );

      records.set(targetLanguage, translatedRecord);

      logger.debug("[TranslationBuilder] Added target language record", {
        language: targetLanguage,
      });
    } catch (error) {
      logger.error("[TranslationBuilder] Failed to generate target language translation", {
        targetLanguage,
        error: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }
  }

  logger.info("[TranslationBuilder] Complete translation result built successfully", {
    totalRecords: records.size,
    languages: Array.from(records.keys()),
  });

  return {
    sourceLanguage: strategy.sourceLanguage,
    targetLanguages: strategy.targetLanguages,
    records,
  };
}

/**
 * Get mapped language code for use in database records
 * Converts LanguageCode enum to string representation
 *
 * @param lang - Language code enum
 * @returns String representation (EN, FR, AR)
 */
export function getLanguageCodeString(lang: LanguageCode): string {
  return LanguageCode[lang];
}

/**
 * Validate translation record has required fields for entity type
 * Ensures we're not trying to create incomplete translation records
 *
 * @param record - Translation record to validate
 * @param entityType - Type of entity (story, chapter, challenge, answer)
 * @throws Error if required fields are missing
 */
export function validateTranslationRecord(
  record: TranslationRecord,
  entityType: "story" | "chapter" | "challenge" | "answer"
): void {
  const errors: string[] = [];

  switch (entityType) {
    case "story":
      if (!record.title) errors.push("title is required for story translation");
      if (!record.languageCode) errors.push("languageCode is required");
      break;

    case "chapter":
      if (!record.content) errors.push("content is required for chapter translation");
      if (!record.languageCode) errors.push("languageCode is required");
      break;

    case "challenge":
      if (!record.question) errors.push("question is required for challenge translation");
      if (!record.languageCode) errors.push("languageCode is required");
      break;

    case "answer":
      if (!record.text) errors.push("text is required for answer translation");
      if (!record.languageCode) errors.push("languageCode is required");
      break;
  }

  if (errors.length > 0) {
    const errorMessage = `Invalid translation record for ${entityType}: ${errors.join("; ")}`;
    logger.error("[TranslationBuilder] Validation failed", {
      entityType,
      errors,
      record,
    });
    throw new Error(errorMessage);
  }

  logger.debug("[TranslationBuilder] Translation record validation passed", {
    entityType,
    languageCode: record.languageCode,
  });
}
