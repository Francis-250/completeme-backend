import "dotenv/config";
import express from "express";
import cors from "cors";
import { toNodeHandler } from "better-auth/node";
import { auth } from "./lib/auth";
import swaggerRouter, { generateOpenAPISchema } from "./docs/swagger";

import routers from "./routes";
import { initAlertCron } from "./cron/alert.cron";

const app = express();
app.set("trust proxy", 1);
if (!process.env.PORT) {
  throw new Error("PORT environment variable must be defined");
}
const port = process.env.PORT;

const allowedOrigins = Array.from(
  new Set([
    ...(process.env.ALLOWED_ORIGINS
      ? process.env.ALLOWED_ORIGINS.split(",").map((o) => o.trim().replace(/\/$/, ""))
      : []),
    ...(process.env.FRONTEND_URL ? [process.env.FRONTEND_URL.trim().replace(/\/$/, "")] : []),
  ]),
);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      const cleanOrigin = origin.replace(/\/$/, "");
      if (
        allowedOrigins.includes(origin) ||
        allowedOrigins.includes(cleanOrigin) ||
        (process.env.NODE_ENV !== "production" &&
          (origin.startsWith("http://localhost:") ||
            origin.startsWith("http://127.0.0.1:")))
      ) {
        return callback(null, true);
      }
      return callback(new Error("Not allowed by CORS"));
    },
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    credentials: true,
  }),
);

app.all("/api/auth/*splat", toNodeHandler(auth));

app.get("/callback", (req, res) => {
  const targetOrigin =
    process.env.FRONTEND_URL ||
    (process.env.ALLOWED_ORIGINS
      ? process.env.ALLOWED_ORIGINS.split(",")[0].trim()
      : "") ||
    (req.headers.origin as string) ||
    "";
  const query = req.url.includes("?") ? req.url.slice(req.url.indexOf("?")) : "";
  if (targetOrigin) {
    res.redirect(`${targetOrigin}/callback${query}`);
  } else {
    res.redirect(`/`);
  }
});

app.use(express.json());

app.use("/api-docs", swaggerRouter);

app.get("/api-docs.json", async (req, res) => {
  const schema = await generateOpenAPISchema();
  res.json(schema);
});

app.get("/health", (_req, res) => {
  res.status(200).json({ status: "ok", timestamp: new Date().toISOString() });
});

app.use("/api", routers);

app.use(
  (
    err: any,
    _req: express.Request,
    res: express.Response,
    _next: express.NextFunction,
  ) => {
    console.error("Global express error:", err);
    const status =
      err.status || err.statusCode || (err.name === "MulterError" ? 400 : 500);
    return res.status(status).json({
      success: false,
      message: err.message || "An unexpected error occurred",
    });
  },
);

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
  initAlertCron();
});

