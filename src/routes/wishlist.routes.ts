import { Router } from "express";

import { wishlistController } from "../controllers/wishlist.controller";
import { requireAuth } from "../middlewares/auth.middleware";

const router = Router();

router.use(requireAuth);

router.get("/", wishlistController.getAll);

router.get("/check/:productId", wishlistController.check);

router.post("/", wishlistController.add);

router.delete("/:productId", wishlistController.remove);

router.delete("/", wishlistController.clear);

export default router;