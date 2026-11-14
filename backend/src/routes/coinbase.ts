import { Router, Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { createCipheriv, randomBytes, timingSafeEqual } from "node:crypto";
import prisma from "../prisma/client";

const router = Router();
const STATE_COOKIE = "zicron_coinbase_oauth_state";
const REQUIRED_SCOPES = ["wallet:accounts:read", "wallet:transactions:read", "offline_access"];

function requiredEnv(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`${name} is not configured`);
  return value;
}

function authenticate(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) return res.status(401).json({ error: "Sign in to Zicron first." });
  try {
    const payload = jwt.verify(header.slice(7), requiredEnv("JWT_SECRET")) as jwt.JwtPayload;
    if (typeof payload.sub !== "string") return res.status(401).json({ error: "Invalid session." });
    res.locals.userId = payload.sub;
    return next();
  } catch {
    return res.status(401).json({ error: "Your Zicron session has expired. Sign in again." });
  }
}

function encryptTokens(value: string): string {
  const key = Buffer.from(requiredEnv("COINBASE_TOKEN_ENCRYPTION_KEY"), "base64");
  if (key.length !== 32) throw new Error("COINBASE_TOKEN_ENCRYPTION_KEY must be a base64-encoded 32-byte key");
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", key, iv);
  const ciphertext = Buffer.concat([cipher.update(value, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return [iv, tag, ciphertext].map((part) => part.toString("base64")).join(".");
}

function cookieValue(header: string | undefined, name: string): string | undefined {
  return header?.split(";").map((part) => part.trim()).find((part) => part.startsWith(name + "="))?.slice(name.length + 1);
}

router.get("/connect", authenticate, (req, res) => {
  try {
    const clientId = requiredEnv("COINBASE_CLIENT_ID");
    const redirectUri = requiredEnv("COINBASE_REDIRECT_URI");
    const state = randomBytes(32).toString("hex");
    res.cookie(STATE_COOKIE, state, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 10 * 60 * 1000,
      path: "/api/coinbase/callback",
    });
    const params = new URLSearchParams({
      response_type: "code",
      client_id: clientId,
      redirect_uri: redirectUri,
      scope: REQUIRED_SCOPES.join(","),
      state,
    });
    return res.json({ authorizationUrl: `https://login.coinbase.com/oauth2/auth?${params.toString()}` });
  } catch (error) {
    console.error("Coinbase OAuth configuration error:", error);
    return res.status(503).json({ error: "Coinbase connection is not configured yet." });
  }
});

router.get("/callback", async (req, res) => {
  const frontend = process.env.FRONTEND_URL;
  const fail = (reason: string) => res.redirect(`${frontend || "/"}${frontend ? "/settings/connections?coinbase=error&reason=" : "?coinbase=error&reason="}${encodeURIComponent(reason)}`);
  try {
    if (typeof req.query.error === "string") return fail("authorization_denied");
    const code = req.query.code;
    const state = req.query.state;
    const cookieState = cookieValue(req.headers.cookie, STATE_COOKIE);
    res.clearCookie(STATE_COOKIE, { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/api/coinbase/callback" });
    if (typeof code !== "string" || typeof state !== "string" || !cookieState) return fail("invalid_callback");
    const a = Buffer.from(state);
    const b = Buffer.from(decodeURIComponent(cookieState));
    if (a.length !== b.length || !timingSafeEqual(a, b)) return fail("state_check_failed");

    const tokenResponse = await fetch("https://login.coinbase.com/oauth2/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded", Accept: "application/json" },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        code,
        client_id: requiredEnv("COINBASE_CLIENT_ID"),
        client_secret: requiredEnv("COINBASE_CLIENT_SECRET"),
        redirect_uri: requiredEnv("COINBASE_REDIRECT_URI"),
      }),
    });
    if (!tokenResponse.ok) {
      console.error("Coinbase token exchange failed with status:", tokenResponse.status);
      return fail("token_exchange_failed");
    }
    const tokens = await tokenResponse.json() as {
      access_token?: string; refresh_token?: string; expires_in?: number; scope?: string;
    };
    if (!tokens.access_token || !tokens.refresh_token) return fail("missing_tokens");
    const match = state.match(/^[a-f0-9]{64}$/);
    if (!match) return fail("invalid_state");

    // State is bound to the signed-in Zicron user through a short-lived server-side session.
    // A user ID is supplied in the state cookie in a separate signed value below.
    const signedState = cookieValue(req.headers.cookie, STATE_COOKIE + "_user");
    if (!signedState) return fail("missing_user_binding");
    const userPayload = jwt.verify(decodeURIComponent(signedState), requiredEnv("JWT_SECRET")) as jwt.JwtPayload;
    if (typeof userPayload.sub !== "string") return fail("invalid_user_binding");

    const scopes = typeof tokens.scope === "string" ? tokens.scope : REQUIRED_SCOPES.join(",");
    await prisma.coinbaseOAuthConnection.upsert({
      where: { userId: userPayload.sub },
      create: {
        userId: userPayload.sub,
        encryptedTokens: encryptTokens(JSON.stringify({ access_token: tokens.access_token, refresh_token: tokens.refresh_token })),
        scopes,
        expiresAt: new Date(Date.now() + Math.max(60, tokens.expires_in || 3600) * 1000),
      },
      update: {
        encryptedTokens: encryptTokens(JSON.stringify({ access_token: tokens.access_token, refresh_token: tokens.refresh_token })),
        scopes,
        expiresAt: new Date(Date.now() + Math.max(60, tokens.expires_in || 3600) * 1000),
      },
    });
    return res.redirect(`${frontend || "/"}${frontend ? "/settings/connections?coinbase=connected" : "?coinbase=connected"}`);
  } catch (error) {
    console.error("Coinbase OAuth callback error:", error);
    return fail("callback_failed");
  }
});

export default router;
