import { Router } from "express";

import { collectionController } from "../controllers/collection.controller";
import { requireAuth, requireRole } from "../middlewares/auth.middleware";
import { upload } from "../middlewares/upload.middleware";

const router = Router();

router.get("/", collectionController.getAll);

router.get("/:slug", collectionController.getBySlug);

router.get("/id/:id", collectionController.getById);

router.post(
  "/",
  requireAuth,
  requireRole("ADMIN"),
  upload.single("image"),
  collectionController.create,
);

router.patch(
  "/:id",
  requireAuth,
  requireRole("ADMIN"),
  upload.single("image"),
  collectionController.update,
);

router.delete(
  "/:id",
  requireAuth,
  requireRole("ADMIN"),
  collectionController.delete,
);

router.post(
  "/:id/products",
  requireAuth,
  requireRole("ADMIN"),
  collectionController.addProduct,
);

router.delete(
  "/:id/products",
  requireAuth,
  requireRole("ADMIN"),
  collectionController.removeProduct,
);

router.patch(
  "/:id/products/sort",
  requireAuth,
  requireRole("ADMIN"),
  collectionController.updateProductSortOrder,
);

export default router;