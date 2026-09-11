import { Router } from "express";

import { tagController } from "../controllers/tags.controller";
import { requireAuth, requireRole } from "../middlewares/auth.middleware";

const router = Router();

router.get("/", tagController.getAll);

router.get("/:slug", tagController.getBySlug);

router.get("/id/:id", tagController.getById);

router.post("/", requireAuth, requireRole("ADMIN"), tagController.create);

router.patch("/:id", requireAuth, requireRole("ADMIN"), tagController.update);

router.delete("/:id", requireAuth, requireRole("ADMIN"), tagController.delete);

export default router;