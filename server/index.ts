import express from "express";
import path from "path";
import { fileURLToPath } from "url";

import healthRouter from "./routes/health.js";
import scenariosRouter from "./routes/scenarios.js";
import pathwaysRouter from "./routes/pathways.js";
import simulationsRouter from "./routes/simulations.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();

  // =========================
  // CORS
  // =========================

  app.use((req, res, next) => {
    res.header(
      "Access-Control-Allow-Origin",
      "http://localhost:3004",
    );

    res.header(
      "Access-Control-Allow-Methods",
      "GET,POST,PUT,PATCH,DELETE,OPTIONS",
    );

    res.header(
      "Access-Control-Allow-Headers",
      "Content-Type, Authorization",
    );

    if (req.method === "OPTIONS") {
      return res.sendStatus(204);
    }

    next();
  });

  // =========================
  // MIDDLEWARE
  // =========================

  app.use(express.json({ limit: "1mb" }));

  // Temporary request debugging
  app.use((req, _res, next) => {
    console.log("REQUEST:", req.method, req.originalUrl);
    console.log("BODY:", req.body);
    next();
  });

  // =========================
  // API ROUTES
  // =========================

  app.use("/api/health", healthRouter);
  app.use("/api/scenarios", scenariosRouter);
  app.use("/api/pathways", pathwaysRouter);
  app.use("/api/simulations", simulationsRouter);

  // =========================
  // FRONTEND STATIC FILES
  // =========================

  // Frontend build is located at:
  // carepath/dist/public
  //
  // This works both when running:
  //   npx tsx server/index.ts
  // and when running the compiled server from dist.

  const staticPath = path.resolve(__dirname, "..", "dist", "public");

  console.log("Frontend static path:", staticPath);

  app.use(express.static(staticPath));

  // =========================
  // FRONTEND ROUTING
  // =========================

  app.get("*", (_req, res) => {
    res.sendFile(path.join(staticPath, "index.html"));
  });

  // =========================
  // START SERVER
  // =========================

  const port = Number(process.env.PORT) || 3000;

  app.listen(port, () => {
    console.log("");
    console.log("=================================");
    console.log("       CAREPATH SERVER");
    console.log("=================================");
    console.log(`Server:      http://localhost:${port}`);
    console.log(`Health API:  http://localhost:${port}/api/health`);
    console.log(`Scenarios:   http://localhost:${port}/api/scenarios`);
    console.log(`Pathways:    http://localhost:${port}/api/pathways`);
    console.log(`Simulations: http://localhost:${port}/api/simulations`);
    console.log("=================================");
    console.log("");
  });
}

startServer().catch((error) => {
  console.error("Failed to start CarePath server:");
  console.error(error);
  process.exit(1);
});