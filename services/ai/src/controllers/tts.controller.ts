import { Request, Response } from "express";
import * as ttsService from "../services/tts.service";
import { logger } from "src/lib/logger";
import { ApiResponse, TTSAudio } from "@shared/types";

export async function handleSynthesize(req: Request, res: Response
) {
  try {
    logger.info("[TTS Controller] Received synthesis request", {
      textLength: typeof req.body.text === "string" ? req.body.text.length : 0,
      voice: req.body.voice,
      languageCode: req.body.languageCode,
      prompt: req.body.prompt ? "provided" : "none",
      storyId: req.body.storyId,
      chapterId: req.body.chapterId,
    });
    const { text, voice, languageCode, prompt, storyId, chapterId } = req.body;

    if (!text || typeof text !== "string") {
      logger.warn("[TTS Controller] TTS synthesis request missing or invalid 'text' field");
      return res
        .status(400)
        .json({ error: "Missing or invalid 'text' in body" });
    }

    const result = await ttsService.synthesizeText(text, {
      voice,
      languageCode,
      prompt,
      storyId,
      chapterId,
    });

    if(!result.audioUrl) {
      logger.error("[TTS Controller] TTS synthesis failed: no audio URL returned", {
        storyId,
        chapterId,
      });
      return res.status(500).json({ success: false, error: { code: "SYNTHESIS_FAILED", message: "TTS synthesis failed" } });
    }

    logger.info("[TTS Controller] TTS synthesis successful", {
      storyId,
      chapterId,
      audioUrl: result.audioUrl,
    });

    // Return audio URL and metadata (cloud storage URL)
    return res.status(200).json({
      success: true,
      data: {
        audioUrl: result.audioUrl,
        dbRecordId: result.dbRecord?.id,
        mimeType: "audio/wav",
      },
    });
  } catch (err: any) {
    logger.error("[TTS Controller] TTS error", { error: err });
    return res.status(500).json({ success: false, error: { code: "INTERNAL_ERROR", message: err?.message || "Internal error" } });
  }
}

export async function getTTSByChapterId(req: Request, res: Response<ApiResponse<TTSAudio>>) {
  try {
    const { chapterId } = req.params;

    if (!chapterId || typeof chapterId !== "string") {
      logger.warn("[TTS Controller] Missing or invalid chapterId param");
      return res.status(400).json({
        success: false,
        error: { code: "INVALID_PARAM", message: "Missing or invalid 'chapterId' param" },
      } as ApiResponse<TTSAudio>);
    }

    logger.info("[TTS Controller] Fetching TTS by chapterId", {
      chapterId,
    });

    const audio = await ttsService.fetchByIdentifiers(chapterId);

    if (!audio) {
      logger.info("[TTS Controller] No TTS audio found for chapter", { chapterId });
      return res.status(404).json({
        success: false,
        error: { code: "NOT_FOUND", message: "No TTS audio found for chapterId" },
      } as ApiResponse<TTSAudio>);
    }

    const response: ApiResponse<TTSAudio> = {
      success: true,
      data: audio,
      timestamp: new Date(),
    };

    return res.status(200).json(response);
  } catch (err: any) {
    logger.error("[TTS Controller] Error fetching TTS by chapterId", { error: err });
    return res.status(500).json({
      success: false,
      error: { code: "INTERNAL_ERROR", message: err?.message || "Internal error" },
    } as ApiResponse<TTSAudio>);
  }
}
