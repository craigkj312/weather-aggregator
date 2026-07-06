import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join, resolve } from "node:path";
import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import { weatherRouter } from "./routes/weather.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
// Load env from the repo root (../../.env from server/dist), falling back to a
// local .env if present. In production, config comes from real env vars.
dotenv.config({ path: resolve(__dirname, "../../.env") });
dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 3001;

app.use(cors({ origin: process.env.CLIENT_ORIGIN ?? "http://localhost:5173" }));
app.use(express.json());

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.use("/api", weatherRouter);

// In production, serve the built client (same-origin) from /app/client/dist.
const clientDist = resolve(__dirname, "../../client/dist");
if (existsSync(clientDist)) {
  app.use(express.static(clientDist));
  // SPA fallback for any non-API route.
  app.get(/^\/(?!api\/).*/, (_req, res) => {
    res.sendFile(join(clientDist, "index.html"));
  });
}

app.listen(PORT, () => {
  console.log(`Weather aggregator listening on http://localhost:${PORT}`);
});
