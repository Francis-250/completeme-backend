import "dotenv/config";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();
const port = process.env.PORT;

app.use(
  cors({
    origin: process.env.ALLOWED_ORIGINS?.split(",") ?? false,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    credentials: true,
  }),
);

app.use(express.json());
app.use(cookieParser());

app.listen(port, () => {
  console.log(`https://localhost:${port}`);
});
