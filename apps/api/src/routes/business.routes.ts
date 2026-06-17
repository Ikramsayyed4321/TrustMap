import { Router } from "express";
import { businessController } from "../controllers/business.controller.js";
import { reviewController } from "../controllers/review.controller.js";
import { authenticate, authorize } from "../middleware/auth.js";

export const businessRoutes = Router();

businessRoutes.get("/", businessController.list);
businessRoutes.post("/", authenticate, authorize("admin", "owner"), businessController.create);
businessRoutes.get("/:id", businessController.get);
businessRoutes.patch("/:id", authenticate, authorize("admin", "owner"), businessController.update);
businessRoutes.delete("/:id", authenticate, authorize("admin"), businessController.remove);
businessRoutes.get("/:id/reviews", reviewController.listForBusiness);
businessRoutes.get("/:id/nearby", businessController.nearby);
businessRoutes.post("/:id/owner-response", authenticate, authorize("admin", "owner"), (_req, res) =>
  res.json({ message: "Owner response stored by review reply module." })
);
