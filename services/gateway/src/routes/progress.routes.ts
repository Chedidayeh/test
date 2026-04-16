import { Router, Request, Response } from "express";
import {
  forwardAssignBadgeToChild,
  forwardCompleteStory,
  forwardDeleteChild,
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
  forwardAllocateRoadmapToChild,
  forwardGetDashboardStats,
  forwardUpdateNotificationSettings,
  forwardUpdateChildGeneralSettings,
  forwardToggleWeeklyReports,
  forwardToggleStorytelling,
  forwardGetChildProfilesByParent,
} from "../helpers/progress.helpers";
import { API_BASE_URL_V1 } from "@shared/src/types";

const router = Router();

// Get admin dashboard statistics
router.get("/stats/admin-dashboard", (req: Request, res: Response) => {
  forwardGetDashboardStats(req, res);
});

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

// Allocate roadmap to child (must be before the generic /children middleware)
router.post("/children/:childId/allocate-roadmap", (req: Request, res: Response) => {
  forwardAllocateRoadmapToChild(req, res);
});

// Update child notification settings (must be before the generic /children middleware)
router.patch("/children/:childId/notifications", (req: Request, res: Response) => {
  forwardUpdateNotificationSettings(
    req,
    res,
    `${API_BASE_URL_V1}/children/${req.params.childId}/notifications`,
  );
});

// Update child general settings (must be before the generic /children middleware)
router.patch("/children/:childId/settings", (req: Request, res: Response) => {
  forwardUpdateChildGeneralSettings(
    req,
    res,
    `${API_BASE_URL_V1}/children/${req.params.childId}/settings`,
  );
});

// Toggle weekly reports for child (must be before the generic /children middleware)
router.patch("/children/:childId/weekly-reports", (req: Request, res: Response) => {
  forwardToggleWeeklyReports(req, res, `${API_BASE_URL_V1}/children/${req.params.childId}/weekly-reports`);
});

// Toggle storytelling for child (must be before the generic /children middleware)
router.patch("/children/:childId/storytelling", (req: Request, res: Response) => {
  forwardToggleStorytelling(req, res, `${API_BASE_URL_V1}/children/${req.params.childId}/storytelling`);
});

// Delete child profile (must be before the generic /children middleware)
router.delete("/children/:childId", (req: Request, res: Response) => {
  forwardDeleteChild(
    req,
    res,
    `${API_BASE_URL_V1}/children/${req.params.childId}`,
  );
});

// Generic children middleware (must be after specific routes)
router.use("/children", (req: Request, res: Response) => {
  forwardToProgressService(req, res, `${API_BASE_URL_V1}/children${req.path}`);
});

// Get child profiles for a parent (must be before the generic /parent-data route)
router.get("/parent-data/:parentId/children", (req: Request, res: Response) => {
  forwardGetChildProfilesByParent(req, res);
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
