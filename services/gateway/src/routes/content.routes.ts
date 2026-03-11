import { Router, Request, Response } from "express";
import axios from "axios";
import { logger } from "../utils/logger";
import { createStoryWithChapters, forwardToContentService } from "../helpers/content.helpers";
import { API_BASE_URL_V1 } from "@shared/src/types";

const router = Router();


/**
 * Stories Routes
 * GET /api/v1/stories - fetch all stories
 * GET /api/v1/stories/:id - fetch single story
 */
router.use("/stories/batch/create", (req: Request, res: Response) => {
  logger.info("Received request to create story with chapters")
  createStoryWithChapters(req, res);
});
router.use("/stories", (req: Request, res: Response) => {
  logger.info("Received request to forward story request")
  forwardToContentService(req, res, `${API_BASE_URL_V1}/stories${req.path}`);
});



/**
 * Age Groups Routes - CRUD Operations
 * GET /api/v1/age-groups - fetch all active age groups
 * GET /api/v1/age-groups/admin/all - fetch all age groups (including inactive) - admin only
 * GET /api/v1/age-groups/:id - fetch single age group
 * POST /api/v1/age-groups - create new age group
 * PUT /api/v1/age-groups/:id - update age group
 * DELETE /api/v1/age-groups/:id - delete age group
 */
router.use("/age-groups", (req: Request, res: Response) => {
  forwardToContentService(req, res, `${API_BASE_URL_V1}/age-groups${req.path}`);
});

/**
 * Themes Routes - CRUD Operations
 * GET /api/v1/themes - fetch all themes
 * GET /api/v1/themes/:id - fetch single theme
 * POST /api/v1/themes - create new theme
 * PUT /api/v1/themes/:id - update theme
 * DELETE /api/v1/themes/:id - delete theme
 */
router.use("/themes", (req: Request, res: Response) => {
  forwardToContentService(req, res, `${API_BASE_URL_V1}/themes${req.path}`);
});

/**
 * Roadmaps Routes - CRUD Operations
 * GET /api/v1/roadmaps - fetch all roadmaps
 * GET /api/v1/roadmaps/:id - fetch single roadmap
 * GET /api/v1/roadmaps/age-group/:ageGroupId - fetch roadmaps by age group
 * POST /api/v1/roadmaps - create new roadmap
 * PUT /api/v1/roadmaps/:id - update roadmap
 * DELETE /api/v1/roadmaps/:id - delete roadmap
 */
router.use("/roadmaps", (req: Request, res: Response) => {
  forwardToContentService(req, res, `${API_BASE_URL_V1}/roadmaps${req.path}`);
});

/**
 * Worlds Routes - CRUD Operations
 * GET /api/v1/worlds - fetch all worlds
 * GET /api/v1/worlds/:id - fetch single world
 * GET /api/v1/worlds/roadmap/:roadmapId - fetch worlds by roadmap
 * POST /api/v1/worlds - create new world
 * PUT /api/v1/worlds/:id - update world
 * DELETE /api/v1/worlds/:id - delete world
 */
router.use("/worlds", (req: Request, res: Response) => {
  forwardToContentService(req, res, `${API_BASE_URL_V1}/worlds${req.path}`);
});



/**
 * Levels Routes
 * GET /api/v1/levels - fetch all levels
 * GET /api/v1/levels/:id - fetch single level
 * GET /api/v1/levels/number/:levelNumber - fetch level by number
 */
router.use("/levels", (req: Request, res: Response) => {
  forwardToContentService(req, res, `${API_BASE_URL_V1}/levels${req.path}`);
});

/**
 * Badges Routes
 * GET /api/v1/badges - fetch all badges
 * GET /api/v1/badges/:id - fetch single badge
 * GET /api/v1/badges/level/:levelId - fetch badge by level
 */
router.use("/badges", (req: Request, res: Response) => {
  forwardToContentService(req, res, `${API_BASE_URL_V1}/badges${req.path}`);
});

export default router;