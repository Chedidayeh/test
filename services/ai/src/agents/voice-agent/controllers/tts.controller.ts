import { Request, Response } from "express";
import * as ttsService from "../services/tts.service";
import { ApiResponse, TTSAudio, LanguageCode } from "@shared/src/types";
import { logger } from "../../../lib/logger";

export async function handleSynthesize(
  req: Request,
  res: Response<ApiResponse<{ audioUrl: string }>>,
) {
  try {
    logger.info("[TTS Controller] Received synthesis request", {
      textLength: typeof req.body.text === "string" ? req.body.text.length : 0,
      languageCode: req.body.languageCode,
      storyId: req.body.storyId,
      chapterId: req.body.chapterId,
      challengeId: req.body.challengeId,
      challengeQuestion: req.body.challengeQuestion,
    });
    const { text, languageCode, storyId, chapterId, challengeQuestion, challengeId } =
      req.body;

    if (!text || typeof text !== "string") {
      logger.warn(
        "[TTS Controller] TTS synthesis request missing or invalid 'text' field",
      );
      return res.status(400).json({
        success: false,
        error: {
          code: "INVALID_PARAM",
          message: "Missing or invalid 'text' in body",
        },
        timestamp: new Date(),
      } as ApiResponse<{ audioUrl: string }>);
    }

    // Validate languageCode if provided
    if (languageCode && !Object.values(LanguageCode).includes(languageCode)) {
      logger.warn("[TTS Controller] Invalid language code provided", {
        languageCode,
      });
      return res.status(400).json({
        success: false,
        error: {
          code: "INVALID_PARAM",
          message: `Invalid language code. Must be one of: ${Object.values(LanguageCode).join(", ")}`,
        },
        timestamp: new Date(),
      } as ApiResponse<{ audioUrl: string }>);
    }
    // Call TTS service to synthesize chapter text (returns audio URL)
    const result = await ttsService.synthesizeText(text, {
      languageCode,
      storyId,
      chapterId,
    });

    let challengeAudioResult: ttsService.SynthesizeResult | null = null;

    // call TTS service to synthesize challenge question text (returns audio URL)
    if (challengeQuestion) {
      challengeAudioResult = await ttsService.synthesizeText(
        challengeQuestion,
        {
          languageCode,
          storyId,
          chapterId,
          challengeId,
        },
      );
      if (
        !challengeAudioResult.audioUrl ||
        typeof challengeAudioResult.audioUrl !== "string"
      ) {
        logger.error(
          "[TTS Controller] Challenge question TTS synthesis failed: no audio URL returned",
          {
            storyId,
            chapterId,
            challengeQuestion,
          },
        );
        challengeAudioResult = null; // Ensure we return null for challenge audio if synthesis failed
      } else {
        logger.info(
          "[TTS Controller] Challenge question TTS synthesis successful",
          {
            storyId,
            chapterId,
            languageCode,
            challengeQuestion,
            challengeAudioUrl: challengeAudioResult.audioUrl,
          },
        );
      }
    }

    if (!result.audioUrl || typeof result.audioUrl !== "string") {
      logger.error(
        "[TTS Controller] TTS synthesis failed: no audio URL returned",
        {
          storyId,
          chapterId,
        },
      );
      return res.status(500).json({
        success: false,
        error: { code: "SYNTHESIS_FAILED", message: "TTS synthesis failed" },
        timestamp: new Date(),
      } as ApiResponse<{
        audioUrl: string;
        challengeAudioUrl: string | undefined;
      }>);
    }

    logger.info("[TTS Controller] TTS synthesis successful", {
      storyId,
      chapterId,
      languageCode,
      audioUrl: result.audioUrl,
    });

    // Return audio URL and metadata (cloud storage URL)
    const response: ApiResponse<{
      audioUrl: string;
      challengeAudioUrl: string | undefined;
    }> = {
      success: true,
      data: {
        audioUrl: result.audioUrl,
        challengeAudioUrl: challengeAudioResult?.audioUrl,
      },
      timestamp: new Date(),
    };

    return res.status(200).json(response);
  } catch (err: any) {
    logger.error("[TTS Controller] TTS error", { error: err });
    return res.status(500).json({
      success: false,
      error: {
        code: "INTERNAL_ERROR",
        message: err?.message || "Internal error",
      },
      timestamp: new Date(),
    } as ApiResponse<{
      audioUrl: string;
      challengeAudioUrl: string | undefined;
    }>);
  }
}
