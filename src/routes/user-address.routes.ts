import { Router } from "express";

import { userAddressController } from "../controllers/user-address.controller";
import { requireAuth } from "../middlewares/auth.middleware";

const router = Router();

router.use(requireAuth);

router.get("/", userAddressController.getAll);

router.get("/:id", userAddressController.getById);

router.post("/", userAddressController.create);

router.patch("/:id", userAddressController.update);

router.delete("/:id", userAddressController.delete);

router.patch("/:id/default", userAddressController.setDefault);

export default router;