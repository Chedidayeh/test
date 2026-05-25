import { Router } from "express";
import { challengeController } from "../controllers/challenge.controller";

const router = Router();

// GET challenges by chapter ID
router.get("/chapter/:chapterId", (req, res) =>
  challengeController.getChallengesByChapterId(req, res),
);

// POST - get multiple challenges by IDs in request body (batch fetch)
// Used for enriching analytics with challenge type information
router.post("/bulk", (req, res) =>
  challengeController.getChallengesByIdsBody(req, res),
);

// GET single challenge by ID
router.get("/:id", (req, res) =>
  challengeController.getChallengeById(req, res),
);

export default router;
