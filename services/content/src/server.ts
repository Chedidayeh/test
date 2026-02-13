import express, { Request, Response, Application } from "express";
import dotenv from "dotenv";

// Load environment variables defined in .env file
dotenv.config();

const app: Application = express();
const PORT = process.env.PORT || 3001;
const NODE_ENV = process.env.NODE_ENV || "development";

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware (console logs)
app.use((req: Request, res: Response, next) => {
  console.log(
    JSON.stringify({
      timestamp: new Date().toISOString(),
      service: "content-service",
      message: `${req.method} ${req.path}`,
      metadata: { method: req.method, path: req.path, ip: req.ip },
    }),
  );
  next();
});

/**
 * Health endpoint
 * GET /health
 */
app.get("/health", (req: Request, res: Response) => {
  const healthStatus = {
    status: "healthy",
    service: "content-service",
    timestamp: new Date().toISOString(),
    environment: NODE_ENV,
  };
  console.log(
    JSON.stringify({
      timestamp: new Date().toISOString(),
      service: "content-service",
      message: "Health check",
      metadata: healthStatus,
    }),
  );
  res.status(200).json(healthStatus);
});

/**
 * TODO: Implement story endpoints
 */

/**
 * Start server
 */
app.listen(PORT, () => {
  console.log(
    JSON.stringify({
      timestamp: new Date().toISOString(),
      service: "content-service",
      message: "Content Service started successfully",
      metadata: { port: PORT, environment: NODE_ENV },
    }),
  );

  console.log(
    JSON.stringify({
      timestamp: new Date().toISOString(),
      service: "content-service",
      message: "Available endpoints:",
      metadata: {
        health: `GET http://localhost:${PORT}/health`,
        root: `GET http://localhost:${PORT}/`,
      },
    }),
  );
});

export default app;
