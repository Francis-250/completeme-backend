import { Router } from "express";
import { newsletterController } from "../controllers/newsletter.controller";
import { optionalAuth } from "../middlewares/auth.middleware";

const router = Router();

router.post("/subscribe", newsletterController.subscribe);
router.post("/", newsletterController.subscribe);
router.post("/unsubscribe", newsletterController.unsubscribe);
router.get("/", optionalAuth, newsletterController.getAll);
router.delete("/:id", optionalAuth, newsletterController.delete);

export default router;
