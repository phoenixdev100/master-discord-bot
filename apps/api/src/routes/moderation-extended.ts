/**
 * Moderation Extended Routes
 * 
 * Handles additional moderation actions
 */

import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { prisma } from '../config/database';

const ModerationActionSchema = z.object({
    userId: z.string(),
    moderatorId: z.string(),
    reason: z.string(),
    duration: z.number().optional(),
    messageDays: z.number().optional(),
});

export async function moderationExtendedRoutes(app: FastifyInstance) {
    // Get user warnings
    app.get('/guilds/:guildId/moderation/warnings/:userId', async (request) => {
        const { guildId, userId } = request.params as { guildId: string; userId: string };

        const warnings = await prisma.warning.findMany({
            where: {
                guildId,
                userId,
            },
            orderBy: {
                createdAt: 'desc',
            },
            select: {
                id: true,
                reason: true,
                moderatorId: true,
                createdAt: true,
            },
        });

        return warnings;
    });

    // Clear user warnings
    app.delete('/guilds/:guildId/moderation/warnings/:userId', async (request) => {
        const { guildId, userId } = request.params as { guildId: string; userId: string };

        await prisma.warning.deleteMany({
            where: {
                guildId,
                userId,
            },
        });

        return { success: true };
    });

    // Log ban action
    app.post('/guilds/:guildId/moderation/ban', async (request) => {
        const { guildId } = request.params as { guildId: string };
        const data = ModerationActionSchema.parse(request.body);

        // Get next case number
        const lastCase = await prisma.moderationCase.findFirst({
            where: { guildId },
            orderBy: { caseNumber: 'desc' },
        });
        const caseNumber = (lastCase?.caseNumber || 0) + 1;

        const moderationCase = await prisma.moderationCase.create({
            data: {
                guildId,
                caseNumber,
                targetId: data.userId,
                moderatorId: data.moderatorId,
                type: 'BAN',
                reason: data.reason,
            },
        });

        return moderationCase;
    });

    // Log softban action
    app.post('/guilds/:guildId/moderation/softban', async (request) => {
        const { guildId } = request.params as { guildId: string };
        const data = ModerationActionSchema.parse(request.body);

        // Get next case number
        const lastCase = await prisma.moderationCase.findFirst({
            where: { guildId },
            orderBy: { caseNumber: 'desc' },
        });
        const caseNumber = (lastCase?.caseNumber || 0) + 1;

        const moderationCase = await prisma.moderationCase.create({
            data: {
                guildId,
                caseNumber,
                targetId: data.userId,
                moderatorId: data.moderatorId,
                type: 'SOFTBAN',
                reason: data.reason,
            },
        });

        return moderationCase;
    });

    // Log unban action
    app.post('/guilds/:guildId/moderation/unban', async (request) => {
        const { guildId } = request.params as { guildId: string };
        const data = ModerationActionSchema.parse(request.body);

        // Get next case number
        const lastCase = await prisma.moderationCase.findFirst({
            where: { guildId },
            orderBy: { caseNumber: 'desc' },
        });
        const caseNumber = (lastCase?.caseNumber || 0) + 1;

        const moderationCase = await prisma.moderationCase.create({
            data: {
                guildId,
                caseNumber,
                targetId: data.userId,
                moderatorId: data.moderatorId,
                type: 'UNBAN',
                reason: data.reason,
            },
        });

        return moderationCase;
    });

    // Log timeout action
    app.post('/guilds/:guildId/moderation/timeout', async (request) => {
        const { guildId } = request.params as { guildId: string };
        const data = ModerationActionSchema.parse(request.body);

        // Get next case number
        const lastCase = await prisma.moderationCase.findFirst({
            where: { guildId },
            orderBy: { caseNumber: 'desc' },
        });
        const caseNumber = (lastCase?.caseNumber || 0) + 1;

        const moderationCase = await prisma.moderationCase.create({
            data: {
                guildId,
                caseNumber,
                targetId: data.userId,
                moderatorId: data.moderatorId,
                type: 'TIMEOUT',
                reason: data.reason,
                duration: data.duration,
            },
        });

        return moderationCase;
    });
}
