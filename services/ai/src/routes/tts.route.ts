import { Router } from "express";
import { handleSynthesize } from "../agents/voice-agent/controllers/tts.controller";

const router = Router();

/**
 * TTS Routes
 * 
 * POST /api/v1/tts - Queue TTS generation (async, non-blocking)
 *   Request body: { text, languageCode?, storyId?, chapterId?, prompt? }
 *   Response: 202 Accepted { success: true, data: { eventId } }
 *   Note: Audio generation happens asynchronously in the background
 * 
 */

// POST /tts - Queue TTS generation
router.post("/tts", handleSynthesize);


export default router;
