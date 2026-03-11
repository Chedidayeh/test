import { Request, Response, NextFunction } from "express";
import { RequestContext, RoleType } from "@shared/src/types";

/**
 * Auth middleware to verify JWT token from gateway
 * The gateway passes the decoded user context in request headers
 */
export const authMiddleware = (
  req: Request & { user?: RequestContext },
  res: Response,
  next: NextFunction
) => {
  try {
    // Get user context from headers (injected by gateway)
    const userId = req.headers["x-user-id"] as string;
    const userRole = req.headers["x-user-role"] as string;
    const userEmail = req.headers["x-user-email"] as string;

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: {
          code: "UNAUTHORIZED",
          message: "Missing user context. Please authenticate first.",
        },
      });
    }

    // Attach user context to request
    req.user = {
      userId,
      userRole: userRole as RoleType,
      userEmail,
    };

    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      error: {
        code: "AUTH_ERROR",
        message: "Failed to authenticate",
      },
    });
  }
};

/**
 * Admin-only middleware
 * Ensures user has ADMIN role
 */
export const adminOnlyMiddleware = (
  req: Request & { user?: RequestContext },
  res: Response,
  next: NextFunction
) => {
  if (req.user?.userRole !== RoleType.ADMIN) {
    return res.status(403).json({
      success: false,
      error: {
        code: "FORBIDDEN",
        message: "Admin access required",
      },
    });
  }
  next();
};
