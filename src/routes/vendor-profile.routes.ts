import { Router } from "express";

import { vendorProfileController } from "../controllers/vendor-profile.controller";
import { requireAuth, requireRole } from "../middlewares/auth.middleware";
import { upload } from "../middlewares/upload.middleware";

const router = Router();

router.get("/", vendorProfileController.getAll);

router.get("/me", requireAuth, vendorProfileController.getMyProfile);

router.get("/:slug", vendorProfileController.getBySlug);

router.get("/id/:id", vendorProfileController.getById);

router.post(
  "/",
  requireAuth,
  requireRole(["ADMIN", "VENDOR"]),
  upload.single("logo"),
  vendorProfileController.create,
);

router.patch(
  "/:id",
  requireAuth,
  requireRole(["ADMIN", "VENDOR"]),
  upload.single("logo"),
  vendorProfileController.update,
);

router.delete(
  "/:id",
  requireAuth,
  requireRole("ADMIN"),
  vendorProfileController.delete,
);

export default router;