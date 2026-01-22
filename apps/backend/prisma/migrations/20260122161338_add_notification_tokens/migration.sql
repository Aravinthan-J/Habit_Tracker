-- CreateTable
CREATE TABLE "notification_tokens" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "deviceId" TEXT,
    "platform" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "notification_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "notification_tokens_token_key" ON "notification_tokens"("token");

-- CreateIndex
CREATE INDEX "notification_tokens_userId_idx" ON "notification_tokens"("userId");

-- AddForeignKey
ALTER TABLE "notification_tokens" ADD CONSTRAINT "notification_tokens_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
