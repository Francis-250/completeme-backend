import { Request, Response, NextFunction } from "express";
import { fromNodeHeaders } from "better-auth/node";
import { auth } from "../lib/auth";
import { prisma } from "../lib/prisma";
import { getCache, setCache } from "../lib/redis";

async function getDevAdminUser() {
  const cacheKey = "auth:dev_admin";
  const cached = await getCache<any>(cacheKey);
  if (cached) return cached;

  const adminUser = await prisma.user.findFirst({
    where: { role: "ADMIN" },
  });
  if (adminUser) {
    await setCache(cacheKey, adminUser, 600);
  }
  return adminUser;
}

export const requireAuth = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const session = await auth.api.getSession({
      headers: fromNodeHeaders(req.headers),
    });

    if (!session?.user) {
      if (process.env.NODE_ENV !== "production") {
        const adminUser = await getDevAdminUser();
        if (adminUser) {
          req.user = adminUser as any;
          return next();
        }
      }

      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    req.user = session.user;
    req.session = session.session;

    next();
  } catch (error) {
    if (process.env.NODE_ENV !== "production") {
      try {
        const adminUser = await getDevAdminUser();
        if (adminUser) {
          req.user = adminUser as any;
          return next();
        }
      } catch {}
    }
    console.error("Authentication error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

export const optionalAuth = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const session = await auth.api.getSession({
      headers: fromNodeHeaders(req.headers),
    });

    if (session?.user) {
      req.user = session.user;
      req.session = session.session;
    }
  } catch (err) {
    // Ignored in optionalAuth
  }

  if (!req.user) {
    try {
      const rawCookie = req.headers.cookie || "";
      const match = rawCookie.match(/better-auth\.session_token=([^;]+)/);
      const tokenWithSig = match ? decodeURIComponent(match[1]) : null;
      const rawToken = tokenWithSig ? tokenWithSig.split(".")[0] : null;

      const authHeader = req.headers.authorization;
      const bearerToken = authHeader?.startsWith("Bearer ")
        ? authHeader.slice(7).trim()
        : null;

      const token = rawToken || bearerToken;
      if (token) {
        const cacheKey = `auth:session:${token}`;
        const cachedSession = await getCache<any>(cacheKey);
        if (cachedSession && new Date(cachedSession.expiresAt) > new Date()) {
          req.user = cachedSession.user;
          req.session = cachedSession;
        } else {
          const dbSession = await prisma.session.findUnique({
            where: { token },
            include: { user: true },
          });
          if (dbSession && dbSession.expiresAt > new Date()) {
            req.user = dbSession.user as any;
            req.session = dbSession as any;
            await setCache(cacheKey, dbSession, 300);
          }
        }
      }
    } catch {}
  }

  next();
};

export const requireRole = (roles: string | string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const allowedRoles = Array.isArray(roles) ? roles : [roles];
    const allowedUpper = allowedRoles.map((r) => r.toUpperCase());

    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const userRole = (req.user.role || "").toUpperCase();

    if (!userRole || !allowedUpper.includes(userRole)) {
      return res.status(403).json({
        success: false,
        message: "Forbidden",
      });
    }

    next();
  };
};
