import { Router } from "express";
import { storyController } from "../controllers/story.controller";

const router = Router();

// GET all stories with pagination and filters, or by IDs if ?ids=id1,id2,id3
router.get("/", (req, res) => {
  if (req.query.ids) {
    storyController.getStoriesByIds(req, res);
  } else {
    storyController.getStories(req, res);
  }
});

// POST - get multiple stories by IDs in request body
router.post("/bulk", (req, res) =>
  storyController.getStoriesByIdsBody(req, res),
);

// POST - create story with chapters atomically
router.post("/batch/create", (req, res) =>
  storyController.createStoryWithChapters(req, res),
);

// POST - create storytelling story from AI Service generated story
router.post("/create-storytelling", (req, res) =>
  storyController.createStorytellingStory(req, res),
);

// GET stories by world ID
router.get("/world/:worldId", (req, res) =>
  storyController.getStoriesByWorld(req, res),
);

// PUT - edit story with chapters atomically
router.put("/:id/batch/edit", (req, res) =>
  storyController.editStoryWithChapters(req, res),
);

// POST - execute translations for a story asynchronously
router.post("/:id/translations/execute", (req, res) =>
  storyController.executeStoryTranslations(req, res),
);

// DELETE story by ID
router.delete("/:id", (req, res) => storyController.deleteStory(req, res));

// GET single story by ID
router.get("/:id", (req, res) => storyController.getStoryById(req, res));

export default router;
