ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "firstName" TEXT;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "lastName" TEXT;

CREATE TABLE "CoinbaseOAuthConnection" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "encryptedTokens" TEXT NOT NULL,
    "scopes" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "CoinbaseOAuthConnection_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "CoinbaseOAuthConnection_userId_key" ON "CoinbaseOAuthConnection"("userId");
ALTER TABLE "CoinbaseOAuthConnection" ADD CONSTRAINT "CoinbaseOAuthConnection_userId_fkey"
FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
