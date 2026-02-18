import { Router } from "express";
import { themeController } from "../controllers/theme.controller";

const router = Router();

// GET all themes
router.get("/", (req, res) => themeController.getThemes(req, res));

// GET single theme by ID
router.get("/:id", (req, res) => themeController.getThemeById(req, res));

export default router;
