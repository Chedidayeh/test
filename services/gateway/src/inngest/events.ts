import { LanguageCode, TranslationSourceType, CreateStoryWithChaptersInput } from "@shared/src/types";

/**
 * Event schema for translation requests
 * Gateway triggers this event after story creation/edit
 * Contains full input data to be passed to content service endpoint
 */
export const TRANSLATION_STORY_REQUESTED = "translation/story.requested";

export interface TranslationStoryRequestedEvent {
  storyId: string;
  input: CreateStoryWithChaptersInput;
  generateAudio: boolean;
}

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
