import { Router } from "express";
import { ChildrenController } from "../controllers/children.controller";

const router = Router();

// Create child profile
router.post("/create-child-profile", (req, res) =>
  ChildrenController.createChild(req, res),
);

// Get all children with pagination
router.get("/children/all", (req, res) =>
  ChildrenController.getAllChildren(req, res),
);

// Get all children with pagination
router.get("/children", (req, res) =>
  ChildrenController.getAllChildrenWithPagination(req, res),
);

// Get children statistics (activeChildren, totalStoriesCompleted, totalChallengesSolved)
router.get("/children/stats", (req, res) =>
  ChildrenController.getChildrenStats(req, res),
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

// Get child progress for a specific story
router.get("/progress/:childId/stories/:storyId", (req, res) =>
  ChildrenController.getChildProgress(req, res),
);

// Save checkpoint for a game session
router.post("/progress/checkpoint", (req, res) =>
  ChildrenController.saveCheckpoint(req, res),
);

// create new checkpoint from a game session
router.post("/progress/create-new-checkpoint/:gameSessionId", (req, res) =>
  ChildrenController.createNewCheckpoint(req, res),
);

// Pause a game session
router.post("/progress/pause/:gameSessionId", (req, res) =>
  ChildrenController.pauseCheckpoint(req, res),
);


// Submit challenge answer and record attempt with star rewards
router.post("/progress/challenge/submit", (req, res) =>
  ChildrenController.submitChallengeAnswer(req, res),
);

// Complete a story for a game session
router.post("/progress/:gameSessionId/complete", (req, res) =>
  ChildrenController.completeStory(req, res),
);

// Update child's current level
router.patch("/children/:childId/level", (req, res) =>
  ChildrenController.updateChildLevel(req, res),
);

// Assign badge to child
router.post("/children/:childId/badges", (req, res) =>
  ChildrenController.assignBadgeToChild(req, res),
);

// Allocate roadmap to child
router.post("/children/:childId/allocate-roadmap", (req, res) =>
  ChildrenController.allocateRoadmapToChild(req, res),
);

export default router;
