import { Router } from "express";
import { blogController } from "../controllers/blog.controller";
import { requireAuth, requireRole } from "../middlewares/auth.middleware";

const router = Router();

router.get("/", blogController.getAll);
router.get("/:slug", blogController.getBySlug);

router.post("/", requireAuth, requireRole(["ADMIN"]), blogController.create);
router.put("/:id", requireAuth, requireRole(["ADMIN"]), blogController.update);
router.delete("/:id", requireAuth, requireRole(["ADMIN"]), blogController.delete);

export default router;
