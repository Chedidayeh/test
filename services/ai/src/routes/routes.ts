import { Router } from "express";
import { handleSynthesize } from "../agents/voice-agent/controllers/tts.controller";
import { handleTranscribeAudio } from "../agents/voice-agent/controllers/stt.controller";
import { handleValidateAnswer } from "../agents/answer-validation-agent/controllers/validation.controller";
import { analyticsController } from "../agents/progress-analytics/controllers/analytics.controller";
import { hintGeneratorController } from "../agents/hint-generator/controllers/hint.controller";
import { jobTrackingController } from "../controllers/job-tracking.controller";

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
 * STT Routes
 *
 * POST /api/v1/transcribe-audio - Transcribe audio to text using Google Cloud Speech-to-Text
 *   Request body: {
 *     audioBuffer: string (base64 encoded audio),
 *     languageCode?: string (BCP-47 language code, e.g., "en-US", "ar-SA", "fr-FR")
 *   }
 *   Response: 200 OK { success: true, data: { transcript, confidence? } }
 *   Error: 400/500 with error details
 *
 */
router.post("/transcribe-audio", handleTranscribeAudio);

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

/**
 * Job Tracking Routes
 *
 * POST /api/v1/jobs - Create a new job tracking entry
 * PATCH /api/v1/jobs/:eventId - Update job status
 * GET /api/v1/jobs - Get all jobs with optional filters
 * GET /api/v1/jobs/stats - Get job statistics
 * GET /api/v1/jobs/:eventId - Get a single job by event ID
 * GET /api/v1/jobs/story/:storyId - Get all jobs for a story
 * GET /api/v1/jobs/chapter/:chapterId - Get all jobs for a chapter
 */
router.post("/jobs", (req, res) => jobTrackingController.createJob(req, res));
router.patch("/jobs/:eventId", (req, res) =>
  jobTrackingController.updateJob(req, res),
);
router.get("/jobs/stats", (req, res) =>
  jobTrackingController.getJobStats(req, res),
);
router.get("/jobs/story/:storyId", (req, res) =>
  jobTrackingController.getJobsByStory(req, res),
);
router.get("/jobs/chapter/:chapterId", (req, res) =>
  jobTrackingController.getJobsByChapter(req, res),
);
router.get("/jobs/:eventId", (req, res) =>
  jobTrackingController.getJobByEventId(req, res),
);
router.get("/jobs", (req, res) => jobTrackingController.getAllJobs(req, res));

export default router;
