-- CreateTable
CREATE TABLE "system_config" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "value" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "system_config_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "guilds" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "icon" TEXT,
    "ownerId" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isPremium" BOOLEAN NOT NULL DEFAULT false,
    "premiumTier" INTEGER NOT NULL DEFAULT 0,
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "leftAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "guilds_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "discriminator" TEXT NOT NULL,
    "avatar" TEXT,
    "bot" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "guild_users" (
    "id" TEXT NOT NULL,
    "guildId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "nickname" TEXT,
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "leftAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "guild_users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "modules" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "category" TEXT NOT NULL,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "modules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "guild_modules" (
    "id" TEXT NOT NULL,
    "guildId" TEXT NOT NULL,
    "moduleId" TEXT NOT NULL,
    "isEnabled" BOOLEAN NOT NULL DEFAULT true,
    "config" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "guild_modules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "roles" (
    "id" TEXT NOT NULL,
    "guildId" TEXT NOT NULL,
    "discordId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "color" INTEGER,
    "position" INTEGER NOT NULL DEFAULT 0,
    "permissions" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "roles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "role_assignments" (
    "id" TEXT NOT NULL,
    "roleId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "guildId" TEXT NOT NULL,
    "assignedBy" TEXT,
    "expiresAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "role_assignments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "permissions" (
    "id" TEXT NOT NULL,
    "resource" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "permissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" TEXT NOT NULL,
    "guildId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "resource" TEXT NOT NULL,
    "resourceId" TEXT,
    "changes" JSONB,
    "metadata" JSONB,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "moderation_cases" (
    "id" TEXT NOT NULL,
    "guildId" TEXT NOT NULL,
    "caseNumber" INTEGER NOT NULL,
    "type" TEXT NOT NULL,
    "targetId" TEXT NOT NULL,
    "moderatorId" TEXT NOT NULL,
    "reason" TEXT,
    "duration" INTEGER,
    "expiresAt" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "moderation_cases_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "warnings" (
    "id" TEXT NOT NULL,
    "guildId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "issuedBy" TEXT NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "warnings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "auto_mod_rules" (
    "id" TEXT NOT NULL,
    "guildId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "threshold" INTEGER,
    "action" TEXT NOT NULL,
    "duration" INTEGER,
    "exemptRoles" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "exemptChannels" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "auto_mod_rules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "leveling_config" (
    "id" TEXT NOT NULL,
    "guildId" TEXT NOT NULL,
    "isEnabled" BOOLEAN NOT NULL DEFAULT true,
    "xpPerMessage" INTEGER NOT NULL DEFAULT 10,
    "xpCooldown" INTEGER NOT NULL DEFAULT 60,
    "levelUpMessage" TEXT,
    "levelUpChannel" TEXT,
    "stackRoles" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "leveling_config_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "leveling_data" (
    "id" TEXT NOT NULL,
    "guildId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "xp" INTEGER NOT NULL DEFAULT 0,
    "level" INTEGER NOT NULL DEFAULT 0,
    "messages" INTEGER NOT NULL DEFAULT 0,
    "lastXpAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "leveling_data_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "economy_config" (
    "id" TEXT NOT NULL,
    "guildId" TEXT NOT NULL,
    "isEnabled" BOOLEAN NOT NULL DEFAULT true,
    "currencyName" TEXT NOT NULL DEFAULT 'coins',
    "currencySymbol" TEXT NOT NULL DEFAULT '🪙',
    "startingBalance" INTEGER NOT NULL DEFAULT 100,
    "dailyReward" INTEGER NOT NULL DEFAULT 100,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "economy_config_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "economy_data" (
    "id" TEXT NOT NULL,
    "guildId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "balance" INTEGER NOT NULL DEFAULT 0,
    "bank" INTEGER NOT NULL DEFAULT 0,
    "lastDaily" TIMESTAMP(3),
    "lastWeekly" TIMESTAMP(3),
    "lastMonthly" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "economy_data_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tickets" (
    "id" TEXT NOT NULL,
    "guildId" TEXT NOT NULL,
    "channelId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'open',
    "closedBy" TEXT,
    "closedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tickets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ticket_messages" (
    "id" TEXT NOT NULL,
    "ticketId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ticket_messages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "custom_commands" (
    "id" TEXT NOT NULL,
    "guildId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "response" TEXT NOT NULL,
    "isEnabled" BOOLEAN NOT NULL DEFAULT true,
    "usageCount" INTEGER NOT NULL DEFAULT 0,
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "custom_commands_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "welcome_config" (
    "id" TEXT NOT NULL,
    "guildId" TEXT NOT NULL,
    "isEnabled" BOOLEAN NOT NULL DEFAULT true,
    "channelId" TEXT,
    "message" TEXT,
    "embedEnabled" BOOLEAN NOT NULL DEFAULT false,
    "embedConfig" JSONB,
    "dmEnabled" BOOLEAN NOT NULL DEFAULT false,
    "dmMessage" TEXT,
    "autoRole" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "welcome_config_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sessions" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bad_word_filters" (
    "id" TEXT NOT NULL,
    "guildId" TEXT NOT NULL,
    "word" TEXT NOT NULL,
    "isRegex" BOOLEAN NOT NULL DEFAULT false,
    "severity" TEXT NOT NULL DEFAULT 'medium',
    "action" TEXT NOT NULL DEFAULT 'delete',
    "isEnabled" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "bad_word_filters_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "link_scanners" (
    "id" TEXT NOT NULL,
    "guildId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "reason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "link_scanners_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "image_scanners" (
    "id" TEXT NOT NULL,
    "guildId" TEXT NOT NULL,
    "isEnabled" BOOLEAN NOT NULL DEFAULT false,
    "scanNSFW" BOOLEAN NOT NULL DEFAULT true,
    "threshold" DOUBLE PRECISION NOT NULL DEFAULT 0.7,
    "action" TEXT NOT NULL DEFAULT 'delete',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "image_scanners_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "raid_protection" (
    "id" TEXT NOT NULL,
    "guildId" TEXT NOT NULL,
    "isEnabled" BOOLEAN NOT NULL DEFAULT true,
    "joinThreshold" INTEGER NOT NULL DEFAULT 10,
    "joinWindow" INTEGER NOT NULL DEFAULT 10,
    "action" TEXT NOT NULL DEFAULT 'kick',
    "lockdownOnRaid" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "raid_protection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "channel_lockdowns" (
    "id" TEXT NOT NULL,
    "guildId" TEXT NOT NULL,
    "channelId" TEXT NOT NULL,
    "reason" TEXT,
    "lockedBy" TEXT NOT NULL,
    "lockedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "unlockedAt" TIMESTAMP(3),

    CONSTRAINT "channel_lockdowns_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "moderation_appeals" (
    "id" TEXT NOT NULL,
    "guildId" TEXT NOT NULL,
    "caseNumber" INTEGER NOT NULL,
    "userId" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "reviewedBy" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "moderation_appeals_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "system_config_key_key" ON "system_config"("key");

-- CreateIndex
CREATE INDEX "guild_users_guildId_idx" ON "guild_users"("guildId");

-- CreateIndex
CREATE INDEX "guild_users_userId_idx" ON "guild_users"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "guild_users_guildId_userId_key" ON "guild_users"("guildId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "modules_name_key" ON "modules"("name");

-- CreateIndex
CREATE INDEX "guild_modules_guildId_idx" ON "guild_modules"("guildId");

-- CreateIndex
CREATE INDEX "guild_modules_moduleId_idx" ON "guild_modules"("moduleId");

-- CreateIndex
CREATE UNIQUE INDEX "guild_modules_guildId_moduleId_key" ON "guild_modules"("guildId", "moduleId");

-- CreateIndex
CREATE INDEX "roles_guildId_idx" ON "roles"("guildId");

-- CreateIndex
CREATE UNIQUE INDEX "roles_guildId_discordId_key" ON "roles"("guildId", "discordId");

-- CreateIndex
CREATE INDEX "role_assignments_roleId_idx" ON "role_assignments"("roleId");

-- CreateIndex
CREATE INDEX "role_assignments_userId_idx" ON "role_assignments"("userId");

-- CreateIndex
CREATE INDEX "role_assignments_guildId_idx" ON "role_assignments"("guildId");

-- CreateIndex
CREATE UNIQUE INDEX "permissions_resource_action_key" ON "permissions"("resource", "action");

-- CreateIndex
CREATE INDEX "audit_logs_guildId_idx" ON "audit_logs"("guildId");

-- CreateIndex
CREATE INDEX "audit_logs_userId_idx" ON "audit_logs"("userId");

-- CreateIndex
CREATE INDEX "audit_logs_action_idx" ON "audit_logs"("action");

-- CreateIndex
CREATE INDEX "audit_logs_createdAt_idx" ON "audit_logs"("createdAt");

-- CreateIndex
CREATE INDEX "moderation_cases_guildId_idx" ON "moderation_cases"("guildId");

-- CreateIndex
CREATE INDEX "moderation_cases_targetId_idx" ON "moderation_cases"("targetId");

-- CreateIndex
CREATE INDEX "moderation_cases_moderatorId_idx" ON "moderation_cases"("moderatorId");

-- CreateIndex
CREATE INDEX "moderation_cases_type_idx" ON "moderation_cases"("type");

-- CreateIndex
CREATE INDEX "moderation_cases_isActive_idx" ON "moderation_cases"("isActive");

-- CreateIndex
CREATE UNIQUE INDEX "moderation_cases_guildId_caseNumber_key" ON "moderation_cases"("guildId", "caseNumber");

-- CreateIndex
CREATE INDEX "warnings_guildId_idx" ON "warnings"("guildId");

-- CreateIndex
CREATE INDEX "warnings_userId_idx" ON "warnings"("userId");

-- CreateIndex
CREATE INDEX "auto_mod_rules_guildId_idx" ON "auto_mod_rules"("guildId");

-- CreateIndex
CREATE INDEX "auto_mod_rules_enabled_idx" ON "auto_mod_rules"("enabled");

-- CreateIndex
CREATE UNIQUE INDEX "leveling_config_guildId_key" ON "leveling_config"("guildId");

-- CreateIndex
CREATE INDEX "leveling_data_guildId_idx" ON "leveling_data"("guildId");

-- CreateIndex
CREATE INDEX "leveling_data_userId_idx" ON "leveling_data"("userId");

-- CreateIndex
CREATE INDEX "leveling_data_level_idx" ON "leveling_data"("level");

-- CreateIndex
CREATE UNIQUE INDEX "leveling_data_guildId_userId_key" ON "leveling_data"("guildId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "economy_config_guildId_key" ON "economy_config"("guildId");

-- CreateIndex
CREATE INDEX "economy_data_guildId_idx" ON "economy_data"("guildId");

-- CreateIndex
CREATE INDEX "economy_data_userId_idx" ON "economy_data"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "economy_data_guildId_userId_key" ON "economy_data"("guildId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "tickets_channelId_key" ON "tickets"("channelId");

-- CreateIndex
CREATE INDEX "tickets_guildId_idx" ON "tickets"("guildId");

-- CreateIndex
CREATE INDEX "tickets_userId_idx" ON "tickets"("userId");

-- CreateIndex
CREATE INDEX "tickets_status_idx" ON "tickets"("status");

-- CreateIndex
CREATE INDEX "ticket_messages_ticketId_idx" ON "ticket_messages"("ticketId");

-- CreateIndex
CREATE INDEX "custom_commands_guildId_idx" ON "custom_commands"("guildId");

-- CreateIndex
CREATE UNIQUE INDEX "custom_commands_guildId_name_key" ON "custom_commands"("guildId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "welcome_config_guildId_key" ON "welcome_config"("guildId");

-- CreateIndex
CREATE UNIQUE INDEX "sessions_token_key" ON "sessions"("token");

-- CreateIndex
CREATE INDEX "sessions_userId_idx" ON "sessions"("userId");

-- CreateIndex
CREATE INDEX "sessions_token_idx" ON "sessions"("token");

-- CreateIndex
CREATE INDEX "sessions_expiresAt_idx" ON "sessions"("expiresAt");

-- CreateIndex
CREATE INDEX "bad_word_filters_guildId_idx" ON "bad_word_filters"("guildId");

-- CreateIndex
CREATE INDEX "bad_word_filters_isEnabled_idx" ON "bad_word_filters"("isEnabled");

-- CreateIndex
CREATE UNIQUE INDEX "link_scanners_guildId_key" ON "link_scanners"("guildId");

-- CreateIndex
CREATE UNIQUE INDEX "image_scanners_guildId_key" ON "image_scanners"("guildId");

-- CreateIndex
CREATE UNIQUE INDEX "raid_protection_guildId_key" ON "raid_protection"("guildId");

-- CreateIndex
CREATE INDEX "channel_lockdowns_guildId_idx" ON "channel_lockdowns"("guildId");

-- CreateIndex
CREATE INDEX "channel_lockdowns_channelId_idx" ON "channel_lockdowns"("channelId");

-- CreateIndex
CREATE INDEX "moderation_appeals_guildId_idx" ON "moderation_appeals"("guildId");

-- CreateIndex
CREATE INDEX "moderation_appeals_userId_idx" ON "moderation_appeals"("userId");

-- CreateIndex
CREATE INDEX "moderation_appeals_status_idx" ON "moderation_appeals"("status");

-- AddForeignKey
ALTER TABLE "guild_users" ADD CONSTRAINT "guild_users_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "guild_users" ADD CONSTRAINT "guild_users_guildId_fkey" FOREIGN KEY ("guildId") REFERENCES "guilds"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "guild_modules" ADD CONSTRAINT "guild_modules_guildId_fkey" FOREIGN KEY ("guildId") REFERENCES "guilds"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "guild_modules" ADD CONSTRAINT "guild_modules_moduleId_fkey" FOREIGN KEY ("moduleId") REFERENCES "modules"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "roles" ADD CONSTRAINT "roles_guildId_fkey" FOREIGN KEY ("guildId") REFERENCES "guilds"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "role_assignments" ADD CONSTRAINT "role_assignments_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "roles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_guildId_fkey" FOREIGN KEY ("guildId") REFERENCES "guilds"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "moderation_cases" ADD CONSTRAINT "moderation_cases_guildId_fkey" FOREIGN KEY ("guildId") REFERENCES "guilds"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "moderation_cases" ADD CONSTRAINT "moderation_cases_targetId_fkey" FOREIGN KEY ("targetId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "moderation_cases" ADD CONSTRAINT "moderation_cases_moderatorId_fkey" FOREIGN KEY ("moderatorId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "warnings" ADD CONSTRAINT "warnings_guildId_fkey" FOREIGN KEY ("guildId") REFERENCES "guilds"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "warnings" ADD CONSTRAINT "warnings_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "auto_mod_rules" ADD CONSTRAINT "auto_mod_rules_guildId_fkey" FOREIGN KEY ("guildId") REFERENCES "guilds"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "leveling_config" ADD CONSTRAINT "leveling_config_guildId_fkey" FOREIGN KEY ("guildId") REFERENCES "guilds"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "leveling_data" ADD CONSTRAINT "leveling_data_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "economy_config" ADD CONSTRAINT "economy_config_guildId_fkey" FOREIGN KEY ("guildId") REFERENCES "guilds"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "economy_data" ADD CONSTRAINT "economy_data_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tickets" ADD CONSTRAINT "tickets_guildId_fkey" FOREIGN KEY ("guildId") REFERENCES "guilds"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ticket_messages" ADD CONSTRAINT "ticket_messages_ticketId_fkey" FOREIGN KEY ("ticketId") REFERENCES "tickets"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "custom_commands" ADD CONSTRAINT "custom_commands_guildId_fkey" FOREIGN KEY ("guildId") REFERENCES "guilds"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "welcome_config" ADD CONSTRAINT "welcome_config_guildId_fkey" FOREIGN KEY ("guildId") REFERENCES "guilds"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bad_word_filters" ADD CONSTRAINT "bad_word_filters_guildId_fkey" FOREIGN KEY ("guildId") REFERENCES "guilds"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "link_scanners" ADD CONSTRAINT "link_scanners_guildId_fkey" FOREIGN KEY ("guildId") REFERENCES "guilds"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "image_scanners" ADD CONSTRAINT "image_scanners_guildId_fkey" FOREIGN KEY ("guildId") REFERENCES "guilds"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "raid_protection" ADD CONSTRAINT "raid_protection_guildId_fkey" FOREIGN KEY ("guildId") REFERENCES "guilds"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "channel_lockdowns" ADD CONSTRAINT "channel_lockdowns_guildId_fkey" FOREIGN KEY ("guildId") REFERENCES "guilds"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "moderation_appeals" ADD CONSTRAINT "moderation_appeals_guildId_fkey" FOREIGN KEY ("guildId") REFERENCES "guilds"("id") ON DELETE CASCADE ON UPDATE CASCADE;
