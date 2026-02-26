import { Router } from "express";
import { storyController } from "../controllers/story.controller";

const router = Router();

// GET all stories with pagination and filters
router.get("/", (req, res) => storyController.getStories(req, res));

// POST - create new story
router.post("/", (req, res) => storyController.createStory(req, res));

// POST - create story with chapters atomically
router.post("/batch/create", (req, res) =>
  storyController.createStoryWithChapters(req, res)
);

// GET total stories count
router.get("/count", (req, res) => storyController.getStoriesCount(req, res));

// GET stories by world ID
router.get("/world/:worldId", (req, res) =>
  storyController.getStoriesByWorld(req, res)
);

// PUT - edit story with chapters atomically
router.put("/:id/batch/edit", (req, res) =>
  storyController.editStoryWithChapters(req, res)
);

// PUT - update story by ID
router.put("/:id", (req, res) => storyController.updateStory(req, res));

// GET single story by ID
router.get("/:id", (req, res) => storyController.getStoryById(req, res));

export default router;
