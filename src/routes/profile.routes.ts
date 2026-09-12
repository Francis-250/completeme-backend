import { Router } from "express";
import { profileController } from "../controllers/profile.controller";
import { optionalAuth } from "../middlewares/auth.middleware";

const router = Router();

router.get("/", optionalAuth, profileController.get);
router.patch("/", optionalAuth, profileController.update);
router.post("/", optionalAuth, profileController.update);

export default router;
