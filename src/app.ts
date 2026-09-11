import "dotenv/config";
import express from "express";
import cors from "cors";
import { toNodeHandler } from "better-auth/node";
import { auth } from "./lib/auth";
import swaggerRouter, { generateOpenAPISchema } from "./docs/swagger";

import routers from "./routes";

const app = express();
const port = process.env.PORT;

app.use(
  cors({
    origin: process.env.ALLOWED_ORIGINS
      ? process.env.ALLOWED_ORIGINS.split(",").map((o) => o.trim())
      : ["http://localhost:3000", "http://localhost:5000"],
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    credentials: true,
  }),
);

app.all("/api/auth/*splat", toNodeHandler(auth));

app.use(express.json());

app.use("/api-docs", swaggerRouter);

app.get("/api-docs.json", async (req, res) => {
  const schema = await generateOpenAPISchema();
  res.json(schema);
});

app.use("/api", routers);

app.listen(port, () => {
  console.log(`http://localhost:${port}`);
});
