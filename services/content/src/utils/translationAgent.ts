import * as deepl from "deepl-node";
import { LanguageCode } from "@prisma/client";
import { logger } from "./logger";
import { TRANSLATION_CONFIG } from "../config/translation-config";
import { Local } from "@shared/types";

/**
 * Translation Agent
 * Wrapper around DeepL API for text translation
 * Handles retries, error management, and logging
 */

const authKey = process.env.DEEPL_API_KEY || "b7990e35-af18-449e-8d89-5c44eca0e21e:fx";
const deeplClient = new deepl.DeepLClient(authKey);

export class TranslationAgent {
  /**
   * Translate text from source language to target language
   * @param text - Text to translate
   * @param sourceLang - Source language code
   * @param targetLang - Target language code
   * @param retryCount - Current retry attempt (internal)
   * @returns Translated text
   */
  static async translateText(
    text: string,
    sourceLang: LanguageCode,
    targetLang: LanguageCode,
    retryCount = 0,
  ): Promise<string> {
    try {
      if (!text || text.trim().length === 0) {
        logger.warn("Empty text provided for translation");
        return text;
      }

      const sourceCode = this.mapLanguageCodeToDeepL(sourceLang);
      const targetCode = this.mapLanguageCodeToDeepLTarget(targetLang);

      logger.info("[TranslationAgent] Translating text", {
        from: sourceLang,
        to: targetLang,
        textLength: text.length,
      });

      const result = await deeplClient.translateText(text, sourceCode, targetCode);

      logger.info("[TranslationAgent] Translation successful", {
        from: sourceCode,
        to: targetCode,
      });

      return result.text;
    } catch (error) {
      const isRetryable = this.isRetryableError(error);
      const shouldRetry = retryCount < TRANSLATION_CONFIG.DEEPL_MAX_RETRIES && isRetryable;

      logger.error("[TranslationAgent] Translation failed", {
        attempt: retryCount + 1,
        maxRetries: TRANSLATION_CONFIG.DEEPL_MAX_RETRIES,
        shouldRetry,
        sourceLang,
        targetLang,
        error: error instanceof Error ? error.message : String(error),
      });

      if (shouldRetry) {
        // Exponential backoff: delay = base * (2 ^ retryCount)
        const delay = TRANSLATION_CONFIG.DEEPL_RETRY_DELAY_MS * Math.pow(2, retryCount);
        logger.info("[TranslationAgent] Retrying after delay", { delay });

        await new Promise((resolve) => setTimeout(resolve, delay));
        return this.translateText(text, sourceLang, targetLang, retryCount + 1);
      }

      throw error;
    }
  }

  /**
   * Determine if an error is retryable (temporary)
   */
  private static isRetryableError(error: unknown): boolean {
    if (error instanceof deepl.TooManyRequestsError) {
      return true; // Rate limited, retry
    }

    if (error instanceof deepl.DeepLError) {
      // Check for network-like errors
      const message = error.message.toLowerCase();
      return (
        message.includes("timeout") ||
        message.includes("network") ||
        message.includes("connection") ||
        message.includes("socket") ||
        message.includes("econnrefused") ||
        message.includes("econnreset") ||
        message.includes("enotfound") ||
        message.includes("etimedout") ||
        message.includes("ehostunreach") ||
        message.includes("hang up")
      );
    }

    return false;
  }

  /**
   * Map our LanguageCode to DeepL SourceLanguageCode
   */
  private static mapLanguageCodeToDeepL(
    lang: LanguageCode,
  ): deepl.SourceLanguageCode | null {
    switch (lang) {
      case LanguageCode.EN:
        return Local.EN;
      case LanguageCode.AR:
        return Local.AR;
      case LanguageCode.FR:
        return Local.FR;
      default:
        return null;
    }
  }

  /**
   * Map our LanguageCode to DeepL TargetLanguageCode
   */
  private static mapLanguageCodeToDeepLTarget(
    lang: LanguageCode,
  ): deepl.TargetLanguageCode {
    switch (lang) {
      case LanguageCode.EN:
        return "en-US";
      case LanguageCode.AR:
        return "ar";
      case LanguageCode.FR:
        return "fr";
      default:
        return "en-US";
    }
  }

  /**
   * Translate multiple texts in batch
   * @param texts - Array of texts to translate
   * @param sourceLang - Source language code
   * @param targetLang - Target language code
   * @returns Array of translated texts in same order
   */
  static async translateBatch(
    texts: string[],
    sourceLang: LanguageCode,
    targetLang: LanguageCode,
  ): Promise<string[]> {
    try {
      logger.info("[TranslationAgent] Starting batch translation", {
        count: texts.length,
        from: sourceLang,
        to: targetLang,
      });

      const results = await Promise.all(
        texts.map((text) => this.translateText(text, sourceLang, targetLang)),
      );

      logger.info("[TranslationAgent] Batch translation successful", {
        count: results.length,
      });

      return results;
    } catch (error) {
      logger.error("[TranslationAgent] Batch translation failed", {
        error: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }
  }
}

/**
 * Singleton instance exports for backwards compatibility
 */
export const translationAgent = TranslationAgent;
