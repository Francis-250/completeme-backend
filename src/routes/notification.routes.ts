import { Router } from "express";
import { notificationController } from "../controllers/notification.controller";
import { optionalAuth } from "../middlewares/auth.middleware";

const router = Router();

router.use(optionalAuth);

router.get("/", notificationController.getAll);
router.patch("/read-all", notificationController.markAllAsRead);
router.patch("/:id/read", notificationController.markAsRead);
router.delete("/clear-all", notificationController.deleteAll);
router.delete("/:id", notificationController.delete);

export default router;
