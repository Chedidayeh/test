import express, { Request, Response, Application } from "express";
import cors from "cors";
import dotenv from "dotenv";
import contentRoutes from "./routes";
import { logger } from "./utils/logger";

// Load environment variables defined in .env file
dotenv.config();

const app: Application = express();
const PORT = process.env.PORT || 3003;
const NODE_ENV = process.env.NODE_ENV || "development";

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req: Request, res: Response, next) => {
  logger.debug(`${req.method} ${req.path}`, {
    method: req.method,
    path: req.path,
    ip: req.ip,
  });
  next();
});

/**
 * Health endpoint
 * GET /health
 */
app.get("/health", (req: Request, res: Response) => {
  const healthStatus = {
    status: "ok",
    service: "content-service",
    timestamp: new Date().toISOString(),
    environment: NODE_ENV,
    uptime: process.uptime(),
  };
  logger.debug("Health check", healthStatus);
  res.status(200).json(healthStatus);
});

/**
 * API Routes (mounted at /api)
 */
app.use("/api", contentRoutes);

// 404 handler
app.use((req: Request, res: Response) => {
  logger.warn("Route not found", { path: req.path, method: req.method });
  res.status(404).json({
    success: false,
    error: "Endpoint not found",
    path: req.path,
    timestamp: new Date().toISOString(),
  });
});

// Global error handler
app.use((err: any, req: Request, res: Response, next: express.NextFunction) => {
  logger.error("Unhandled error", {
    error: String(err),
    path: req.path,
    stack: err.stack,
  });
  res.status(err.status || 500).json({
    success: false,
    error: "Internal server error",
    timestamp: new Date().toISOString(),
  });
});

/**
 * Start server
 */
app.listen(PORT, () => {
  logger.info("Content Service started successfully", {
    port: PORT,
    environment: NODE_ENV,
  });
});

export default app;
