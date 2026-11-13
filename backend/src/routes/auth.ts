import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import prisma from "../prisma/client";

const router = Router();
const validEmail = (email: unknown): email is string =>
  typeof email === "string" && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
const getJwtSecret = () => {
  const secret = process.env.JWT_SECRET;
  if (!secret || secret.length < 32) throw new Error("JWT_SECRET must be configured with at least 32 characters");
  return secret;
};

router.post("/register", async (req, res) => {
  try {
    const { email, password } = req.body ?? {};
    if (!validEmail(email) || typeof password !== "string" || password.length < 8 || password.length > 128)
      return res.status(400).json({ success: false, message: "Enter a valid email and a password of 8–128 characters." });
    const normalizedEmail = email.trim().toLowerCase();
    const existingUser = await prisma.user.findUnique({ where: { email: normalizedEmail } });
    if (existingUser) return res.status(409).json({ success: false, message: "An account with this email already exists." });
    const passwordHash = await bcrypt.hash(password, 12);
    const user = await prisma.user.create({ data: { email: normalizedEmail, password: passwordHash } });
    const token = jwt.sign({ sub: user.id, email: user.email }, getJwtSecret(), { expiresIn: "7d" });
    return res.status(201).json({ success: true, message: "Account created successfully.", token, user: { id: user.id, email: user.email } });
  } catch (error) {
    console.error("Registration error:", error);
    return res.status(500).json({ success: false, message: "Unable to create account. Check server configuration." });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body ?? {};
    if (!validEmail(email) || typeof password !== "string" || password.length < 1 || password.length > 128)
      return res.status(400).json({ success: false, message: "Enter a valid email and password." });
    const user = await prisma.user.findUnique({ where: { email: email.trim().toLowerCase() } });
    if (!user || !(await bcrypt.compare(password, user.password)))
      return res.status(401).json({ success: false, message: "Incorrect email or password." });
    const token = jwt.sign({ sub: user.id, email: user.email }, getJwtSecret(), { expiresIn: "7d" });
    return res.status(200).json({ success: true, message: "Signed in successfully.", token, user: { id: user.id, email: user.email } });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ success: false, message: "Unable to sign in. Check server configuration." });
  }
});
export default router;
