import { Router, Request, Response } from "express";
import axios from "axios";
import { logger } from "../utils/logger";

const router = Router();

const AUTH_SERVICE_URL =
  process.env.AUTH_SERVICE_URL || "http://localhost:3002";

/**
 * Auth Service Routes (Public - no JWT validation needed)
 * Forwards all auth requests directly to the auth service
 */
router.use("/", async (req: Request, res: Response) => {
  try {
    const authPath = req.path; // e.g., "/register", "/login"
    const authUrl = `${AUTH_SERVICE_URL}${authPath}`;

    logger.debug("Forwarding auth request to service", {
      method: req.method,
      path: authPath,
      targetUrl: authUrl,
      queryParams: req.query,
    });

    const response = await axios({
      method: req.method,
      url: authUrl,
      params: req.query, // ← Forward query parameters (limit, offset, etc.)
      data: req.body,
      headers: {
        "Content-Type": "application/json",
      },
      validateStatus: () => true, // Don't throw on any status code
    });

    // Forward the response from auth service back to client
    res.status(response.status).json(response.data);
  } catch (error) {
    logger.error("Auth service forward error", {
      error: String(error),
      path: req.path,
    });
    res.status(503).json({ error: "Auth service unavailable" });
  }
});

export default router;
