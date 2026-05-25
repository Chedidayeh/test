import { Router } from "express";
import { handleSynthesize } from "../agents/voice-agent/controllers/tts.controller";
import { handleValidateAnswer } from "../agents/answer-validation-agent/controllers/validation.controller";
import { analyticsController } from "../agents/progress-analytics/controllers/analytics.controller";
import { hintGeneratorController } from "../agents/hint-generator/controllers/hint.controller";

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
router.post("/tts", handleSynthesize);

/**
 * Answer Validation Routes
 *
 * POST /api/v1/validate-answer - Validate a child's answer using LLM
 *   Request body: {
 *     storyId: string,
 *     chapterId: string,
 *     challengeAttemptId: string,
 *     attemptActionId?: string,
 *     storyContent: string,
 *     question: string,
 *     correctAnswers: string[],
 *     childAnswer: string,
 *     challengeType: string (e.g., "RIDDLE", "MULTIPLE_CHOICE")
 *   }
 *   Response: 200 OK { success: true, data: { correct, confidence, reason, message } }
 *   Error: 400/500 with error details
 *
 */
router.post("/validate-answer", handleValidateAnswer);



router.post("/analytics/generate", (req, res) =>
  analyticsController.generateAnalytics(req, res),
);

router.post("/week-report/:childId", (req, res) =>
  analyticsController.getChildWeeklyAnalytics(req, res),
);


router.post("/generate-hints", (req, res) =>
  hintGeneratorController.generateHints(req, res),
);

export default router;
