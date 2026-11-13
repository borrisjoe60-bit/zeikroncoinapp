import jwt from "jsonwebtoken";
export function signToken(user: { id: string; email: string }) {
  const secret = process.env.JWT_SECRET;
  if (!secret || secret.length < 32) throw new Error("JWT_SECRET must be configured with at least 32 characters");
  return jwt.sign({ sub: user.id, email: user.email }, secret, { expiresIn: "7d" });
}
