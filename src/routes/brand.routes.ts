import { Router } from "express";

import { brandController } from "../controllers/brand.controller";
import { requireAuth, requireRole } from "../middlewares/auth.middleware";

const router = Router();

router.get("/", brandController.getAll);

router.get("/:slug", brandController.getBySlug);

router.post("/", requireAuth, requireRole("ADMIN"), brandController.create);

router.patch("/:id", requireAuth, requireRole("ADMIN"), brandController.update);

router.delete(
  "/:id",
  requireAuth,
  requireRole("ADMIN"),
  brandController.delete,
);

export default router;
