import { Router } from "express";
import { adminRoutes } from "./admin.routes.js";
import { aiRoutes } from "./ai.routes.js";
import { authRoutes } from "./auth.routes.js";
import { businessRoutes } from "./business.routes.js";
import { reviewRoutes } from "./review.routes.js";
import { searchRoutes } from "./search.routes.js";

export const apiRoutes = Router();

apiRoutes.use("/auth", authRoutes);
apiRoutes.use("/businesses", businessRoutes);
apiRoutes.use("/reviews", reviewRoutes);
apiRoutes.use("/search", searchRoutes);
apiRoutes.use("/admin", adminRoutes);
apiRoutes.use("/ai", aiRoutes);
