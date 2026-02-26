import { Router } from "express";
import { answerController } from "../controllers/answer.controller";

const router = Router();

// GET all answers
router.get("/", (req, res) => answerController.getAnswers(req, res));

// POST - create new answer
router.post("/", (req, res) => answerController.createAnswer(req, res));

// GET answers by challenge
router.get("/challenge/:challengeId", (req, res) =>
  answerController.getAnswersByChallenge(req, res)
);

// PUT - update answer by ID
router.put("/:id", (req, res) => answerController.updateAnswer(req, res));

// DELETE - delete answer by ID
router.delete("/:id", (req, res) => answerController.deleteAnswer(req, res));

// GET single answer by ID
router.get("/:id", (req, res) => answerController.getAnswerById(req, res));

export default router;
