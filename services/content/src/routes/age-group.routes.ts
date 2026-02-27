import { Router } from "express";
import { ageGroupController } from "../controllers/age-group.controller";

const router = Router();

// GET all age groups (only active ones)
router.get("/", (req, res) => ageGroupController.getAgeGroups(req, res));

// GET all age groups for admin (including inactive ones)
router.get("/admin/all", (req, res) => ageGroupController.getAgeGroupsForAdmin(req, res));

// POST - create new age group
router.post("/", (req, res) => ageGroupController.createAgeGroup(req, res));

// GET validate readiness for age group (before the /:id route to avoid conflicts)
router.get("/:id/validate-readiness", (req, res) => ageGroupController.validateAgeGroupReadiness(req, res));

// PUT - update age group by ID
router.put("/:id", (req, res) => ageGroupController.updateAgeGroup(req, res));

// DELETE - delete age group by ID
router.delete("/:id", (req, res) => ageGroupController.deleteAgeGroup(req, res));

// GET single age group by ID
router.get("/:id", (req, res) => ageGroupController.getAgeGroupById(req, res));

export default router;
