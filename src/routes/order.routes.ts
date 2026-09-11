import { Router } from "express";

import { orderController } from "../controllers/order.controller";
import { requireAuth, requireRole } from "../middlewares/auth.middleware";

const router = Router();

router.use(requireAuth);

router.get("/", orderController.getAll);

router.get("/stats", orderController.getStats);

router.get("/:id", orderController.getById);

router.post("/", orderController.create);

router.patch("/:id", orderController.update);

router.post("/:id/cancel", orderController.cancel);

export default router;