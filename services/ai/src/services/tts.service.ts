import { VertexAITTSProvider } from "../agents/voice-agent/provider";
import { utapi } from "../lib/uploadthing";
import prisma from "../lib/prisma";
import path from "path";
import { logger } from "../lib/logger";
import {
  ContentLanguageToTTSLanguageMap,
  LanguageCode,
  TTSLanguageCodes,
} from "@shared/src/types";

const provider = new VertexAITTSProvider();

export interface SynthesizeOptions {
  languageCode?: LanguageCode;
  prompt?: string;
  storyId?: string;
  chapterId?: string;
}

export interface SynthesizeResult {
  audioUrl: string;
}

export async function synthesizeText(
  text: string,
  options: SynthesizeOptions = {},
): Promise<SynthesizeResult> {
  logger.debug("[TTS Service] Starting synthesis", {
    textLength: text.length,
    languageCode: options.languageCode,
    prompt: options.prompt ? "provided" : "none",
    storyId: options.storyId,
    chapterId: options.chapterId,
  });

  // If an audio already exists for the given identifiers, reuse it and skip generation
  if (options.chapterId || options.storyId || options.languageCode) {
    try {
      const existing = await prisma.tTSAudio.findFirst({
        where: {
          chapterId: options.chapterId,
          storyId: options.storyId,
          languageCode: options.languageCode,
        },
        orderBy: { generatedAt: "desc" },
      });

      if (existing && existing.audioUrl) {
        logger.info(
          "[TTS Service] Found existing TTS audio, skipping generation",
          {
            id: existing.id,
            audioUrl: existing.audioUrl,
            chapterId: options.chapterId,
            storyId: options.storyId,
            languageCode: options.languageCode,
          },
        );

        return { audioUrl: existing.audioUrl };
      }
    } catch (dbCheckErr) {
      logger.warn(
        "[TTS Service] Failed to check existing TTS audio; proceeding with generation",
        { error: dbCheckErr },
      );
    }
  }

  // Convert content LanguageCode to TTS language code
  const ttsLanguageCode = options.languageCode
    ? ContentLanguageToTTSLanguageMap[options.languageCode] ||
      TTSLanguageCodes.ENGLISH_US
    : TTSLanguageCodes.ENGLISH_US;

  // Generate audio buffer (WAV)
  const audioBuffer = await provider.synthesize(text, {
    languageCode: ttsLanguageCode as TTSLanguageCodes,
    prompt: options.prompt,
  });

  // Step 1: Upload to uploadthing cloud storage
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const filename = `tts-${timestamp}.wav`;

  // Convert buffer to a Blob-like object for uploadthing
  const file = new File([audioBuffer], filename, { type: "audio/wav" });

  let audioUrl = "";
  try {
    const uploadResponse = await utapi.uploadFiles(file);
    if (uploadResponse.error) {
      throw new Error(`Upload failed: ${uploadResponse.error.code}`);
    }
    audioUrl = uploadResponse.data?.url || "";
    logger.info("[TTS Service] Audio uploaded successfully", { audioUrl });
  } catch (uploadErr) {
    logger.error("[TTS Service] Failed to upload audio", { error: uploadErr });
    throw new Error(`Failed to upload audio: ${(uploadErr as any)?.message}`);
  }

  // Step 2: Save metadata in DB
  let dbRecord = null;
  try {
    dbRecord = await prisma.tTSAudio.create({
      data: {
        storyId: options.storyId || null,
        chapterId: options.chapterId || null,
        languageCode: options.languageCode || null,
        prompt: options.prompt || null,
        audioUrl,
        mimeType: "audio/wav",
        sizeBytes: audioBuffer.length,
      },
    });
    logger.info("[TTS Service] DB record created", { id: dbRecord.id });
  } catch (dbErr) {
    logger.error("[TTS Service] Failed to save DB record", { error: dbErr });
    // Non-fatal: still return success if upload worked
  }

  return { audioUrl };
}

export async function fetchByIdentifiers(chapterId: string) {
  logger.debug("[TTS Service] Fetching TTS by chapterId:", { chapterId });

  const audio = await prisma.tTSAudio.findFirst({
    where: { chapterId },
    orderBy: { generatedAt: "desc" },
  });
  if (!audio) {
    logger.info("[TTS Service] No TTS audio found for chapterId", {
      chapterId,
    });
    return null;
  }
  return audio;
}

// update default export to include new function
export default { synthesizeText, fetchByIdentifiers };
