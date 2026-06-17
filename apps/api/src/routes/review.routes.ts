import { Router } from "express";
import { reviewController } from "../controllers/review.controller.js";
import { authenticate } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import { createReviewSchema } from "../validations/review.validation.js";

export const reviewRoutes = Router();

reviewRoutes.post("/", authenticate, validate(createReviewSchema), reviewController.create);
reviewRoutes.patch("/:id", authenticate, reviewController.update);
reviewRoutes.delete("/:id", authenticate, reviewController.remove);
reviewRoutes.post("/:id/helpful", authenticate, reviewController.helpful);
reviewRoutes.post("/:id/report", authenticate, (_req, res) => res.status(201).json({ message: "Report created." }));
reviewRoutes.get("/:id/history", authenticate, (_req, res) => res.json([]));
