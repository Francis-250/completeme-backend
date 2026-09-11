import { Router } from "express";

import { categoryController } from "../controllers/category.controller";
import { requireAuth, requireRole } from "../middlewares/auth.middleware";
import { upload } from "../middlewares/upload.middleware";

const router = Router();

router.get("/", categoryController.getAll);

router.get("/:slug", categoryController.getBySlug);

router.get("/id/:id", categoryController.getById);

router.post(
  "/",
  requireAuth,
  requireRole("ADMIN"),
  upload.single("image"),
  categoryController.create,
);

router.patch(
  "/:id",
  requireAuth,
  requireRole("ADMIN"),
  upload.single("image"),
  categoryController.update,
);

router.delete(
  "/:id",
  requireAuth,
  requireRole("ADMIN"),
  categoryController.delete,
);

export default router;