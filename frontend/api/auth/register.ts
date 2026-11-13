import bcrypt from "bcryptjs";
import prisma from "../_lib/prisma";
import { signToken } from "../_lib/jwt";

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") return res.status(405).json({ success: false, message: "Method not allowed" });
  try {
    const { email, password } = req.body ?? {};
    if (typeof email !== "string" || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
        typeof password !== "string" || password.length < 8 || password.length > 128) {
      return res.status(400).json({ success: false, message: "Enter a valid email and a password of 8–128 characters." });
    }
    const normalizedEmail = email.trim().toLowerCase();
    const existing = await prisma.user.findUnique({ where: { email: normalizedEmail } });
    if (existing) return res.status(409).json({ success: false, message: "An account with this email already exists." });
    const hash = await bcrypt.hash(password, 12);
    const user = await prisma.user.create({ data: { email: normalizedEmail, password: hash } });
    const token = signToken({ id: user.id, email: user.email });
    return res.status(201).json({ success: true, message: "Account created successfully.", token, user: { id: user.id, email: user.email } });
  } catch (error) {
    console.error("Registration error", error);
    return res.status(500).json({ success: false, message: "Unable to create account. Check backend configuration." });
  }
}
