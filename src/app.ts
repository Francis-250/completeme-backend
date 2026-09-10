import express from "express";
import cookieParser from "cookie-parser";
import { corsMiddleware } from "./config/cors";
import router from "./routes";
import { errorMiddleware } from "./middlewares/error.middleware";

const app = express();

app.use(corsMiddleware);
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/health", (_req, res) => {
  res.status(200).json({ status: "ok" });
});

app.use("/api", router);

app.use((_req, res) => {
  res.status(404).json({ message: "Route not found" });
});

app.use(errorMiddleware);

export default app;
