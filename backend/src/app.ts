import express from "express";
import cors from "cors";
import helmet from "helmet";
import authRoutes from "./routes/auth";

const app = express();
app.use(helmet());
app.use(cors({ origin: process.env.FRONTEND_URL || "*" }));
app.use(express.json({ limit: "10kb" }));
app.get("/", (_req, res) => res.status(200).json({ name: "Ziekroncoin API", version: "1.0.0", status: "running" }));
app.get("/api/health", (_req, res) => res.status(200).json({ ok: true, service: "ziekroncoin-api" }));
app.use("/api/auth", authRoutes);
export default app;
