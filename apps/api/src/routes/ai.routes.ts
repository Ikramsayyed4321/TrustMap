import { Router } from "express";
import { aiController } from "../controllers/ai.controller.js";
import { authenticate, authorize } from "../middleware/auth.js";

export const aiRoutes = Router();

aiRoutes.post("/reviews/:id/analyze", authenticate, authorize("admin"), aiController.analyzeReview);
aiRoutes.post("/businesses/:id/summary", authenticate, authorize("admin", "owner"), aiController.summarizeBusiness);
aiRoutes.post("/search-intent", aiController.searchIntent);
