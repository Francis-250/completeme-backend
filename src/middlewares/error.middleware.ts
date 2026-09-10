import { Request, Response, NextFunction } from "express";
import { AppError } from "../utils/error-response";
import { env } from "../config/env";

export function errorMiddleware(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction,
) {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({ message: err.message });
  }

  console.error(err);
  res.status(500).json({
    message: env.isProduction ? "Something went wrong" : err.message,
  });
}
