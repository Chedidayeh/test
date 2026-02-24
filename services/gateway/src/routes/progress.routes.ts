import { Router, Request, Response } from "express";
import {
  forwardAssignBadgeToChild,
  forwardCompleteStory,
  forwardGetChildById,
  forwardGetChildProgress,
  forwardParentWithProfiles,
  forwardSaveCheckpoint,
  forwardStartStory,
  forwardSubmitChallengeAnswer,
  forwardToProgressService,
  forwardUpdateChildLevel,
  forwardCreateNewCheckpoint,
  forwardPauseGameSession,
  forwardCalculateSessionTime,
  forwardAggregateSessionTime,
  forwardAggregateProgressTime,
  forwardGetSessionAnalytics,
} from "../helpers/progress.helpers";

const router = Router();

// Get specific child by ID (must be before the generic /children middleware)
router.get("/children/:id", (req: Request, res: Response) => {
  forwardGetChildById(req, res);
});

// Update child's current level (must be before the generic /children middleware)
router.patch("/children/:childId/level", (req: Request, res: Response) => {
  forwardUpdateChildLevel(req, res);
});

// Assign badge to child (must be before the generic /children middleware)
router.post("/children/:childId/badges", (req: Request, res: Response) => {
  forwardAssignBadgeToChild(req, res);
});

// Generic children middleware (must be after specific routes)
router.use("/children", (req: Request, res: Response) => {
  forwardToProgressService(req, res, `/api/children${req.path}`);
});

// Get parent with child profiles
router.get("/parent-data/:parentId", (req: Request, res: Response) => {
  forwardParentWithProfiles(req, res);
});

// Story reading
router.post(
  "/progress/:childId/stories/:storyId/start",
  (req: Request, res: Response) => {
    forwardStartStory(req, res);
  },
);

// Save checkpoint for a game session
router.post("/progress/checkpoint", (req: Request, res: Response) => {
  forwardSaveCheckpoint(req, res);
});

// Resume from a checkpoint
router.post("/progress/create-new-checkpoint/:gameSessionId", (req: Request, res: Response) => {
  forwardCreateNewCheckpoint(req, res);
});

// Pause a game session
router.post("/progress/pause/:gameSessionId", (req: Request, res: Response) => {
  forwardPauseGameSession(req, res);
});

// Calculate total active time spent in a game session
router.get("/progress/:gameSessionId/time", (req: Request, res: Response) => {
  forwardCalculateSessionTime(req, res);
});

// Aggregate and store total time spent in a game session
router.post(
  "/progress/:gameSessionId/aggregate-time",
  (req: Request, res: Response) => {
    forwardAggregateSessionTime(req, res);
  },
);

// Aggregate and sync progress total time from game session
router.post(
  "/progress/:progressId/aggregate-progress-time",
  (req: Request, res: Response) => {
    forwardAggregateProgressTime(req, res);
  },
);

// Get detailed time analytics for a game session
router.get(
  "/progress/:gameSessionId/analytics",
  (req: Request, res: Response) => {
    forwardGetSessionAnalytics(req, res);
  },
);

// Submit challenge answer and record attempt with star rewards
router.post("/progress/challenge/submit", (req: Request, res: Response) => {
  forwardSubmitChallengeAnswer(req, res);
});

// Complete a story for a game session
router.post(
  "/progress/:gameSessionId/complete",
  (req: Request, res: Response) => {
    forwardCompleteStory(req, res);
  },
);

// Get child progress for a specific story
router.get(
  "/progress/:childId/stories/:storyId",
  (req: Request, res: Response) => {
    forwardGetChildProgress(req, res);
  },
);

export default router;
