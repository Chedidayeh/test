import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./routes/auth.routes";
import { logger } from "./utils/logger";
import { API_BASE_URL_V1 } from "@shared/src/types";

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3002;
const NODE_ENV = process.env.NODE_ENV || "development";

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req, res, next) => {
  logger.debug(`${req.method} ${req.path}`, {
    method: req.method,
    path: req.path,
    ip: req.ip,
  });
  next();
});

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    service: "auth-service",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// Auth routes (mounted at root since gateway proxy strips /api/v1/auth path)
app.use(API_BASE_URL_V1, authRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: "Endpoint not found" });
});

// Error handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  logger.error("Unhandled error", { error: String(err), path: req.path });
  res.status(err.status || 500).json({
    error: NODE_ENV === "production" ? "Internal server error" : err.message,
  });
});

// Start server
if (require.main === module) {
  app.listen(PORT, () => {
    logger.info(`Auth Service started`, {
      port: PORT,
      env: NODE_ENV,
      timestamp: new Date().toISOString(),
    });
  });
}

export default app;
