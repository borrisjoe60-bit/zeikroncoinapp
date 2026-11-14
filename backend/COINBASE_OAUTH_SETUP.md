# Coinbase read-only OAuth setup

Each Zicron user authorizes their own Coinbase account. This integration does not use the platform owner's Coinbase API key and does not implement trading, transfers, sends, or withdrawals.

## Server environment variables

- `DATABASE_URL`: PostgreSQL connection string.
- `JWT_SECRET`: existing Zicron JWT signing secret (at least 32 characters).
- `FRONTEND_URL`: exact Zicron frontend origin.
- `COINBASE_CLIENT_ID`: Coinbase OAuth client ID.
- `COINBASE_CLIENT_SECRET`: Coinbase OAuth client secret; server only.
- `COINBASE_TOKEN_ENCRYPTION_KEY`: base64-encoded 32-byte random key for AES-256-GCM encryption.
- `COINBASE_REDIRECT_URI`: exact callback URL, e.g. `https://YOUR-API-HOST/api/coinbase/callback`.
- `NODE_ENV=production`.

Never put real credentials in Git or frontend Vite variables.

## Coinbase app configuration

Register the exact `COINBASE_REDIRECT_URI` in the Coinbase OAuth app's allowed redirect URI list. It must use HTTPS and match exactly.

Requested scopes: `wallet:accounts:read`, `wallet:transactions:read`, and `offline_access`. No write scopes are requested.

## Vercel deployment

Create a separate Vercel project linked to this repository with root directory `backend` and framework Express. The serverless entrypoint is `api/index.ts`. Configure the environment variables above, then run the Prisma migration against the production database before testing OAuth.

## Routes

- `GET /api/coinbase/connect`: requires a Zicron bearer token; returns the Coinbase authorization URL and sets short-lived HTTP-only state and user-binding cookies.
- `GET /api/coinbase/callback`: validates state, exchanges the authorization code server-side, encrypts access/refresh tokens with AES-256-GCM, and associates them with the signed-in Zicron user.

This is the initial consent-and-token-storage implementation, not a complete production integration. Before customer launch, add token refresh/rotation, disconnect/revocation, a read-only account-data endpoint, rate limits, and an end-to-end test.
