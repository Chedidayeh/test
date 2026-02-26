import { Router } from "express";
import storyRoutes from "./story.routes";
import chapterRoutes from "./chapter.routes";
import answerRoutes from "./answer.routes";
import roadmapRoutes from "./roadmap.routes";
import worldRoutes from "./world.routes";
import ageGroupRoutes from "./age-group.routes";
import themeRoutes from "./theme.routes";
import challengeRoutes from "./challenge.routes";
import levelRoutes from "./level.routes";
import badgeRoutes from "./badge.routes";

const router = Router();

// Mount all routes under /api prefix
router.use("/stories", storyRoutes);
router.use("/chapters", chapterRoutes);
router.use("/answers", answerRoutes);
router.use("/roadmaps", roadmapRoutes);
router.use("/worlds", worldRoutes);
router.use("/age-groups", ageGroupRoutes);
router.use("/themes", themeRoutes);
router.use("/challenges", challengeRoutes);
router.use("/levels", levelRoutes);
router.use("/badges", badgeRoutes);

export default router;