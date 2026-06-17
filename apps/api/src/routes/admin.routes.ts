import { Router } from "express";
import { adminController } from "../controllers/admin.controller.js";
import { authenticate, authorize } from "../middleware/auth.js";

export const adminRoutes = Router();

adminRoutes.use(authenticate, authorize("admin"));
adminRoutes.get("/analytics", adminController.analytics);
adminRoutes.get("/users", adminController.users);
adminRoutes.patch("/users/:id/ban", adminController.banUser);
adminRoutes.patch("/users/:id/role", adminController.updateUserRole);
adminRoutes.get("/reviews/moderation", adminController.moderationQueue);
adminRoutes.patch("/reviews/:id/approve", adminController.setReviewStatus);
adminRoutes.patch("/reviews/:id/reject", adminController.setReviewStatus);
adminRoutes.get("/reports", adminController.reports);
adminRoutes.get("/revenue", (_req, res) => res.json({ mrr: 0, sponsoredListings: 0, ownerSubscriptions: 0 }));

