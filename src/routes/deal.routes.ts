import { Router } from "express";
import { dealController } from "../controllers/deal.controller";

const router = Router();

router.get("/", dealController.getDeals);
router.get("/:id", dealController.getDealById);

export default router;
