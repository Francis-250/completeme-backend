import { Router } from "express";
import { mediaController } from "../controllers/media.controller";
import { requireAuth, requireRole } from "../middlewares/auth.middleware";
import { upload } from "../middlewares/upload.middleware";

const router = Router();

router.get("/", requireAuth, requireRole(["ADMIN"]), mediaController.getMedia);
router.get("/folders", requireAuth, requireRole(["ADMIN"]), mediaController.getFolders);
router.post(
  "/upload",
  requireAuth,
  requireRole(["ADMIN"]),
  upload.single("file"),
  mediaController.uploadMedia,
);
router.delete(
  "/:publicId",
  requireAuth,
  requireRole(["ADMIN"]),
  mediaController.deleteMedia,
);
router.delete(
  "/",
  requireAuth,
  requireRole(["ADMIN"]),
  mediaController.deleteMedia,
);

export default router;
