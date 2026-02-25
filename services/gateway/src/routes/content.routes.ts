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
 * Age Groups Routes - CRUD Operations
 * GET /api/age-groups - fetch all age groups
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
 * Challenges Routes
 * GET /api/challenges - fetch all challenges
 * GET /api/challenges/:id - fetch single challenge
 */
router.use("/challenges", (req: Request, res: Response) => {
  forwardToContentService(req, res, `/api/challenges${req.path}`);
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