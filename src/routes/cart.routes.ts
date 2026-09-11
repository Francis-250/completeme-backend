import { Router } from "express";

import { cartController } from "../controllers/cart.controller";
import { requireAuth } from "../middlewares/auth.middleware";

const router = Router();

router.use(requireAuth);

router.get("/", cartController.getAll);

router.get("/summary", cartController.getSummary);

router.post("/", cartController.add);

router.patch("/:variantId", cartController.update);

router.delete("/:variantId", cartController.remove);

router.delete("/", cartController.clear);

export default router;