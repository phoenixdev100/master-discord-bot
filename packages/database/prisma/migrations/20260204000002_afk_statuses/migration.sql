-- CreateTable
CREATE TABLE "afk_statuses" (
    "id" TEXT NOT NULL,
    "guildId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "reason" TEXT NOT NULL DEFAULT 'AFK',
    "since" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "afk_statuses_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "afk_statuses_guildId_userId_key" ON "afk_statuses"("guildId", "userId");

-- AddForeignKey
ALTER TABLE "afk_statuses" ADD CONSTRAINT "afk_statuses_guildId_fkey" FOREIGN KEY ("guildId") REFERENCES "guilds"("id") ON DELETE CASCADE ON UPDATE CASCADE;
