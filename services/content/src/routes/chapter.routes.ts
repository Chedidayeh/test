import { Router } from "express";
import { chapterController } from "../controllers/chapter.controller";

const router = Router();

// GET all chapters
router.get("/", (req, res) => chapterController.getChapters(req, res));

// POST - create new chapter
router.post("/", (req, res) => chapterController.createChapter(req, res));

// GET chapters by story
router.get("/story/:storyId", (req, res) =>
  chapterController.getChaptersByStory(req, res)
);

// PUT - update chapter by ID
router.put("/:id", (req, res) => chapterController.updateChapter(req, res));

// DELETE - delete chapter by ID
router.delete("/:id", (req, res) => chapterController.deleteChapter(req, res));

// GET single chapter by ID
router.get("/:id", (req, res) => chapterController.getChapterById(req, res));

export default router;
