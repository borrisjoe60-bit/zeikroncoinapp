import bcrypt from "bcryptjs";
import prisma from "../_lib/prisma";
import { signToken } from "../_lib/jwt";

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") return res.status(405).json({ success: false, message: "Method not allowed" });
  try {
    const { email, password } = req.body ?? {};
    if (typeof email !== "string" || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
        typeof password !== "string" || password.length < 1 || password.length > 128) {
      return res.status(400).json({ success: false, message: "Enter a valid email and password." });
    }
    const user = await prisma.user.findUnique({ where: { email: email.trim().toLowerCase() } });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ success: false, message: "Incorrect email or password." });
    }
    const token = signToken({ id: user.id, email: user.email });
    return res.status(200).json({ success: true, message: "Signed in successfully.", token, user: { id: user.id, email: user.email } });
  } catch (error) {
    console.error("Login error", error);
    return res.status(500).json({ success: false, message: "Unable to sign in. Check backend configuration." });
  }
}
