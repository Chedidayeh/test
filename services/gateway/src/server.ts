import express from "express";
import { createProxyMiddleware } from "http-proxy-middleware";

const app = express();

app.use(
  "/content",
  createProxyMiddleware({
    target: process.env.CONTENT_SERVICE_URL,
    changeOrigin: true,
  })
);

app.use(
  "/progress",
  createProxyMiddleware({
    target: process.env.PROGRESS_SERVICE_URL,
    changeOrigin: true,
  })
);

app.get("/health", (req, res) => {
  console.log("Health check endpoint accessed");
  res.status(200).json({ status: "ok" });
});

app.listen(process.env.PORT, () => {
  console.log(`Gateway running on port ${process.env.PORT}`);
});
