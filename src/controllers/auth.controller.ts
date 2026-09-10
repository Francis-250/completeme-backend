import { Request, Response } from "express";
import { authService } from "../services/auth.service";
import { asyncHandler } from "../utils/async-handler";
import { env } from "../config/env";

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: env.isProduction,
  sameSite: env.isProduction ? ("none" as const) : ("lax" as const),
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

export const authController = {
  register: asyncHandler(async (req: Request, res: Response) => {
    const { token, user } = await authService.register(req.body);
    res.cookie("token", token, COOKIE_OPTIONS);
    res.status(201).json({ user });
  }),

  login: asyncHandler(async (req: Request, res: Response) => {
    const { token, user } = await authService.login(req.body);
    res.cookie("token", token, COOKIE_OPTIONS);
    res.json({ user });
  }),

  logout: asyncHandler(async (_req: Request, res: Response) => {
    res.clearCookie("token", COOKIE_OPTIONS);
    res.status(204).send();
  }),

  getMe: asyncHandler(async (req: Request, res: Response) => {
    const user = await authService.getUser(req.user!.userId);
    res.json({ user });
  }),
};
