import { Router } from "express";
import { handleValidateAnswer } from "../agents/answer-validation-agent/controllers/validation.controller";

const router = Router();

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

// POST /validate-answer - Validate answer and save result
router.post("/validate-answer", handleValidateAnswer);

export default router;
