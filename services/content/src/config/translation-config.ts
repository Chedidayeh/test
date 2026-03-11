import { LanguageCode } from "@prisma/client";
import { TranslationSourceType } from "@shared/src/types";

/**
 * Global Translation Configuration
 * Centralized settings for auto-translation across all content models
 * Extensible to support future models (Story, Challenge, Answer, etc.)
 */

export type TranslationContentType = "badge" | "story" | "challenge" | "answer";

export const TRANSLATION_CONFIG = {
  // Source language - content is always created in EN first
  SOURCE_LANGUAGE: LanguageCode.EN,

  // Target languages for auto-translation
  TARGET_LANGUAGES: [LanguageCode.AR, LanguageCode.FR] as LanguageCode[],

  // All supported languages
  ALL_LANGUAGES: [LanguageCode.EN, LanguageCode.AR, LanguageCode.FR],

  // Content models that support auto-translation
  SUPPORTED_MODELS: ["badge", "story", "challenge"] as const,

  // DeepL API Configuration
  DEEPL_API_TIMEOUT: 60000, // 30 seconds per request
  DEEPL_MAX_RETRIES: 3, // Allow up to 3 retries on failure
  DEEPL_RETRY_DELAY_MS: 1000, // 1 second initial delay, exponential backoff after

  // Batch configuration for bulk translations
  BATCH_SIZE: 10, // Maximum items to translate in parallel

  // Feature flags
  ENABLE_AUTO_TRANSLATION: process.env.ENABLE_AUTO_TRANSLATION !== "false", // Enabled by default
};

/**
 * Language mapping for DeepL API is handled in TranslationAgent
 * Using switch statements to map to proper DeepL type-safe language codes
 */

/**
 * Translation strategy configuration for different source languages
 * Maps translation source types to their source and target languages
 */
export type TranslationStrategyType = TranslationSourceType.EN_TO_FR_AR | TranslationSourceType.FR_TO_AR_EN;

export interface TranslationStrategy {
  sourceLanguage: LanguageCode;
  targetLanguages: LanguageCode[];
}

export const TRANSLATION_STRATEGIES: Record<TranslationStrategyType, TranslationStrategy> = {
  en_to_fr_ar: {
    sourceLanguage: LanguageCode.EN,
    targetLanguages: [LanguageCode.FR, LanguageCode.AR],
  },
  fr_to_ar_en: {
    sourceLanguage: LanguageCode.FR,
    targetLanguages: [LanguageCode.AR, LanguageCode.EN],
  },
};

/**
 * Get translation strategy for a given strategy type
 * @param strategyType - The translation strategy type
 * @returns TranslationStrategy with source and target languages
 */
export function getTranslationStrategy(
  strategyType: TranslationStrategyType,
): TranslationStrategy {
  return TRANSLATION_STRATEGIES[strategyType];
}

/**
 * Request interface for translation operations
 */
export interface TranslationRequest {
  entityId: string;
  entityType: TranslationContentType;
  content: {
    name: string;
    description?: string;
  };
  targetLanguages?: LanguageCode[]; // If not provided, uses TRANSLATION_CONFIG.TARGET_LANGUAGES
}

/**
 * Translation result interface
 */
export interface TranslationResult {
  language: LanguageCode;
  name: string;
  description?: string;
}

export interface TranslationBatchResult {
  [language: string]: TranslationResult;
}
