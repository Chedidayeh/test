import { Router } from "express";
import { challengeController } from "../controllers/challenge.controller";

const router = Router();

// GET challenges with pagination and filters
router.get("/", (req, res) => challengeController.getChallenges(req, res));

// GET challenges by chapter
router.get("/chapter/:chapterId", (req, res) =>
  challengeController.getChallengesByChapter(req, res)
);

// GET single challenge by ID
router.get("/:id", (req, res) => challengeController.getChallengeById(req, res));

export default router;
