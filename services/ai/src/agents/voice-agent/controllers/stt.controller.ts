import { Request, Response } from "express";
import { GoogleCloudSTTProvider } from "../stt-provider";
import { ApiResponse } from "@shared/src/types";
import { logger } from "../../../lib/logger";

export interface TranscribeAudioResult {
  transcript: string;
  confidence?: number;
}

export async function handleTranscribeAudio(
  req: Request,
  res: Response<ApiResponse<TranscribeAudioResult>>,
) {
  try {
    const { audioBuffer, languageCode } = req.body;

    logger.info("[STT Controller] Received transcription request", {
      audioLength: audioBuffer ? audioBuffer.length : 0,
      languageCode: languageCode || "en-US",
    });

    if (!audioBuffer || typeof audioBuffer !== "string") {
      logger.warn(
        "[STT Controller] Transcription request missing or invalid 'audioBuffer' field",
      );
      return res.status(400).json({
        success: false,
        error: {
          code: "INVALID_PARAM",
          message: "Missing or invalid 'audioBuffer' in body",
        },
        timestamp: new Date(),
      } as ApiResponse<TranscribeAudioResult>);
    }

    const sttProvider = new GoogleCloudSTTProvider();

    const buffer = Buffer.from(audioBuffer, "base64");

    if (buffer.length === 0) {
      logger.warn("[STT Controller] Empty audio buffer provided");
      return res.status(400).json({
        success: false,
        error: {
          code: "INVALID_PARAM",
          message: "Audio buffer is empty",
        },
        timestamp: new Date(),
      } as ApiResponse<TranscribeAudioResult>);
    }

    const transcript = await sttProvider.recognize(buffer, {
      languageCode: languageCode || "en-US",
      sampleRateHertz: 48000,
      encoding: "WEBM_OPUS",
    });

    if (!transcript || transcript.trim().length === 0) {
      logger.warn("[STT Controller] Empty transcript returned from STT provider");
      return res.status(400).json({
        success: false,
        error: {
          code: "NO_SPEECH_DETECTED",
          message: "No speech detected in audio",
        },
        timestamp: new Date(),
      } as ApiResponse<TranscribeAudioResult>);
    }

    logger.info("[STT Controller] Audio transcribed successfully", {
      transcriptLength: transcript.length,
      languageCode: languageCode || "en-US",
    });

    const response: ApiResponse<TranscribeAudioResult> = {
      success: true,
      data: {
        transcript: transcript.trim(),
      },
      timestamp: new Date(),
    };

    return res.status(200).json(response);
  } catch (err: any) {
    logger.error("[STT Controller] Transcription error", { error: err });
    return res.status(500).json({
      success: false,
      error: {
        code: "INTERNAL_ERROR",
        message: err?.message || "Internal error",
      },
      timestamp: new Date(),
    } as ApiResponse<TranscribeAudioResult>);
  }
}
