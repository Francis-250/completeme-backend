import { Router } from "express";
import { contactController } from "../controllers/contact.controller";
import { requireAuth, requireRole } from "../middlewares/auth.middleware";

const router = Router();

router.post("/", contactController.createInquiry);
router.get(
  "/",
  requireAuth,
  requireRole(["ADMIN"]),
  contactController.getAllInquiries,
);
router.patch(
  "/:id/status",
  requireAuth,
  requireRole(["ADMIN"]),
  contactController.updateStatus,
);

export default router;
