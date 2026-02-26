import { Router, Request, Response } from "express";
import axios from "axios";
import { logger } from "../utils/logger";
import { forwardToContentService } from "../helpers/content.helpers";

const router = Router();


/**
 * Stories Routes
 * GET /api/stories - fetch all stories
 * GET /api/stories/:id - fetch single story
 */
router.use("/stories", (req: Request, res: Response) => {
  forwardToContentService(req, res, `/api/stories${req.path}`);
});

/**
 * Chapters Routes - CRUD Operations
 * GET /api/chapters - fetch all chapters
 * GET /api/chapters/:id - fetch single chapter
 * GET /api/chapters/story/:storyId - fetch chapters by story
 * POST /api/chapters - create new chapter
 * PUT /api/chapters/:id - update chapter
 * DELETE /api/chapters/:id - delete chapter
 */
router.use("/chapters", (req: Request, res: Response) => {
  forwardToContentService(req, res, `/api/chapters${req.path}`);
});

/**
 * Challenges Routes
 * GET /api/challenges - fetch all challenges
 * GET /api/challenges/:id - fetch single challenge
 * GET /api/challenges/chapter/:chapterId - fetch challenges by chapter
 * POST /api/challenges - create new challenge
 * PUT /api/challenges/:id - update challenge
 * DELETE /api/challenges/:id - delete challenge
 */
router.use("/challenges", (req: Request, res: Response) => {
  forwardToContentService(req, res, `/api/challenges${req.path}`);
});

/**
 * Answers Routes - CRUD Operations
 * GET /api/answers - fetch all answers
 * GET /api/answers/:id - fetch single answer
 * GET /api/answers/challenge/:challengeId - fetch answers by challenge
 * POST /api/answers - create new answer
 * PUT /api/answers/:id - update answer
 * DELETE /api/answers/:id - delete answer
 */
router.use("/answers", (req: Request, res: Response) => {
  forwardToContentService(req, res, `/api/answers${req.path}`);
});

/**
 * Age Groups Routes - CRUD Operations
 * GET /api/age-groups - fetch all active age groups
 * GET /api/age-groups/admin/all - fetch all age groups (including inactive) - admin only
 * GET /api/age-groups/:id - fetch single age group
 * POST /api/age-groups - create new age group
 * PUT /api/age-groups/:id - update age group
 * DELETE /api/age-groups/:id - delete age group
 */
router.use("/age-groups", (req: Request, res: Response) => {
  forwardToContentService(req, res, `/api/age-groups${req.path}`);
});

/**
 * Themes Routes - CRUD Operations
 * GET /api/themes - fetch all themes
 * GET /api/themes/:id - fetch single theme
 * POST /api/themes - create new theme
 * PUT /api/themes/:id - update theme
 * DELETE /api/themes/:id - delete theme
 */
router.use("/themes", (req: Request, res: Response) => {
  forwardToContentService(req, res, `/api/themes${req.path}`);
});

/**
 * Roadmaps Routes - CRUD Operations
 * GET /api/roadmaps - fetch all roadmaps
 * GET /api/roadmaps/:id - fetch single roadmap
 * GET /api/roadmaps/age-group/:ageGroupId - fetch roadmaps by age group
 * POST /api/roadmaps - create new roadmap
 * PUT /api/roadmaps/:id - update roadmap
 * DELETE /api/roadmaps/:id - delete roadmap
 */
router.use("/roadmaps", (req: Request, res: Response) => {
  forwardToContentService(req, res, `/api/roadmaps${req.path}`);
});

/**
 * Worlds Routes - CRUD Operations
 * GET /api/worlds - fetch all worlds
 * GET /api/worlds/:id - fetch single world
 * GET /api/worlds/roadmap/:roadmapId - fetch worlds by roadmap
 * POST /api/worlds - create new world
 * PUT /api/worlds/:id - update world
 * DELETE /api/worlds/:id - delete world
 */
router.use("/worlds", (req: Request, res: Response) => {
  forwardToContentService(req, res, `/api/worlds${req.path}`);
});



/**
 * Levels Routes
 * GET /api/levels - fetch all levels
 * GET /api/levels/:id - fetch single level
 * GET /api/levels/number/:levelNumber - fetch level by number
 */
router.use("/levels", (req: Request, res: Response) => {
  forwardToContentService(req, res, `/api/levels${req.path}`);
});

/**
 * Badges Routes
 * GET /api/badges - fetch all badges
 * GET /api/badges/:id - fetch single badge
 * GET /api/badges/level/:levelId - fetch badge by level
 */
router.use("/badges", (req: Request, res: Response) => {
  forwardToContentService(req, res, `/api/badges${req.path}`);
});

export default router;