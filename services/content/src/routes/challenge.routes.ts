import { Router } from "express";
import { challengeController } from "../controllers/challenge.controller";

const router = Router();

// GET challenges with pagination and filters
router.get("/", (req, res) => challengeController.getChallenges(req, res));

// POST - create new challenge
router.post("/", (req, res) => challengeController.createChallenge(req, res));

// GET challenges by chapter
router.get("/chapter/:chapterId", (req, res) =>
  challengeController.getChallengesByChapter(req, res)
);

// PUT - update challenge by ID
router.put("/:id", (req, res) => challengeController.updateChallenge(req, res));

// GET single challenge by ID
router.get("/:id", (req, res) => challengeController.getChallengeById(req, res));

export default router;
