import { Router } from "express";
import prisma from "../prisma/client";

const router = Router();

router.post("/register", async (req, res) => {
  const { email, password } = req.body;

  const user = await prisma.user.create({
    data: {
      email,
      password,
    },
  });

  res.json(user);
});

router.post("/login", async (req, res) => {
  res.json({
    message: "Login coming next"
  });
});

export default router;