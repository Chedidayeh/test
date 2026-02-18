import { Router } from "express";
import { storyController } from "../controllers/story.controller";

const router = Router();

// GET all stories with pagination and filters
router.get("/", (req, res) => storyController.getStories(req, res));

// GET total stories count
router.get("/count", (req, res) => storyController.getStoriesCount(req, res));

// GET stories by world ID
router.get("/world/:worldId", (req, res) =>
  storyController.getStoriesByWorld(req, res)
);

// GET single story by ID
router.get("/:id", (req, res) => storyController.getStoryById(req, res));

export default router;
