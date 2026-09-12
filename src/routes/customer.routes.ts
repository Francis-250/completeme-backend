import { Router } from "express";
import { customerController } from "../controllers/customer.controller";
import { requireAuth, requireRole } from "../middlewares/auth.middleware";

const router = Router();

router.get("/", customerController.getAll);
router.get("/:id", customerController.getById);
router.post("/", requireAuth, requireRole("ADMIN"), customerController.create);
router.patch("/:id", requireAuth, requireRole("ADMIN"), customerController.update);
router.delete("/:id", requireAuth, requireRole("ADMIN"), customerController.delete);

export default router;
