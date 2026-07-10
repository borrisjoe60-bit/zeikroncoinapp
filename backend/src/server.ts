import express from "express";

const app = express();

app.use(express.json());

app.get("/", (req, res) => {
  res.json({
    name: "Zeikroncoin API",
    version: "1.0.0",
    status: "running"
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Zeikroncoin API running on port ${PORT}`);
});