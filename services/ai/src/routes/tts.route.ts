import { Router } from "express";
import { handleSynthesize, getTTSByChapterId } from "../controllers/tts.controller";

const router = Router();

// POST /tts
router.post("/tts", handleSynthesize);

// GET /tts/chapterId/:chapterId
router.get("/tts/chapterId/:chapterId", getTTSByChapterId);

export default router;
