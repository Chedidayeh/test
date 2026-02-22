import { Router } from "express";
import { ChildrenController } from "../controllers/children.controller";

const router = Router();

// Create child profile
router.post("/create-child-profile", (req, res) =>
  ChildrenController.createChild(req, res),
);

// Get all children with pagination
router.get("/children", (req, res) =>
  ChildrenController.getAllChildren(req, res),
);

// Get specific child by ID
router.get("/children/:id", (req, res) =>
  ChildrenController.getChildById(req, res),
);

// get children with parent ID
router.get("/children/parent/:parentId", (req, res) =>
  ChildrenController.getChildrenByParentId(req, res),
);

// Story progress endpoints
// Create new story progress record
router.post("/progress/:childId/stories/:storyId/start", (req, res) =>
  ChildrenController.startStoryProgress(req, res),
);


// Save checkpoint for a game session
router.post("/progress/checkpoint", (req, res) =>
  ChildrenController.saveCheckpoint(req, res),
);

// Submit challenge answer and record attempt with star rewards
router.post("/progress/challenge/submit", (req, res) =>
  ChildrenController.submitChallengeAnswer(req, res),
);

// Complete a story for a game session
router.post("/progress/:gameSessionId/complete", (req, res) =>
  ChildrenController.completeStory(req, res),
);

export default router;
