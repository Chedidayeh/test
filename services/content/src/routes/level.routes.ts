import { Router } from "express";
import { levelController } from "../controllers/level.controller";

const router = Router();

// GET all levels with pagination
router.get("/", (req, res) => levelController.getAllLevels(req, res));

// POST - create a new level
router.post("/", (req, res) => levelController.createLevel(req, res));

// GET level by level number
router.get("/number/:levelNumber", (req, res) =>
  levelController.getLevelByNumber(req, res)
);

// GET single level by ID
router.get("/:id", (req, res) => levelController.getLevelById(req, res));

// PUT - update level by ID
router.put("/:id", (req, res) => levelController.updateLevel(req, res));

// DELETE level by ID
router.delete("/:id", (req, res) => levelController.deleteLevel(req, res));

export default router;
