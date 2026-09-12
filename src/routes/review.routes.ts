import { Router } from "express";

import { reviewController } from "../controllers/review.controller";
import { optionalAuth, requireAuth, requireRole } from "../middlewares/auth.middleware";

const router = Router();

router.get("/", optionalAuth, reviewController.getAll);

router.get("/:id", reviewController.getById);

router.post("/", requireAuth, reviewController.create);

router.patch("/:id", requireAuth, reviewController.update);

router.delete("/:id", requireAuth, reviewController.delete);

export default router;