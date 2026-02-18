import { Router } from "express";
import { roadmapController } from "../controllers/roadmap.controller";

const router = Router();

// GET all roadmaps
router.get("/", (req, res) => roadmapController.getRoadmaps(req, res));

// GET roadmaps by age group
router.get("/age-group/:ageGroupId", (req, res) =>
  roadmapController.getRoadmapsByAgeGroup(req, res)
);

// GET single roadmap by ID
router.get("/:id", (req, res) => roadmapController.getRoadmapById(req, res));

export default router;
