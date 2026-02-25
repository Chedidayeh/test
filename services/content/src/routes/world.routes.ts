import { Router } from "express";
import { worldController } from "../controllers/world.controller";

const router = Router();

// GET all worlds
router.get("/", (req, res) => worldController.getWorlds(req, res));

// POST - create new world
router.post("/", (req, res) => worldController.createWorld(req, res));

// GET worlds by roadmap
router.get("/roadmap/:roadmapId", (req, res) =>
  worldController.getWorldsByRoadmap(req, res)
);

// PUT - update world by ID
router.put("/:id", (req, res) => worldController.updateWorld(req, res));

// DELETE - delete world by ID
router.delete("/:id", (req, res) => worldController.deleteWorld(req, res));

// GET single world by ID
router.get("/:id", (req, res) => worldController.getWorldById(req, res));

export default router;
