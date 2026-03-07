/**
 * Auto-Moderation API Routes
 * 
 * Manages auto-moderation rules and configurations.
 */

import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { prisma } from '@discord-platform/database';

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

export async function autoModRoutes(app: FastifyInstance) {
    // ============================================================================
    // BAD WORD FILTER
    // ============================================================================

    // Get all bad words
    app.get('/api/guilds/:guildId/automod/badwords', async (request, reply) => {
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
    app.post('/api/guilds/:guildId/automod/badwords', async (request, reply) => {
        const { guildId } = request.params as { guildId: string };
        const data = badWordSchema.parse(request.body);

        try {
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
    app.delete('/api/guilds/:guildId/automod/badwords/:id', async (request, reply) => {
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
    app.get('/api/guilds/:guildId/automod/links', async (request, reply) => {
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
    app.post('/api/guilds/:guildId/automod/links', async (request, reply) => {
        const { guildId } = request.params as { guildId: string };
        const data = linkScannerSchema.parse(request.body);

        try {
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
    app.delete('/api/guilds/:guildId/automod/links/:id', async (request, reply) => {
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
    app.get('/api/guilds/:guildId/automod/rules', async (request, reply) => {
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
    app.post('/api/guilds/:guildId/automod/rules', async (request, reply) => {
        const { guildId } = request.params as { guildId: string };
        const data = autoModRuleSchema.parse(request.body);

        try {
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
    app.put('/api/guilds/:guildId/automod/rules/:id', async (request, reply) => {
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
    app.delete('/api/guilds/:guildId/automod/rules/:id', async (request, reply) => {
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
    app.get('/api/guilds/:guildId/automod/raid-protection', async (request, reply) => {
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
    app.put('/api/guilds/:guildId/automod/raid-protection', async (request, reply) => {
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
