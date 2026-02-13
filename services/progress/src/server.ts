import express, { Request, Response, Application } from "express";
import dotenv from "dotenv";

dotenv.config();

const app: Application = express();
const PORT = process.env.PORT || 3002;
const NODE_ENV = process.env.NODE_ENV || "development";

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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

app.get("/health", (_req: Request, res: Response) => {
  const status = {
    status: "healthy",
    service: "progress-service",
    timestamp: new Date().toISOString(),
    environment: NODE_ENV,
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

export default app;
