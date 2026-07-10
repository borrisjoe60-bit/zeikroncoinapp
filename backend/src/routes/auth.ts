import { Router } from "express";

const router = Router();

router.post("/register", (req, res) => {
  res.json({
    success: true,
    message: "User registration endpoint"
  });
});

router.post("/login", (req, res) => {
  res.json({
    success: true,
    message: "User login endpoint"
  });
});

export default router;