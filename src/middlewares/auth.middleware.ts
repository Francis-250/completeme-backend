import { Request, Response, NextFunction } from "express";
import { fromNodeHeaders } from "better-auth/node";
import { auth } from "../lib/auth";

export const requireAuth = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const session = await auth.api.getSession({
      headers: fromNodeHeaders(req.headers),
    });

    if (!session) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    req.user = session.user;
    req.session = session.session;

    next();
  } catch (error) {
    console.error("Authentication error:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

export const requireRole = (role: string | string[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const session = await auth.api.getSession({
        headers: fromNodeHeaders(req.headers),
      });

      if (!session) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      req.user = session.user;
      req.session = session.session;

      const userRole = session.user.role;
      const allowedRoles = Array.isArray(role) ? role : [role];

      if (!userRole || !allowedRoles.includes(userRole)) {
        return res.status(403).json({
          error: "Forbidden",
          message: `Required role: ${allowedRoles.join(" or ")}`,
        });
      }

      next();
    } catch (error) {
      console.error("Authorization error:", error);
      return res.status(500).json({ error: "Internal Server Error" });
    }
  };
};
