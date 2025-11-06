import express from "express";
import cors from "cors";
import morgan from "morgan";
import authRoutes from "./routes/auth";
import calcRoutes from "./routes/calculations";

const app = express();

app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

app.get("/", (_req, res) => res.json({ message: "Number Discussions API" }));

app.use("/api/auth", authRoutes);
app.use("/api/calculations", calcRoutes);

// 404
app.use((_req, res) => {
  res.status(404).json({ message: "Not Found" });
});

export default app;
