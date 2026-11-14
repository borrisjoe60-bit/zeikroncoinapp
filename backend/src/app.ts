import express from "express";
import cors from "cors";
import helmet from "helmet";
import authRoutes from "./routes/auth";
import coinbaseRoutes from "./routes/coinbase";

const app = express();
app.use(helmet());
app.use(cors({ origin: process.env.FRONTEND_URL || "*", credentials: true }));
app.use(express.json({ limit: "10kb" }));
app.get("/", (_req, res) => res.status(200).json({ name: "Zicron API", version: "1.0.0", status: "running" }));
app.get("/api/health", (_req, res) => res.status(200).json({ ok: true, service: "zicron-api" }));
app.use("/api/auth", authRoutes);
app.use("/api/coinbase", coinbaseRoutes);
export default app;
