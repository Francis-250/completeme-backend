import { Request, Response } from "express";
import { UserService } from "../services/user.service";

export class UserController {
  constructor(private userService: UserService) {}

  async getAllUsers(req: Request, res: Response) {
    try {
      const users = await this.userService.getAllUsers();

      res.status(200).json({
        success: true,
        data: users,
        count: users.length,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Error fetching users",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }
}
