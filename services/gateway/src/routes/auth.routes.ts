import { Router, Request, Response } from "express";
import axios from "axios";
import { logger } from "../utils/logger";
import { ApiResponse, User, Child, API_BASE_URL_V1 } from "@shared/src/types";

const router = Router();

const AUTH_SERVICE_URL =
  process.env.AUTH_SERVICE_URL || "http://localhost:3002";

const PROGRESS_SERVICE_URL =
  process.env.PROGRESS_SERVICE_URL || "http://localhost:3003";

/**
 * Get parent by ID
 * Maps /parents/:parentId to auth service /parent/:id
 */
router.get("/parent/:parentId", async (req: Request, res: Response<ApiResponse<User>>) => {
  try {
    const { parentId } = req.params;
    const authUrl = `${AUTH_SERVICE_URL}${API_BASE_URL_V1}/parent/${parentId}`;

    logger.debug("Forwarding get parent by ID request to service", {
      method: req.method,
      parentId,
      targetUrl: authUrl,
    });

    const response = await axios({
      method: req.method,
      url: authUrl,
      headers: {
        "Content-Type": "application/json",
      },
      validateStatus: () => true,
    });

    res.status(response.status).json(response.data as ApiResponse<User>);
  } catch (error) {
    logger.error("Auth service forward error", {
      error: String(error),
      path: req.path,
      parentId: req.params.parentId,
    });
    res.status(503).json({
      success: false,
      error: {
        code: "SERVICE_UNAVAILABLE",
        message: "Auth service unavailable",
      },
      timestamp: new Date(),
    } as ApiResponse<User>);
  }
});

/**
 * Create child profile
 * 1. Call auth service to create child and get child ID
 * 2. Call progress service to create child profile with the child ID
 */
router.post("/children", async (req: Request, res: Response<ApiResponse<Child>>) => {
  try {
    const authUrl = `${AUTH_SERVICE_URL}${API_BASE_URL_V1}/create-child-profile`;

    logger.debug("Forwarding create child profile request to auth service", {
      method: req.method,
      targetUrl: authUrl,
      payload: { name: req.body.name, parentEmail: req.body.parentEmail },
    });

    // Step 1: Call auth service to create child
    const authResponse = await axios({
      method: "POST",
      url: authUrl,
      data: req.body,
      headers: {
        "Content-Type": "application/json",
      },
      validateStatus: () => true,
    });

    // Check if auth service call was successful
    if (!authResponse.data.success || authResponse.status !== 201) {
      logger.warn("Auth service failed to create child", {
        status: authResponse.status,
        error: authResponse.data.error,
      });
      res.status(authResponse.status).json(authResponse.data as ApiResponse<Child>);
      return;
    }

    // Extract child ID from auth response
    const childId = authResponse.data.data?.id;
    if (!childId) {
      logger.error("Child ID not found in auth service response", {
        response: authResponse.data,
      });
      res.status(500).json({
        success: false,
        error: {
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to extract child ID from auth response",
        },
        timestamp: new Date(),
      } as ApiResponse<Child>);
      return;
    }

    // Step 2: Call progress service with child ID and original payload
    const progressUrl = `${PROGRESS_SERVICE_URL}${API_BASE_URL_V1}/create-child-profile`;
    // Extract badgeId from the original request (if provided) and include it
    const { badgeId } = req.body || {};

    const progressPayload = {
      ...req.body,
      childId,
      badgeId,
    };

    logger.debug("Forwarding create child profile request to progress service", {
      method: req.method,
      targetUrl: progressUrl,
      payload: { name: progressPayload.name, parentEmail: progressPayload.parentEmail, childId, badgeId },
    });

    const progressResponse = await axios({
      method: "POST",
      url: progressUrl,
      data: progressPayload,
      headers: {
        "Content-Type": "application/json",
      },
      validateStatus: () => true,
    });

    // Return progress service response
    res.status(progressResponse.status).json(progressResponse.data as ApiResponse<Child>);
  } catch (error) {
    logger.error("Child profile creation error", {
      error: String(error),
      path: req.path,
    });
    res.status(503).json({
      success: false,
      error: {
        code: "SERVICE_UNAVAILABLE",
        message: "Service unavailable",
      },
      timestamp: new Date(),
    } as ApiResponse<Child>);
  }
});

/**
 * Auth Service Routes (Public - no JWT validation needed)
 * Forwards all auth requests directly to the auth service
 */
router.use("/", async (req: Request, res: Response) => {
  try {
    const authPath = req.path; // e.g., "/register", "/login"
    const authUrl = `${AUTH_SERVICE_URL}${API_BASE_URL_V1}${authPath}`;

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
    res.status(503).json({
      success: false,
      error: {
        code: "SERVICE_UNAVAILABLE",
        message: "Auth service unavailable",
      },
      timestamp: new Date(),
    });
  }
});

export default router;
