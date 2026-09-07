import "dotenv/config";
import express from "express";
import cors from "cors";

const app = express();
const port = process.env.PORT;

app.use(
  cors({
    origin: ["http://localhost:5173", "http://localhost:5174"],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  }),
);

app.use(express.json());

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
