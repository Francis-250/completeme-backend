import { Router } from "express";

import { paymentController } from "../controllers/payment.controller";
import { requireAuth, requireRole } from "../middlewares/auth.middleware";

const router = Router();

router.use(requireAuth);

router.get("/", paymentController.getAll);

router.get("/:id", paymentController.getById);

router.get("/transaction/:transactionId", paymentController.getByTransactionId);

router.post("/", requireRole("ADMIN"), paymentController.create);

router.patch("/:id", requireRole("ADMIN"), paymentController.update);

router.delete("/:id", requireRole("ADMIN"), paymentController.delete);

export default router;