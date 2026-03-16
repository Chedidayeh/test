import { VertexAITTSProvider } from "../tts-provider";
import { utapi } from "../../../lib/uploadthing";
import prisma from "../../../lib/prisma";
import path from "path";
import { logger } from "../../../lib/logger";
import {
  ContentLanguageToTTSLanguageMap,
  LanguageCode,
  TTSLanguageCodes,
} from "@shared/src/types";

const provider = new VertexAITTSProvider();

export interface SynthesizeOptions {
  languageCode: LanguageCode;
  storyId: string;
  chapterId: string;
  challengeId?: string;
}

export interface SynthesizeResult {
  audioUrl: string;
}

export async function synthesizeText(
  text: string,
  options: SynthesizeOptions,
): Promise<SynthesizeResult> {
  logger.debug("[TTS Service] Starting synthesis", {
    textLength: text.length,
    languageCode: options.languageCode,
    storyId: options.storyId,
    chapterId: options.chapterId,
    challengeId: options.challengeId,
  });

  // Check if audio already exists - BEFORE attempting generation
  // All identifiers (storyId, chapterId, languageCode, and optional challengeId) are used to match an existing record
  if (options.chapterId && options.storyId && options.languageCode) {
    try {
      const whereClause : any = {
        chapterId: options.chapterId,
        storyId: options.storyId,
        languageCode: options.languageCode,
      };

      // Include challengeId in the query to separate chapter audio from challenge audio
      // If challengeId is provided, match records WITH that challengeId
      // If NOT provided, match records where challengeId is null (chapter audio only)
      if (options.challengeId) {
        whereClause.challengeId = options.challengeId;
      } else {
        whereClause.challengeId = null; // Explicitly match null for chapter audio
      }

      const existing = await prisma.tTSAudio.findFirst({
        where: whereClause,
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
            challengeId: options.challengeId,
            languageCode: options.languageCode,
            generatedAt: existing.generatedAt,
          },
        );

        return { audioUrl: existing.audioUrl };
      } else if (existing && !existing.audioUrl) {
        logger.debug(
          "[TTS Service] Audio record exists but audioUrl is missing; regenerating",
          {
            id: existing.id,
            chapterId: options.chapterId,
            storyId: options.storyId,
            challengeId: options.challengeId,
            languageCode: options.languageCode,
          },
        );
      }
    } catch (dbCheckErr) {
      logger.warn(
        "[TTS Service] Failed to check existing TTS audio; proceeding with generation",
        {
          error: String(dbCheckErr),
          chapterId: options.chapterId,
          storyId: options.storyId,
          challengeId: options.challengeId,
          languageCode: options.languageCode,
        },
      );
    }
  } else {
    logger.debug(
      "[TTS Service] Missing required identifiers for audio lookup",
      {
        hasChapterId: !!options.chapterId,
        hasStoryId: !!options.storyId,
        hasLanguageCode: !!options.languageCode,
        hasChallengeId: !!options.challengeId,
      },
    );
  }

  // Log that we're proceeding with generation
  logger.info("[TTS Service] Proceeding with audio generation", {
    textLength: text.length,
    chapterId: options.chapterId,
    storyId: options.storyId,
    challengeId: options.challengeId,
    languageCode: options.languageCode,
  });

  // Convert content LanguageCode to TTS language code
  const ttsLanguageCode = options.languageCode
    ? ContentLanguageToTTSLanguageMap[options.languageCode] ||
      TTSLanguageCodes.ENGLISH_US
    : TTSLanguageCodes.ENGLISH_US;

  // Generate audio buffer (WAV)
  const audioBuffer = await provider.synthesize(text, {
    languageCode: ttsLanguageCode as TTSLanguageCodes,
  });

  // Step 1: Upload to uploadthing cloud storage
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const filename = `tts-${timestamp}.wav`;

  // Convert buffer to a Blob-like object for uploadthing
  // ignore this TypeScript error since uploadthing expects a File or Blob, and Node doesn't have File/Blob natively
  // @ts-ignore
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
        challengeId: options.challengeId || null,
        languageCode: options.languageCode || null,
        audioUrl,
        mimeType: "audio/wav",
        sizeBytes: audioBuffer.length,
      },
    });
    logger.info("[TTS Service] DB record created", { 
      id: dbRecord.id,
      storyId: options.storyId,
      chapterId: options.chapterId,
      challengeId: options.challengeId,
    });
  } catch (dbErr) {
    logger.error("[TTS Service] Failed to save DB record", { error: dbErr });
    // Non-fatal: still return success if upload worked
  }

  return { audioUrl };
}


// update default export to include new function
export default { synthesizeText };
