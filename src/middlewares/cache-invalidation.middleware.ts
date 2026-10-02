import type { NextFunction, Request, Response } from "express";
import { invalidateAppCaches } from "../lib/redis";

const INVALIDATING_PREFIXES = [
  "/products",
  "/categories",
  "/brands",
  "/collections",
  "/tags",
  "/deals",
  "/settings",
  "/coupons",
  "/blog",
  "/media",
  "/orders",
  "/payments",
  "/shipments",
  "/vendors",
  "/customers",
  "/reviews",
];

export function invalidateCacheAfterWrite(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  res.setHeader("Cache-Control", "no-store");

  if (req.method === "GET" || req.method === "HEAD" || req.method === "OPTIONS") {
    return next();
  }

  const shouldInvalidate = INVALIDATING_PREFIXES.some((prefix) =>
    req.path.startsWith(prefix),
  );

  if (!shouldInvalidate) {
    return next();
  }

  res.on("finish", () => {
    if (res.statusCode >= 200 && res.statusCode < 400) {
      void invalidateAppCaches();
    }
  });

  return next();
}
