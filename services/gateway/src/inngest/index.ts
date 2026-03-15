import { generateTTSAudio, generateStoryTranslations } from "./agents/function";

/**
 * Inngest functions for Gateway service
 * Each function handles a specific background job/event
 */
export const functions = [generateTTSAudio, generateStoryTranslations];
