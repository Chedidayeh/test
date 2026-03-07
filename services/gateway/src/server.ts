import dotenv from "dotenv";

// Load environment variables from .env file
dotenv.config();

import express from "express";
import cors from "cors";
import { jwtMiddleware } from "./middleware/jwt.middleware";
import { logger } from "./utils/logger";
import { authServiceClient } from "./utils/auth-service";
import { aiRoutes, authRoutes, contentRoutes, progressRoutes } from "./routes";
import { API_BASE_URL_V1 } from "@shared/types";

const app = express();

// Middleware: CORS and JSON parsing
app.use(cors());
app.use(express.json());

// app.use((req, res, next) => {
//   logger.info(`${req.method} ${req.path}`, {
//     ip: req.ip,
//     userAgent: req.headers["user-agent"],
//   });
//   next();
// });

// Health check endpoints (public - no auth needed)
app.get("/health", (req, res) => {
  logger.debug("Health check endpoint accessed");
  res.status(200).json({ status: "ok", timestamp: new Date().toISOString() });
});

// Selective JWT Middleware - validates tokens for protected routes, allows public auth endpoints
const selectiveJwtMiddleware = (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction,
) => {
  // Public auth endpoints that don't require JWT
  const publicAuthEndpoints = [
    "/register",
    "/login",
    "/logout",
    "/create-child-profile",
    "/login-child",
    "/verify-token",
  ];
  const isPublicAuth = publicAuthEndpoints.some(
    (ep) => req.path === `${API_BASE_URL_V1}/auth${ep}` || req.path === ep,
  );

  if (isPublicAuth) {
    logger.debug("Skipping JWT validation for public auth endpoint", {
      path: req.path,
    });
    return next(); // Skip JWT validation for public endpoints
  }

  logger.debug("Applying JWT validation", { path: req.path });
  // Apply JWT validation for protected routes
  jwtMiddleware(req, res, next);
};

app.use(selectiveJwtMiddleware);

// Auth routes (public endpoints are open, protected endpoints require JWT)
app.use(`${API_BASE_URL_V1}/auth`, authRoutes);

/**
 * Progress service Routes (Protected)
 */
app.use(`${API_BASE_URL_V1}`, progressRoutes);


/**
 * Content Service Routes (Protected)
 */
app.use(`${API_BASE_URL_V1}`, contentRoutes);


/**
 * AI Service Routes (Protected)
 */
app.use(`${API_BASE_URL_V1}`, aiRoutes);





// 404 handler
app.use((req, res) => {
  logger.warn("Route not found", {
    path: req.path,
    method: req.method,
  });
  res.status(404).json({ error: "Route not found" });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  logger.info(`Gateway running on port ${PORT}`, {
    nodeEnv: process.env.NODE_ENV,
  });
});
