import { Router } from "express";
import { couponController } from "../controllers/coupon.controller";
import { optionalAuth, requireAuth, requireRole } from "../middlewares/auth.middleware";

const router = Router();

// Public route for coupon validation
router.post("/validate", requireAuth, couponController.validate);

// Coupon listing
router.get("/", optionalAuth, couponController.getAll);

router.get("/:code", couponController.getByCode);

router.get("/id/:id", requireAuth, requireRole("ADMIN"), couponController.getById);

router.post("/", requireAuth, requireRole("ADMIN"), couponController.create);

router.patch("/:id", requireAuth, requireRole("ADMIN"), couponController.update);

router.delete("/:id", requireAuth, requireRole("ADMIN"), couponController.delete);

export default router;