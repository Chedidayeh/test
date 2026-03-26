import { generateTTSAudio, generateStoryTranslations, generateWeeklyAIAnalytics, generateWeeklyAIStories } from "./agents/function";

/**
 * Inngest functions for Gateway service
 * Each function handles a specific background job/event
 */
export const functions = [generateTTSAudio, generateStoryTranslations , generateWeeklyAIAnalytics , generateWeeklyAIStories];
