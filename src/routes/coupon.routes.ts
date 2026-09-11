import { Router } from "express";

import { couponController } from "../controllers/coupon.controller";
import { requireAuth, requireRole } from "../middlewares/auth.middleware";

const router = Router();

// Public route for coupon validation
router.post("/validate", requireAuth, couponController.validate);

// Admin routes
router.get("/", requireAuth, requireRole("ADMIN"), couponController.getAll);

router.get("/:code", couponController.getByCode);

router.get("/id/:id", requireAuth, requireRole("ADMIN"), couponController.getById);

router.post("/", requireAuth, requireRole("ADMIN"), couponController.create);

router.patch("/:id", requireAuth, requireRole("ADMIN"), couponController.update);

router.delete("/:id", requireAuth, requireRole("ADMIN"), couponController.delete);

export default router;