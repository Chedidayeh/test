import { Router } from "express";
import { updateChapterAudio } from "../controllers/chapter.controller";

const router = Router();

/**
 * PATCH /api/v1/chapters/:chapterId/audio
 * Update chapter audio URL (base or with language code for translations)
 */
router.patch("/:chapterId/audio", updateChapterAudio);

export default router;
