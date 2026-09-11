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
    origin: process.env.ALLOWED_ORIGINS?.split(",") ?? [],
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
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
