import { PrismaClient, BadgeTranslation, LanguageCode } from "@prisma/client";
import { logger } from "../utils/logger";
import { TranslationAgent } from "../utils/translationAgent";

/**
 * Translation Service
 * Orchestrates translation operations and manages translation records
 * Supports multiple content models through a generic interface
 */

export class TranslationService {
  private prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  /**
   * Translate content (name and description) to multiple target languages
   * @param sourceText - Original text to translate
   * @param sourceLang - Source language
   * @param targetLanguages - Languages to translate to
   * @returns Map of language -> translated text
   */
  async translateContent(
    sourceText: string,
    sourceLang: LanguageCode,
    targetLanguages: LanguageCode[],
  ): Promise<Map<LanguageCode, string>> {
    const translations = new Map<LanguageCode, string>();

    logger.info("[TranslationService] Starting translation", {
      sourceLanguage: sourceLang,
      targetLanguages,
      textLength: sourceText.length,
    });

    try {
      for (const targetLang of targetLanguages) {
        if (targetLang === sourceLang) {
          logger.info(
            "[TranslationService] Skipping source language translation",
            {
              language: targetLang,
            },
          );
          continue;
        }

        const translated = await TranslationAgent.translateText(
          sourceText,
          sourceLang,
          targetLang,
        );

        translations.set(targetLang, translated);

        logger.info(
          "[TranslationService] Translation stored for language",
          {
            targetLanguage: targetLang,
            resultLength: translated.length,
            sourceLength: sourceText.length,
            success: !!translated && translated.length > 0,
          },
        );
      }

      return translations;
    } catch (error) {
      logger.error("[TranslationService] Translation content error", {
        error: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }
  }
}

/**
 * Global TranslationService instance
 * Initialized with Prisma client when needed
 */
let translationServiceInstance: TranslationService | null = null;

/**
 * Get or initialize the global TranslationService instance
 * @param prisma - Prisma client instance
 * @returns Global TranslationService instance
 */
export function getTranslationService(
  prisma: PrismaClient,
): TranslationService {
  if (!translationServiceInstance) {
    translationServiceInstance = new TranslationService(prisma);
  }
  return translationServiceInstance;
}

/**
 * Export the get function as default for convenience
 */
export { getTranslationService as translationService };
