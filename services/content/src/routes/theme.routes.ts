import { Router } from "express";
import { themeController } from "../controllers/theme.controller";

const router = Router();

// GET all themes
router.get("/", (req, res) => themeController.getThemes(req, res));

// POST - create new theme
router.post("/", (req, res) => themeController.createTheme(req, res));

// PUT - update theme by ID
router.put("/:id", (req, res) => themeController.updateTheme(req, res));

// DELETE - delete theme by ID
router.delete("/:id", (req, res) => themeController.deleteTheme(req, res));

// GET single theme by ID
router.get("/:id", (req, res) => themeController.getThemeById(req, res));

export default router;
