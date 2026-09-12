import { Router } from "express";

import { orderController } from "../controllers/order.controller";
import { optionalAuth, requireAuth, requireRole } from "../middlewares/auth.middleware";

const router = Router();

router.get("/", optionalAuth, orderController.getAll);

router.get("/stats", optionalAuth, orderController.getStats);

router.get("/:id", optionalAuth, orderController.getById);

router.post("/", optionalAuth, orderController.create);

router.patch("/:id", optionalAuth, orderController.update);

router.post("/:id/cancel", optionalAuth, orderController.cancel);

export default router;