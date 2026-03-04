import { Router } from "express";
import { badgeController } from "../controllers/badge.controller";

const router = Router();

// GET all badges with pagination
router.get("/", (req, res) => badgeController.getAllBadges(req, res));

// POST - create a new badge
router.post("/", (req, res) => badgeController.createBadge(req, res));

// GET badge by level number
router.get("/level/:levelNumber", (req, res) =>
  badgeController.getBadgeByLevelNumber(req, res)
);

// GET single badge by ID
router.get("/:id", (req, res) => badgeController.getBadgeById(req, res));

// PUT - update badge by ID
router.put("/:id", (req, res) => badgeController.updateBadge(req, res));

// PUT - update badge translations (manual edits)
router.put("/:id/translations", (req, res) =>
  // Delegate to controller method that handles updating translations
  badgeController.updateBadgeTranslations(req, res),
);

// DELETE badge by ID
router.delete("/:id", (req, res) => badgeController.deleteBadge(req, res));

export default router;
