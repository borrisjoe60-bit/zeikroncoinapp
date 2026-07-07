import express from "express";
import cors from "cors";
import helmet from "helmet";
import authRoutes from "./routes/auth";
const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(helmet());
app.use(express.json());
app.use("/api/auth", authRoutes);
app.get("/", (req, res) => {
  res.json({
    name: "Zeikroncoin API",
    version: "1.0.0",
    status: "running"
  });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});