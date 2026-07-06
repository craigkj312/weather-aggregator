import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import { weatherRouter } from "./routes/weather.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
// Load env from the repo root (../../.env from server/src or server/dist),
// falling back to a local .env if present.
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

app.listen(PORT, () => {
  console.log(`Weather aggregator API listening on http://localhost:${PORT}`);
});
