import { Router } from "express";
import { roadmapController } from "../controllers/roadmap.controller";

const router = Router();

// GET all roadmaps
router.get("/", (req, res) => roadmapController.getRoadmaps(req, res));

// POST - create new roadmap
router.post("/", (req, res) => roadmapController.createRoadmap(req, res));

// GET roadmaps by age group
router.get("/age-group/:ageGroupId", (req, res) =>
  roadmapController.getRoadmapsByAgeGroup(req, res)
);

// PUT - update roadmap by ID
router.put("/:id", (req, res) => roadmapController.updateRoadmap(req, res));

// DELETE - delete roadmap by ID
router.delete("/:id", (req, res) => roadmapController.deleteRoadmap(req, res));

// GET single roadmap by ID
router.get("/:id", (req, res) => roadmapController.getRoadmapById(req, res));

export default router;
