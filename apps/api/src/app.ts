import express from "express";
import swaggerUi from "swagger-ui-express";
import { apiRoutes } from "./routes/index.js";
import { applySecurity } from "./middleware/security.js";
import { errorHandler } from "./middleware/errorHandler.js";
import { swaggerSpec } from "./swagger.js";

export function createApp() {
  const app = express();
  applySecurity(app);
  app.use(express.json({ limit: "2mb" }));
  app.use(express.urlencoded({ extended: true }));

  app.get("/health", (_req, res) => res.json({ status: "ok", service: "reviewhub-api" }));
  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
  app.use("/api/v1", apiRoutes);
  app.use(errorHandler);

  return app;
}
