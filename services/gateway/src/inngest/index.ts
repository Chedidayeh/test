import { generateTTSAudio } from "./tts-agent/tts.function";

/**
 * Inngest functions for AI service
 * Each function handles a specific background job/event
 */
export const functions = [generateTTSAudio];
