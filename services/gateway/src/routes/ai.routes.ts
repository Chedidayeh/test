import { Router, Request, Response } from "express";
import axios from "axios";
import { logger } from "../utils/logger";
import { forwardToContentService } from "../helpers/content.helpers";
import { API_BASE_URL_V1, ApiResponse, TTSAudio } from "@shared/src/types";

const router = Router();

// AI service base URL (AI microservice)
const AI_SERVICE_URL = process.env.AI_SERVICE_URL || "http://localhost:3005";

/**
 * GET /api/v1/tts/chapterId/:chapterId - fetch TTS audio metadata for a chapter
 */
router.get("/tts/chapterId/:chapterId", async (req: Request, res: Response<ApiResponse<TTSAudio>>) => {
  try {
    const { chapterId } = req.params;
    logger.info("[Gateway] TTS fetch request received", { chapterId });

    if (!chapterId || typeof chapterId !== "string") {
      logger.warn("[Gateway] Invalid chapterId param", { chapterId });
      return res.status(400).json({
        success: false,
        error: { code: "INVALID_PARAM", message: "Missing or invalid 'chapterId' param" },
      } as ApiResponse<TTSAudio>);
    }

    const headers: Record<string, string> = {};
    if (req.headers.authorization)
      headers["authorization"] = String(req.headers.authorization);

    const url = `${AI_SERVICE_URL}${API_BASE_URL_V1}/tts/chapterId/${encodeURIComponent(chapterId)}`;
    logger.info("[Gateway] Proxying to AI service", { url });

    const resp = await axios.get(url, { headers });
    logger.info("[Gateway] AI service response received", {
      status: resp.status,
    });

    return res.status(resp.status).json(resp.data as ApiResponse<TTSAudio>);
  } catch (err: any) {
    const errorMsg = err?.response?.data || err?.message || "Unknown error";
    const status = err?.response?.status || 500;
    logger.error("[Gateway] AI TTS fetch proxy error", {
      status,
      error: errorMsg,
      url: `${AI_SERVICE_URL}${API_BASE_URL_V1}/tts/chapterId/${req.params.chapterId}`,
    });
    const data = err?.response?.data || { success: false, error: { code: "SERVICE_ERROR", message: "AI service error" } };
    return res.status(status).json(data as ApiResponse<TTSAudio>);
  }
});

/**
 * POST /api/v1/tts - Text-to-Speech synthesis (proxies to AI service)
 */
router.post("/tts", async (req: Request, res: Response) => {
  try {
    const { text, voice, languageCode, prompt, storyId, chapterId } = req.body;

    if (!text || typeof text !== "string") {
      return res
        .status(400)
        .json({ error: "Missing or invalid 'text' in body" });
    }

    const headers: Record<string, string> = {};
    if (req.headers.authorization)
      headers["authorization"] = String(req.headers.authorization);

    const resp = await axios.post(
      `${AI_SERVICE_URL}${API_BASE_URL_V1}/tts`,
      { text, voice, languageCode, prompt, storyId, chapterId },
      { headers },
    );

    return res.status(resp.status).json(resp.data);
  } catch (err: any) {
    logger.error("AI TTS proxy error", err?.message || err);
    const status = err?.response?.status || 500;
    const data = err?.response?.data || { error: "AI service error" };
    return res.status(status).json(data);
  }
});

export default router;
