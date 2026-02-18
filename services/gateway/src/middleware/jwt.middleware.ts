import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { logger } from "../utils/logger";
import { authServiceClient, VerifyTokenResponse } from "../utils/auth-service";
import { requiresAuth } from "../config/routes.config";

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: "CHILD" | "PARENT" | "ADMIN";
  };
  token?: string;
}

/**
 * JWT Validation Middleware
 * - Extracts JWT from Authorization header
 * - Verifies JWT signature locally
 * - Validates session with Auth Service
 * - Injects user context headers for downstream services
 */
export async function jwtMiddleware(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    // Check if this route requires authentication
    if (!requiresAuth(req.path)) {
      logger.debug("Public route - skipping JWT validation", {
        path: req.path,
        method: req.method,
      });
      return next();
    }

    // Extract Authorization header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      logger.warn("Missing Authorization header", {
        path: req.path,
        ip: req.ip,
      });
      res.status(400).json({
        error: "Missing Authorization header",
      });
      return;
    }

    // Extract token
    const token = authHeader.substring(7);

    // Step 1: Verify JWT signature locally
    let payload: any;
    try {
      const secret = process.env.JWT_SECRET;

      if (!secret) {
        logger.error("JWT_SECRET not configured", { path: req.path });
        res.status(500).json({
          error: "Server misconfiguration: JWT_SECRET not set",
        });
        return;
      }

      payload = jwt.verify(token, secret);
      logger.debug("JWT signature verified", { userId: payload.id });
    } catch (error) {
      logger.warn("JWT verification failed", {
        error: String(error),
        path: req.path,
        ip: req.ip,
      });
      res.status(401).json({
        error: "Invalid or expired token",
      });
      return;
    }

    // Step 2: Validate session with Auth Service
    let verificationResult: VerifyTokenResponse | null;
    try {
      verificationResult = await authServiceClient.verifyToken(token);
    } catch (error) {
      if (String(error).includes("AUTH_SERVICE_UNAVAILABLE")) {
        logger.error("Auth Service unavailable", {
          path: req.path,
        });
        res.status(503).json({
          error: "Authentication service unavailable",
        });
        return;
      }

      logger.error("Error calling Auth Service", {
        error: String(error),
        userId: payload.id,
      });
      res.status(503).json({
        error: "Authentication service error",
      });
      return;
    }

    if (!verificationResult) {
      logger.warn("Session invalid or expired", {
        userId: payload.id,
        path: req.path,
        ip: req.ip,
      });
      res.status(401).json({
        error: "Session expired or invalid",
      });
      return;
    }

    // Step 3: Inject user context headers
    const userPayload = verificationResult.payload;
    req.headers["x-user-id"] = userPayload.id;
    req.headers["x-user-role"] = userPayload.role;
    req.headers["x-user-email"] = userPayload.email;

    // Attach user to request object for potential use in other middleware/routes
    req.user = {
      id: userPayload.id,
      email: userPayload.email,
      role: userPayload.role,
    };
    req.token = token;

    logger.debug("JWT validation successful - headers injected", {
      userId: userPayload.id,
      role: userPayload.role,
      path: req.path,
    });

    // Step 4: Continue to next middleware/route handler
    next();
  } catch (error) {
    logger.error("Unexpected error in JWT middleware", {
      error: String(error),
      path: req.path,
    });
    res.status(500).json({
      error: "Internal server error",
    });
  }
}

/**
 * Middleware to check if user has a specific role
 * Use after jwtMiddleware
 */
export function requireRole(...allowedRoles: Array<"CHILD" | "PARENT" | "ADMIN">) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      logger.warn("User not authenticated in role check", {
        path: req.path,
      });
      res.status(401).json({
        error: "Unauthorized",
      });
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      logger.warn("User role not authorized", {
        userId: req.user.id,
        userRole: req.user.role,
        allowedRoles,
        path: req.path,
      });
      res.status(403).json({
        error: "Forbidden - insufficient permissions",
      });
      return;
    }

    next();
  };
}
