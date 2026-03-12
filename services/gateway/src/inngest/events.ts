import { LanguageCode } from "@shared/src/types";

/**
 * Event schema for TTS generation requests
 * This event is sent by the gateway service when a story/chapter needs TTS audio
 */
export const TTS_GENERATE_REQUESTED = "tts/generate.requested";

export interface TTSGenerateRequestedEvent {
  text: string;
  languageCode: LanguageCode;
  storyId: string;
  chapterId: string;
}
