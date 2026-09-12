import { Router } from "express";
import { settingsController } from "../controllers/settings.controller";
import { optionalAuth, requireAuth, requireRole } from "../middlewares/auth.middleware";

const router = Router();

router.get("/", settingsController.get);
router.patch("/", optionalAuth, settingsController.update);
router.put("/", optionalAuth, settingsController.update);
router.post("/", optionalAuth, settingsController.update);

export default router;
