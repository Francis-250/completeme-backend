import { Request, Response, NextFunction } from "express";
import { verifyToken } from "../lib/jwt";
import { AppError } from "../utils/error-response";

export function authMiddleware(
  req: Request,
  _res: Response,
  next: NextFunction,
) {
  const token = req.cookies?.token;

  if (!token) {
    return next(new AppError("Not authenticated", 401));
  }

  try {
    const payload = verifyToken(token);
    req.user = { userId: payload.userId };
    next();
  } catch {
    next(new AppError("Invalid or expired session", 401));
  }
}
