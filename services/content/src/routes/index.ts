import { Router } from "express";
import storyRoutes from "./story.routes";
import roadmapRoutes from "./roadmap.routes";
import worldRoutes from "./world.routes";
import ageGroupRoutes from "./age-group.routes";
import themeRoutes from "./theme.routes";
import levelRoutes from "./level.routes";
import badgeRoutes from "./badge.routes";
import { ageGroupController } from "src/controllers/age-group.controller";

const router = Router();
router.get("/stats/content-overview", (req, res) =>
  ageGroupController.getContentOverviewStats(req, res),
);

// Mount all routes under /api prefix
router.use("/stories", storyRoutes);
router.use("/roadmaps", roadmapRoutes);
router.use("/worlds", worldRoutes);
router.use("/age-groups", ageGroupRoutes);
router.use("/themes", themeRoutes);
router.use("/levels", levelRoutes);
router.use("/badges", badgeRoutes);

export default router;
