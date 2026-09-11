import { Router } from "express";

import { productController } from "../controllers/product.controller";
import { requireAuth, requireRole } from "../middlewares/auth.middleware";
import { upload } from "../middlewares/upload.middleware";

const router = Router();

router.get("/", productController.getAll);

router.get("/:slug", productController.getBySlug);

router.get("/id/:id", productController.getById);

router.post(
  "/",
  requireAuth,
  requireRole(["ADMIN", "VENDOR"]),
  upload.array("images", 10),
  productController.create,
);

router.patch(
  "/:id",
  requireAuth,
  requireRole(["ADMIN", "VENDOR"]),
  upload.array("images", 10),
  productController.update,
);

router.delete(
  "/:id",
  requireAuth,
  requireRole(["ADMIN", "VENDOR"]),
  productController.delete,
);

// Variant routes
router.post(
  "/:id/variants",
  requireAuth,
  requireRole(["ADMIN", "VENDOR"]),
  upload.array("images", 10),
  productController.createVariant,
);

router.patch(
  "/variants/:variantId",
  requireAuth,
  requireRole(["ADMIN", "VENDOR"]),
  upload.array("images", 10),
  productController.updateVariant,
);

router.delete(
  "/variants/:variantId",
  requireAuth,
  requireRole(["ADMIN", "VENDOR"]),
  productController.deleteVariant,
);

// Tag routes
router.post(
  "/:id/tags",
  requireAuth,
  requireRole(["ADMIN", "VENDOR"]),
  productController.addTag,
);

router.delete(
  "/:id/tags",
  requireAuth,
  requireRole(["ADMIN", "VENDOR"]),
  productController.removeTag,
);

export default router;