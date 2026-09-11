import { Router } from "express";
import { UserController } from "../controllers/user.controller";
import { requireRole } from "../middlewares/auth.middleware";
import { UserService } from "../services/user.service";

const router = Router();

const userService = new UserService();

const userController = new UserController(userService);

router.get("/", requireRole("admin"), userController.getAllUsers.bind(userController));

export default router;
