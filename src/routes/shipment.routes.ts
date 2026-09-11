import { Router } from "express";

import { shipmentController } from "../controllers/shipment.controller";
import { requireAuth, requireRole } from "../middlewares/auth.middleware";

const router = Router();

router.use(requireAuth);

router.get("/", shipmentController.getAll);

router.get("/:id", shipmentController.getById);

router.get("/tracking/:trackingNumber", shipmentController.getByTrackingNumber);

router.post("/", requireRole("ADMIN"), shipmentController.create);

router.patch("/:id", requireRole("ADMIN"), shipmentController.update);

router.delete("/:id", requireRole("ADMIN"), shipmentController.delete);

export default router;