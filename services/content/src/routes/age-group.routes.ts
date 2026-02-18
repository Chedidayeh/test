import { Router } from "express";
import { ageGroupController } from "../controllers/age-group.controller";

const router = Router();

// GET all age groups
router.get("/", (req, res) => ageGroupController.getAgeGroups(req, res));

// GET single age group by ID
router.get("/:id", (req, res) => ageGroupController.getAgeGroupById(req, res));

export default router;
