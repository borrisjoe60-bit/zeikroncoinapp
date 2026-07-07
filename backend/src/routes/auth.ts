import { Router } from "express";

const router = Router();

router.post("/register", async (req, res) => {
  const { email } = req.body;

  res.status(201).json({
    success: true,
    message: "User registered successfully",
    user: {
      email
    }
  });
});

router.post("/login", async (req, res) => {
  const { email } = req.body;

  res.json({
    success: true,
    token: "sample-jwt-token",
    user: {
      email
    }
  });
});

export default router;