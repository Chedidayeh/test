import express, { Request, Response, Application } from "express";
import dotenv from "dotenv";

// Load env
dotenv.config();

const app: Application = express();
const PORT = process.env.PORT || 3003;
const NODE_ENV = process.env.NODE_ENV || "development";

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Simple request logging
app.use((req: Request, _res, next) => {
  console.log(JSON.stringify({
    timestamp: new Date().toISOString(),
    level: 'info',
    service: 'ai-service',
    message: `${req.method} ${req.path}`,
    metadata: { method: req.method, path: req.path, ip: req.ip }
  }));
  next();
});

// Health
app.get('/health', (_req: Request, res: Response) => {
  const status = { status: 'healthy', service: 'ai-service', timestamp: new Date().toISOString(), environment: NODE_ENV };
  console.log(JSON.stringify({ timestamp: new Date().toISOString(), level: 'debug', service: 'ai-service', message: 'Health check', metadata: status }));
  res.status(200).json(status);
});

// Root
app.get('/', (_req: Request, res: Response) => res.json({ service: 'ai-service', version: '1.0.0' }));

// Start
const server = app.listen(PORT, () => {
  console.log(JSON.stringify({ timestamp: new Date().toISOString(), level: 'info', service: 'ai-service', message: 'AI Service started', metadata: { port: PORT, environment: NODE_ENV } }));
});

process.on('SIGTERM', () => { console.log('SIGTERM received'); server.close(() => process.exit(0)); });
process.on('SIGINT', () => { console.log('SIGINT received'); server.close(() => process.exit(0)); });

export default app;
