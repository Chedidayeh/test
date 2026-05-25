import { Router } from "express";
import { ChildrenController } from "../controllers/children.controller";

const router = Router();

// Create child profile
router.post("/create-child-profile", (req, res) =>
  ChildrenController.createChild(req, res),
);

// Get children that have progress data in the last week (for weekly analytics)
router.get("/children/week", (req, res) =>
  ChildrenController.getWeekChildren(req, res),
);

// // Get all children with storytelling profiles for storytelling generation
// router.get("/children/storytelling-all", (req, res) =>
//   ChildrenController.getAllChildrenWithStorytelling(req, res),
// );

// Get all children with pagination
router.get("/children", (req, res) =>
  ChildrenController.getAllChildrenWithPagination(req, res),
);

// Get all children profiles with pagination
router.get("/children-profiles", (req, res) =>
  ChildrenController.getAllChildrenProfiles(req, res),
);

// Get children for push notifications
router.get("/push-notifications/children", (req, res) =>
  ChildrenController.getChildrenForPushNotifications(req, res),
);

// Get children statistics (activeChildren, totalStoriesCompleted, totalChallengesSolved)
router.get("/children/stats", (req, res) =>
  ChildrenController.getChildrenStats(req, res),
);

// Get engagement metrics for global statistics dashboard
router.get("/stats/engagement-metrics", (req, res) =>
  ChildrenController.getEngagementMetrics(req, res),
);

// Get reading time analytics for global statistics dashboard
router.get("/stats/reading-time", (req, res) =>
  ChildrenController.getReadingTimeAnalytics(req, res),
);

// Get peak usage hours for global statistics dashboard
router.get("/stats/peak-usage-hours", (req, res) =>
  ChildrenController.getPeakUsageHours(req, res),
);

// Get learning completion metrics for learning metrics dashboard
router.get("/stats/learning/completion", (req, res) =>
  ChildrenController.getLearningCompletionMetrics(req, res),
);

// Get challenge success metrics for learning metrics dashboard
router.get("/stats/learning/challenge-success", (req, res) =>
  ChildrenController.getChallengeSuccessMetrics(req, res),
);

// Get hint usage metrics for learning metrics dashboard
router.get("/stats/learning/hint-usage", (req, res) =>
  ChildrenController.getHintUsageMetrics(req, res),
);

// Get reading speed trends for learning metrics dashboard
router.get("/stats/learning/reading-speed", (req, res) =>
  ChildrenController.getReadingSpeedTrends(req, res),
);

// Get most failed challenges for learning metrics dashboard
router.get("/stats/learning/failed-challenges", (req, res) =>
  ChildrenController.getMostFailedChallenges(req, res),
);

// Get content performance metrics for content performance dashboard
router.get("/stats/content/performance", (req, res) =>
  ChildrenController.getContentPerformanceMetrics(req, res),
);

// Get specific child by ID
router.get("/children/:id", (req, res) =>
  ChildrenController.getChildById(req, res),
);

// get children with parent ID
router.get("/children/parent/:parentId", (req, res) =>
  ChildrenController.getChildrenByParentId(req, res),
);

// Get child profiles for a parent
router.get("/parent-data/:parentId/children", (req, res) =>
  ChildrenController.getChildProfilesByParent(req, res),
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

// Update child notification settings
router.patch("/children/:childId/notifications", (req, res) =>
  ChildrenController.updateNotificationSettings(req, res),
);

// Update child general settings (name, age group, favorite themes)
router.patch("/children/:childId/settings", (req, res) =>
  ChildrenController.updateChildGeneralSettings(req, res),
);

// Toggle weekly reports for child
router.patch("/children/:childId/weekly-reports", (req, res) =>
  ChildrenController.toggleWeeklyReports(req, res),
);

// Toggle storytelling for child
router.patch("/children/:childId/storytelling", (req, res) =>
  ChildrenController.toggleStorytelling(req, res),
);

// Delete child profile permanently
router.delete("/children/:childId", (req, res) =>
  ChildrenController.deleteChild(req, res),
);

export default router;
