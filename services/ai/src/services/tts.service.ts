import { VertexAITTSProvider } from "../agents/voice-agent/provider";
import { utapi } from "../lib/uploadthing";
import prisma from "../lib/prisma";
import path from "path";
import { logger } from "src/lib/logger";

const provider = new VertexAITTSProvider();

export interface SynthesizeOptions {
  voice?: string;
  languageCode?: string;
  prompt?: string;
  storyId?: string;
  chapterId?: string;
}

export interface SynthesizeResult {
  audioBuffer: Buffer;
  audioUrl: string;
  dbRecord: any;
}

export async function synthesizeText(
  text: string,
  options: SynthesizeOptions = {},
): Promise<SynthesizeResult> {
  logger.debug("[TTS Service] Starting synthesis", {
    textLength: text.length,
    voice: options.voice,
    languageCode: options.languageCode,
    prompt: options.prompt ? "provided" : "none",
    storyId: options.storyId,
    chapterId: options.chapterId,
  });
  // Generate audio buffer (WAV)
  const audioBuffer = await provider.synthesize(text, options as any);

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
        voice: options.voice || null,
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

  return { audioBuffer, audioUrl, dbRecord };
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
