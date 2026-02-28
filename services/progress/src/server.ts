import express, { Request, Response, Application } from "express";
import cors from "cors";
import dotenv from "dotenv";
import childrenRoutes from "./routes/children.routes";
import { API_BASE_URL_V1 } from "@shared/types";

dotenv.config();

const app: Application = express();
const PORT = process.env.PORT || 3004;
const NODE_ENV = process.env.NODE_ENV || "development";

// ============================================================================
// MIDDLEWARE
// ============================================================================

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req: Request, _res, next) => {
  console.log(
    JSON.stringify({
      timestamp: new Date().toISOString(),
      service: "progress-service",
      message: `${req.method} ${req.path}`,
      metadata: { method: req.method, path: req.path, ip: req.ip },
    }),
  );
  next();
});

// ============================================================================
// HEALTH CHECK & INFO ENDPOINTS
// ============================================================================

app.get("/health", (_req: Request, res: Response) => {
  const status = {
    status: "healthy",
    service: "progress-service",
    timestamp: new Date().toISOString(),
    environment: NODE_ENV,
    uptime: process.uptime(),
  };
  console.log(
    JSON.stringify({
      timestamp: new Date().toISOString(),
      level: "debug",
      service: "progress-service",
      message: "Health check",
      metadata: status,
    }),
  );
  res.status(200).json(status);
});

app.get("/", (_req: Request, res: Response) =>
  res.json({ service: "progress-service", version: "1.0.0" }),
);

// ============================================================================
// ROUTES
// ============================================================================

// Children endpoints (mounted at /api/v1/children)
app.use(API_BASE_URL_V1, childrenRoutes);

// ============================================================================
// ERROR HANDLERS
// ============================================================================

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: {
      code: "NOT_FOUND",
      message: "Endpoint not found",
    },
  });
});

// Global error handler
app.use(
  (
    err: any,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction,
  ) => {
    console.error(
      JSON.stringify({
        timestamp: new Date().toISOString(),
        level: "error",
        service: "progress-service",
        message: "Unhandled error",
        error: String(err),
        path: req.path,
      }),
    );

    res.status(err.status || 500).json({
      success: false,
      error: {
        code: "INTERNAL_ERROR",
        message:
          NODE_ENV === "production"
            ? "Internal server error"
            : err.message,
      },
    });
  },
);

// ============================================================================
// SERVER START
// ============================================================================

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(
      JSON.stringify({
        timestamp: new Date().toISOString(),
        level: "info",
        service: "progress-service",
        message: "Progress Service started",
        metadata: { port: PORT, environment: NODE_ENV },
      }),
    );
  });
}

export default app;
