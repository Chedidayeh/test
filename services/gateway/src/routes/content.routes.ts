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
 * Roadmaps Routes
 * GET /api/roadmaps - fetch all roadmaps
 * GET /api/roadmaps/:id - fetch single roadmap
 */
router.use("/roadmaps", (req: Request, res: Response) => {
  forwardToContentService(req, res, `/api/roadmaps${req.path}`);
});

/**
 * Worlds Routes
 * GET /api/worlds - fetch all worlds
 * GET /api/worlds/:id - fetch single world
 */
router.use("/worlds", (req: Request, res: Response) => {
  forwardToContentService(req, res, `/api/worlds${req.path}`);
});

/**
 * Age Groups Routes
 * GET /api/age-groups - fetch all age groups
 * GET /api/age-groups/:id - fetch single age group
 */
router.use("/age-groups", (req: Request, res: Response) => {
  forwardToContentService(req, res, `/api/age-groups${req.path}`);
});

/**
 * Themes Routes
 * GET /api/themes - fetch all themes
 * GET /api/themes/:id - fetch single theme
 */
router.use("/themes", (req: Request, res: Response) => {
  forwardToContentService(req, res, `/api/themes${req.path}`);
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