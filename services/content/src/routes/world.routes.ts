import { Router } from "express";
import { worldController } from "../controllers/world.controller";

const router = Router();

// GET all worlds
router.get("/", (req, res) => worldController.getWorlds(req, res));

// GET worlds by roadmap
router.get("/roadmap/:roadmapId", (req, res) =>
  worldController.getWorldsByRoadmap(req, res)
);

// GET single world by ID
router.get("/:id", (req, res) => worldController.getWorldById(req, res));

export default router;
