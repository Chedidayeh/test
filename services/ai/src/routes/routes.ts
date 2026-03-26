import { Router } from "express";
import { handleSynthesize } from "../agents/voice-agent/controllers/tts.controller";
import { handleValidateAnswer } from "../agents/answer-validation-agent/controllers/validation.controller";
import { analyticsController } from "../agents/progress-analytics/controllers/analytics.controller";
import { storytellingController } from "../agents/storytelling-agent/controllers/storytelling.controller";

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

/**
 * Analytics Routes
 *
 * POST /api/v1/analytics/generate - Generate AI analytics and embeddings for a child's reading progress
 *   Request body: {
 *     childProfile: ChildProfile,
 *     storiesData: Story[]
 *   }
 *   Response: 200 OK {
 *     success: boolean,
 *     data: {
 *       insights: AIProgressInsight,
 *       embeddings: ChildEmbeddingProfile,
 *       readingLevel: string,
 *       engagementLevel: string,
 *       strengths: string[],
 *       weaknesses: string[],
 *       recommendations: string[]
 *     }
 *   }
 *   Error: 400/500 with error details
 *
 * GET /api/v1/analytics/:childId - Get all analytics reports for a specific child
 *   Query parameters:
 *     - page: number (default 1)
 *     - pageSize: number (default 10, max 50)
 *   Response: 200 OK {
 *     success: boolean,
 *     data: {
 *       childId: string,
 *       records: AIProgressInsight[]
 *     },
 *     pagination: {
 *       total: number,
 *       page: number,
 *       pageSize: number,
 *       hasMore: boolean
 *     }
 *   }
 *   Error: 400/500 with error details
 *
 */
router.post("/analytics/generate", (req, res) =>
  analyticsController.generateAnalytics(req, res),
);

// router.get("/analytics/:childId", (req, res) =>
//   analyticsController.getChildAnalytics(req, res),
// );

/**
 * Storytelling Routes
 *
 * POST /api/v1/generate-child-storytelling - Generate personalized AI story for a child
 *
 */
router.post("/generate-child-storytelling", (req, res) =>
  storytellingController.generateChildStorytelling(req, res),
);

export default router;
