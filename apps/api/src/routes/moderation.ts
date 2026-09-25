/**
 * Moderation API Routes (Simplified Version)
 * 
 * Handles all moderation actions. Middleware will be added later.
 * For now, routes work without authentication for testing.
 */

import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { prisma } from '@discord-platform/database';
import { authenticateOrInternal } from '../middleware/auth';
import { ensureGuild, ensureUser } from '../services/ensure';

// Validation schemas
const banUserSchema = z.object({
    userId: z.string(),
    moderatorId: z.string(),
    reason: z.string().optional(),
    duration: z.number().optional(), // Seconds (for temp ban)
    deleteMessageDays: z.number().min(0).max(7).default(0),
});

const kickUserSchema = z.object({
    userId: z.string(),
    moderatorId: z.string(),
    reason: z.string().optional(),
});

const muteUserSchema = z.object({
    userId: z.string(),
    moderatorId: z.string(),
    reason: z.string().optional(),
    duration: z.number().optional(), // Seconds
});

const warnUserSchema = z.object({
    userId: z.string(),
    moderatorId: z.string(),
    reason: z.string(),
});

const updateCaseSchema = z.object({
    reason: z.string().optional(),
    isActive: z.boolean().optional(),
});

export async function moderationRoutes(app: FastifyInstance) {
    app.addHook('preHandler', authenticateOrInternal);

    // ============================================================================
    // BAN USER
    // ============================================================================

    app.post('/guilds/:guildId/moderation/ban', async (request, reply) => {
        const { guildId } = request.params as { guildId: string };
        const body = banUserSchema.parse(request.body);
        const { userId, moderatorId, reason, duration } = body;

        try {
            await ensureGuild(guildId);
            await ensureUser(userId);
            await ensureUser(moderatorId);

            // Get next case number
            const lastCase = await prisma.moderationCase.findFirst({
                where: { guildId },
                orderBy: { caseNumber: 'desc' },
            });
            const caseNumber = (lastCase?.caseNumber || 0) + 1;

            // Calculate expiration if temporary
            const expiresAt = duration ? new Date(Date.now() + duration * 1000) : null;

            // Create moderation case
            const moderationCase = await prisma.moderationCase.create({
                data: {
                    guildId,
                    caseNumber,
                    type: duration ? 'tempban' : 'ban',
                    targetId: userId,
                    moderatorId,
                    reason,
                    duration,
                    expiresAt,
                    isActive: true,
                },
            });

            return reply.status(201).send({
                success: true,
                case: moderationCase,
            });
        } catch (error) {
            request.log.error({ error, guildId, userId }, 'Failed to ban user');
            return reply.status(500).send({
                success: false,
                error: 'Failed to ban user',
            });
        }
    });

    // ============================================================================
    // UNBAN USER
    // ============================================================================

    app.post('/guilds/:guildId/moderation/unban', async (request, reply) => {
        const { guildId } = request.params as { guildId: string };
        const { userId, moderatorId, reason } = request.body as { userId: string; moderatorId: string; reason?: string };

        try {
            await ensureGuild(guildId);
            await ensureUser(userId);
            await ensureUser(moderatorId);

            // Deactivate existing ban cases
            await prisma.moderationCase.updateMany({
                where: {
                    guildId,
                    targetId: userId,
                    type: { in: ['ban', 'tempban'] },
                    isActive: true,
                },
                data: {
                    isActive: false,
                },
            });

            const lastCase = await prisma.moderationCase.findFirst({
                where: { guildId },
                orderBy: { caseNumber: 'desc' },
            });
            const caseNumber = (lastCase?.caseNumber || 0) + 1;

            const moderationCase = await prisma.moderationCase.create({
                data: {
                    guildId,
                    caseNumber,
                    type: 'unban',
                    targetId: userId,
                    moderatorId,
                    reason,
                    isActive: true,
                },
            });

            return reply.status(201).send({
                success: true,
                case: moderationCase,
            });
        } catch (error) {
            request.log.error({ error, guildId, userId }, 'Failed to unban user');
            return reply.status(500).send({
                success: false,
                error: 'Failed to unban user',
            });
        }
    });

    // ============================================================================
    // KICK USER
    // ============================================================================

    app.post('/guilds/:guildId/moderation/kick', async (request, reply) => {
        const { guildId } = request.params as { guildId: string };
        const { userId, moderatorId, reason } = kickUserSchema.parse(request.body);

        try {
            await ensureGuild(guildId);
            await ensureUser(userId);
            await ensureUser(moderatorId);

            const lastCase = await prisma.moderationCase.findFirst({
                where: { guildId },
                orderBy: { caseNumber: 'desc' },
            });
            const caseNumber = (lastCase?.caseNumber || 0) + 1;

            const moderationCase = await prisma.moderationCase.create({
                data: {
                    guildId,
                    caseNumber,
                    type: 'kick',
                    targetId: userId,
                    moderatorId,
                    reason,
                    isActive: true,
                },
            });

            return reply.status(201).send({
                success: true,
                case: moderationCase,
            });
        } catch (error) {
            request.log.error({ error, guildId, userId }, 'Failed to kick user');
            return reply.status(500).send({
                success: false,
                error: 'Failed to kick user',
            });
        }
    });

    // ============================================================================
    // MUTE USER
    // ============================================================================

    app.post('/guilds/:guildId/moderation/mute', async (request, reply) => {
        const { guildId } = request.params as { guildId: string };
        const { userId, moderatorId, reason, duration } = muteUserSchema.parse(request.body);

        try {
            await ensureGuild(guildId);
            await ensureUser(userId);
            await ensureUser(moderatorId);

            const lastCase = await prisma.moderationCase.findFirst({
                where: { guildId },
                orderBy: { caseNumber: 'desc' },
            });
            const caseNumber = (lastCase?.caseNumber || 0) + 1;

            const expiresAt = duration ? new Date(Date.now() + duration * 1000) : null;

            const moderationCase = await prisma.moderationCase.create({
                data: {
                    guildId,
                    caseNumber,
                    type: duration ? 'tempmute' : 'mute',
                    targetId: userId,
                    moderatorId,
                    reason,
                    duration,
                    expiresAt,
                    isActive: true,
                },
            });

            return reply.status(201).send({
                success: true,
                case: moderationCase,
            });
        } catch (error) {
            request.log.error({ error, guildId, userId }, 'Failed to mute user');
            return reply.status(500).send({
                success: false,
                error: 'Failed to mute user',
            });
        }
    });

    // ============================================================================
    // UNMUTE USER
    // ============================================================================

    app.post('/guilds/:guildId/moderation/unmute', async (request, reply) => {
        const { guildId } = request.params as { guildId: string };
        const { userId, moderatorId, reason } = request.body as { userId: string; moderatorId: string; reason?: string };

        try {
            await ensureGuild(guildId);
            await ensureUser(userId);
            await ensureUser(moderatorId);

            await prisma.moderationCase.updateMany({
                where: {
                    guildId,
                    targetId: userId,
                    type: { in: ['mute', 'tempmute'] },
                    isActive: true,
                },
                data: {
                    isActive: false,
                },
            });

            const lastCase = await prisma.moderationCase.findFirst({
                where: { guildId },
                orderBy: { caseNumber: 'desc' },
            });
            const caseNumber = (lastCase?.caseNumber || 0) + 1;

            const moderationCase = await prisma.moderationCase.create({
                data: {
                    guildId,
                    caseNumber,
                    type: 'unmute',
                    targetId: userId,
                    moderatorId,
                    reason,
                    isActive: true,
                },
            });

            return reply.status(201).send({
                success: true,
                case: moderationCase,
            });
        } catch (error) {
            request.log.error({ error, guildId, userId }, 'Failed to unmute user');
            return reply.status(500).send({
                success: false,
                error: 'Failed to unmute user',
            });
        }
    });

    // ============================================================================
    // WARN USER
    // ============================================================================

    app.post('/guilds/:guildId/moderation/warn', async (request, reply) => {
        const { guildId } = request.params as { guildId: string };
        const { userId, moderatorId, reason } = warnUserSchema.parse(request.body);

        try {
            await ensureGuild(guildId);
            await ensureUser(userId);
            await ensureUser(moderatorId);

            const lastCase = await prisma.moderationCase.findFirst({
                where: { guildId },
                orderBy: { caseNumber: 'desc' },
            });
            const caseNumber = (lastCase?.caseNumber || 0) + 1;

            const moderationCase = await prisma.moderationCase.create({
                data: {
                    guildId,
                    caseNumber,
                    type: 'warn',
                    targetId: userId,
                    moderatorId,
                    reason,
                    isActive: true,
                },
            });

            // Create warning record
            await prisma.warning.create({
                data: {
                    guildId,
                    userId,
                    reason,
                    moderatorId,
                },
            });

            return reply.status(201).send({
                success: true,
                case: moderationCase,
            });
        } catch (error) {
            request.log.error({ error, guildId, userId }, 'Failed to warn user');
            return reply.status(500).send({
                success: false,
                error: 'Failed to warn user',
            });
        }
    });

    // ============================================================================
    // GET MODERATION CASES
    // ============================================================================

    app.get('/guilds/:guildId/moderation/cases', async (request, reply) => {
        const { guildId } = request.params as { guildId: string };
        const query = request.query as any;

        const page = parseInt(query.page || '1');
        const limit = parseInt(query.limit || '50');
        const skip = (page - 1) * limit;

        const where: any = { guildId };
        if (query.type) where.type = query.type;
        if (query.targetId) where.targetId = query.targetId;
        if (query.moderatorId) where.moderatorId = query.moderatorId;
        if (query.isActive !== undefined) where.isActive = query.isActive === 'true';

        try {
            const [cases, total] = await Promise.all([
                prisma.moderationCase.findMany({
                    where,
                    orderBy: { caseNumber: 'desc' },
                    skip,
                    take: limit,
                }),
                prisma.moderationCase.count({ where }),
            ]);

            return reply.send({
                success: true,
                cases,
                pagination: {
                    page,
                    limit,
                    total,
                    pages: Math.ceil(total / limit),
                },
            });
        } catch (error) {
            request.log.error({ error, guildId }, 'Failed to fetch moderation cases');
            return reply.status(500).send({
                success: false,
                error: 'Failed to fetch moderation cases',
            });
        }
    });

    // ============================================================================
    // GET SINGLE MODERATION CASE
    // ============================================================================

    app.get('/guilds/:guildId/moderation/cases/:caseNumber', async (request, reply) => {
        const { guildId, caseNumber } = request.params as { guildId: string; caseNumber: string };

        try {
            const moderationCase = await prisma.moderationCase.findUnique({
                where: {
                    guildId_caseNumber: {
                        guildId,
                        caseNumber: parseInt(caseNumber),
                    },
                },
            });

            if (!moderationCase) {
                return reply.status(404).send({
                    success: false,
                    error: 'Case not found',
                });
            }

            return reply.send({
                success: true,
                case: moderationCase,
            });
        } catch (error) {
            request.log.error({ error, guildId, caseNumber }, 'Failed to fetch moderation case');
            return reply.status(500).send({
                success: false,
                error: 'Failed to fetch moderation case',
            });
        }
    });

    // ============================================================================
    // UPDATE MODERATION CASE
    // ============================================================================

    app.put('/guilds/:guildId/moderation/cases/:caseNumber', async (request, reply) => {
        const { guildId, caseNumber } = request.params as { guildId: string; caseNumber: string };
        const updates = updateCaseSchema.parse(request.body);

        try {
            const moderationCase = await prisma.moderationCase.update({
                where: {
                    guildId_caseNumber: {
                        guildId,
                        caseNumber: parseInt(caseNumber),
                    },
                },
                data: updates,
            });

            return reply.send({
                success: true,
                case: moderationCase,
            });
        } catch (error) {
            request.log.error({ error, guildId, caseNumber }, 'Failed to update moderation case');
            return reply.status(500).send({
                success: false,
                error: 'Failed to update moderation case',
            });
        }
    });

    // ============================================================================
    // DELETE MODERATION CASE (Soft Delete)
    // ============================================================================

    app.delete('/guilds/:guildId/moderation/cases/:caseNumber', async (request, reply) => {
        const { guildId, caseNumber } = request.params as { guildId: string; caseNumber: string };

        try {
            await prisma.moderationCase.update({
                where: {
                    guildId_caseNumber: {
                        guildId,
                        caseNumber: parseInt(caseNumber),
                    },
                },
                data: {
                    deletedAt: new Date(),
                },
            });

            return reply.send({
                success: true,
                message: 'Case deleted successfully',
            });
        } catch (error) {
            request.log.error({ error, guildId, caseNumber }, 'Failed to delete moderation case');
            return reply.status(500).send({
                success: false,
                error: 'Failed to delete moderation case',
            });
        }
    });

    // ============================================================================
    // GET USER WARNINGS
    // ============================================================================

    app.get('/guilds/:guildId/moderation/warnings/:userId', async (request, reply) => {
        const { guildId, userId } = request.params as { guildId: string; userId: string };

        try {
            const warnings = await prisma.warning.findMany({
                where: {
                    guildId,
                    userId,
                    deletedAt: null,
                },
                orderBy: { createdAt: 'desc' },
            });

            return reply.send({
                success: true,
                data: warnings,
                count: warnings.length,
            });
        } catch (error) {
            request.log.error({ error, guildId, userId }, 'Failed to fetch warnings');
            return reply.status(500).send({
                success: false,
                error: 'Failed to fetch warnings',
            });
        }
    });
}
