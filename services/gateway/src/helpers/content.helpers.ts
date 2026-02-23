
import { Request, Response } from "express";

import axios from "axios";
import { logger } from "../utils/logger";

const CONTENT_SERVICE_URL = process.env.CONTENT_SERVICE_URL || "http://localhost:3003";

/**
 * Helper function to forward requests to the content service
 */
export async function forwardToContentService(
  req: Request,
  res: Response,
  basePath: string
): Promise<void> {
  try {
    const contentUrl = `${CONTENT_SERVICE_URL}${basePath}`;

    logger.debug("Forwarding content request to service", {
      method: req.method,
      path: req.path,
      targetUrl: contentUrl,
      queryParams: req.query,
    });

    const response = await axios({
      method: req.method,
      url: contentUrl,
      params: req.query,
      data: req.body,
      headers: {
        "Content-Type": "application/json",
      },
      validateStatus: () => true,
    });

    res.status(response.status).json(response.data);
  } catch (error) {
    logger.error("Content service forward error", {
      error: String(error),
      path: req.path,
    });
    res.status(503).json({ error: "Content service unavailable" });
  }
}
