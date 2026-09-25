/**
 * Auto-Moderation API Routes
 * 
 * Manages auto-moderation rules and configurations.
 */

import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { prisma } from '@discord-platform/database';
import { authenticateOrInternal } from '../middleware/auth';
import { ensureGuild } from '../services/ensure';

// Validation schemas
const badWordSchema = z.object({
    word: z.string().min(1),
    severity: z.enum(['low', 'medium', 'high']).default('medium'),
    action: z.enum(['delete', 'warn', 'mute', 'kick', 'ban']).default('delete'),
    isRegex: z.boolean().default(false),
});

const linkScannerSchema = z.object({
    url: z.string().url(),
    type: z.enum(['whitelist', 'blacklist']),
    reason: z.string().optional(),
});

const autoModRuleSchema = z.object({
    name: z.string().min(1),
    type: z.enum(['spam', 'caps', 'mentions', 'emojis', 'links', 'invites']),
    enabled: z.boolean().default(true),
    threshold: z.number().optional(),
    action: z.enum(['delete', 'warn', 'mute', 'kick', 'ban']),
    duration: z.number().optional(),
    exemptRoles: z.array(z.string()).default([]),
    exemptChannels: z.array(z.string()).default([]),
});

const RULE_DEFAULT_ACTIONS: Record<string, string> = {
    spam: 'mute',
    caps: 'delete',
    mentions: 'mute',
    links: 'delete',
    emojis: 'delete',
    invites: 'delete',
};

export async function autoModRoutes(app: FastifyInstance) {
    app.addHook('preHandler', authenticateOrInternal);

    // ============================================================================
    // COMMAND-FACING ALIASES (used by the /automod slash command)
    // ============================================================================

    // Get all auto-mod rules for a guild
    app.get('/guilds/:guildId/automod', async (request, reply) => {
        const { guildId } = request.params as { guildId: string };

        try {
            const rules = await prisma.autoModRule.findMany({
                where: { guildId },
                orderBy: { createdAt: 'desc' },
            });

            return reply.send({
                success: true,
                data: { rules },
            });
        } catch (error) {
            request.log.error({ error, guildId }, 'Failed to fetch auto-mod config');
            return reply.status(500).send({
                success: false,
                error: 'Failed to fetch auto-mod config',
            });
        }
    });

    // Upsert an auto-mod rule by type (spam, caps, mentions, links, ...)
    app.post('/guilds/:guildId/automod/:type', async (request, reply) => {
        const { guildId, type } = request.params as { guildId: string; type: string };
        const { enabled = true, threshold } = (request.body ?? {}) as {
            enabled?: boolean;
            threshold?: number;
        };

        if (!Object.keys(RULE_DEFAULT_ACTIONS).includes(type)) {
            return reply.status(400).send({
                success: false,
                error: `Unknown rule type: ${type}`,
            });
        }

        try {
            await ensureGuild(guildId);

            const existing = await prisma.autoModRule.findFirst({
                where: { guildId, type },
            });

            const rule = existing
                ? await prisma.autoModRule.update({
                    where: { id: existing.id },
                    data: {
                        enabled,
                        ...(threshold !== undefined && { threshold }),
                    },
                })
                : await prisma.autoModRule.create({
                    data: {
                        guildId,
                        name: `${type} detection`,
                        type,
                        enabled,
                        threshold,
                        action: RULE_DEFAULT_ACTIONS[type],
                    },
                });

            return reply.send({
                success: true,
                data: rule,
            });
        } catch (error) {
            request.log.error({ error, guildId, type }, 'Failed to update auto-mod rule');
            return reply.status(500).send({
                success: false,
                error: 'Failed to update auto-mod rule',
            });
        }
    });

    // ============================================================================
    // BAD WORD FILTER
    // ============================================================================

    // Get all bad words
    app.get('/guilds/:guildId/automod/badwords', async (request, reply) => {
        const { guildId } = request.params as { guildId: string };

        try {
            const words = await prisma.badWordFilter.findMany({
                where: { guildId },
                orderBy: { createdAt: 'desc' },
            });

            return reply.send({
                success: true,
                words,
                count: words.length,
            });
        } catch (error) {
            request.log.error({ error, guildId }, 'Failed to fetch bad words');
            return reply.status(500).send({
                success: false,
                error: 'Failed to fetch bad words',
            });
        }
    });

    // Add bad word
    app.post('/guilds/:guildId/automod/badwords', async (request, reply) => {
        const { guildId } = request.params as { guildId: string };
        const data = badWordSchema.parse(request.body);

        try {
            await ensureGuild(guildId);

            const word = await prisma.badWordFilter.create({
                data: {
                    guildId,
                    ...data,
                },
            });

            return reply.status(201).send({
                success: true,
                word,
            });
        } catch (error) {
            request.log.error({ error, guildId }, 'Failed to add bad word');
            return reply.status(500).send({
                success: false,
                error: 'Failed to add bad word',
            });
        }
    });

    // Delete bad word
    app.delete('/guilds/:guildId/automod/badwords/:id', async (request, reply) => {
        const { guildId, id } = request.params as { guildId: string; id: string };

        try {
            await prisma.badWordFilter.delete({
                where: { id, guildId },
            });

            return reply.send({
                success: true,
                message: 'Bad word deleted',
            });
        } catch (error) {
            request.log.error({ error, guildId, id }, 'Failed to delete bad word');
            return reply.status(500).send({
                success: false,
                error: 'Failed to delete bad word',
            });
        }
    });

    // ============================================================================
    // LINK SCANNER
    // ============================================================================

    // Get all scanned links
    app.get('/guilds/:guildId/automod/links', async (request, reply) => {
        const { guildId } = request.params as { guildId: string };
        const { type } = request.query as { type?: string };

        try {
            const where: any = { guildId };
            if (type) where.type = type;

            const links = await prisma.linkScanner.findMany({
                where,
                orderBy: { createdAt: 'desc' },
            });

            return reply.send({
                success: true,
                links,
                count: links.length,
            });
        } catch (error) {
            request.log.error({ error, guildId }, 'Failed to fetch links');
            return reply.status(500).send({
                success: false,
                error: 'Failed to fetch links',
            });
        }
    });

    // Add link to scanner
    app.post('/guilds/:guildId/automod/links', async (request, reply) => {
        const { guildId } = request.params as { guildId: string };
        const data = linkScannerSchema.parse(request.body);

        try {
            await ensureGuild(guildId);

            const link = await prisma.linkScanner.create({
                data: {
                    guildId,
                    ...data,
                },
            });

            return reply.status(201).send({
                success: true,
                link,
            });
        } catch (error) {
            request.log.error({ error, guildId }, 'Failed to add link');
            return reply.status(500).send({
                success: false,
                error: 'Failed to add link',
            });
        }
    });

    // Delete link
    app.delete('/guilds/:guildId/automod/links/:id', async (request, reply) => {
        const { guildId, id } = request.params as { guildId: string; id: string };

        try {
            await prisma.linkScanner.delete({
                where: { id, guildId },
            });

            return reply.send({
                success: true,
                message: 'Link deleted',
            });
        } catch (error) {
            request.log.error({ error, guildId, id }, 'Failed to delete link');
            return reply.status(500).send({
                success: false,
                error: 'Failed to delete link',
            });
        }
    });

    // ============================================================================
    // AUTO-MOD RULES
    // ============================================================================

    // Get all auto-mod rules
    app.get('/guilds/:guildId/automod/rules', async (request, reply) => {
        const { guildId } = request.params as { guildId: string };

        try {
            const rules = await prisma.autoModRule.findMany({
                where: { guildId },
                orderBy: { createdAt: 'desc' },
            });

            return reply.send({
                success: true,
                rules,
                count: rules.length,
            });
        } catch (error) {
            request.log.error({ error, guildId }, 'Failed to fetch auto-mod rules');
            return reply.status(500).send({
                success: false,
                error: 'Failed to fetch auto-mod rules',
            });
        }
    });

    // Create auto-mod rule
    app.post('/guilds/:guildId/automod/rules', async (request, reply) => {
        const { guildId } = request.params as { guildId: string };
        const data = autoModRuleSchema.parse(request.body);

        try {
            await ensureGuild(guildId);

            const rule = await prisma.autoModRule.create({
                data: {
                    guildId,
                    ...data,
                },
            });

            return reply.status(201).send({
                success: true,
                rule,
            });
        } catch (error) {
            request.log.error({ error, guildId }, 'Failed to create auto-mod rule');
            return reply.status(500).send({
                success: false,
                error: 'Failed to create auto-mod rule',
            });
        }
    });

    // Update auto-mod rule
    app.put('/guilds/:guildId/automod/rules/:id', async (request, reply) => {
        const { guildId, id } = request.params as { guildId: string; id: string };
        const data = autoModRuleSchema.partial().parse(request.body);

        try {
            const rule = await prisma.autoModRule.update({
                where: { id, guildId },
                data,
            });

            return reply.send({
                success: true,
                rule,
            });
        } catch (error) {
            request.log.error({ error, guildId, id }, 'Failed to update auto-mod rule');
            return reply.status(500).send({
                success: false,
                error: 'Failed to update auto-mod rule',
            });
        }
    });

    // Delete auto-mod rule
    app.delete('/guilds/:guildId/automod/rules/:id', async (request, reply) => {
        const { guildId, id } = request.params as { guildId: string; id: string };

        try {
            await prisma.autoModRule.delete({
                where: { id, guildId },
            });

            return reply.send({
                success: true,
                message: 'Auto-mod rule deleted',
            });
        } catch (error) {
            request.log.error({ error, guildId, id }, 'Failed to delete auto-mod rule');
            return reply.status(500).send({
                success: false,
                error: 'Failed to delete auto-mod rule',
            });
        }
    });

    // ============================================================================
    // RAID PROTECTION
    // ============================================================================

    // Get raid protection settings
    app.get('/guilds/:guildId/automod/raid-protection', async (request, reply) => {
        const { guildId } = request.params as { guildId: string };

        try {
            const settings = await prisma.raidProtection.findUnique({
                where: { guildId },
            });

            return reply.send({
                success: true,
                settings: settings || null,
            });
        } catch (error) {
            request.log.error({ error, guildId }, 'Failed to fetch raid protection settings');
            return reply.status(500).send({
                success: false,
                error: 'Failed to fetch raid protection settings',
            });
        }
    });

    // Update raid protection settings
    app.put('/guilds/:guildId/automod/raid-protection', async (request, reply) => {
        const { guildId } = request.params as { guildId: string };
        const data = request.body as any;

        try {
            const settings = await prisma.raidProtection.upsert({
                where: { guildId },
                create: {
                    guildId,
                    ...data,
                },
                update: data,
            });

            return reply.send({
                success: true,
                settings,
            });
        } catch (error) {
            request.log.error({ error, guildId }, 'Failed to update raid protection settings');
            return reply.status(500).send({
                success: false,
                error: 'Failed to update raid protection settings',
            });
        }
    });
}
