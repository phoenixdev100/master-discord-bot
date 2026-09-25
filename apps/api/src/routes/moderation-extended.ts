/**
 * Moderation Extended Routes
 * 
 * Handles additional moderation actions (softban, timeout, warning deletion).
 * Primary moderation actions live in moderation.ts.
 */

import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { prisma } from '../config/database';
import { authenticateOrInternal } from '../middleware/auth';
import { ensureGuild, ensureUser } from '../services/ensure';

const ModerationActionSchema = z.object({
    userId: z.string(),
    moderatorId: z.string(),
    reason: z.string().optional(),
    duration: z.number().optional(),
    messageDays: z.number().optional(),
});

export async function moderationExtendedRoutes(app: FastifyInstance) {
    app.addHook('preHandler', authenticateOrInternal);

    // Clear user warnings
    app.delete('/guilds/:guildId/moderation/warnings/:userId', async (request) => {
        const { guildId, userId } = request.params as { guildId: string; userId: string };

        const result = await prisma.warning.deleteMany({
            where: {
                guildId,
                userId,
            },
        });

        return { success: true, deleted: result.count };
    });

    // Log softban action
    app.post('/guilds/:guildId/moderation/softban', async (request) => {
        const { guildId } = request.params as { guildId: string };
        const data = ModerationActionSchema.parse(request.body);

        await ensureGuild(guildId);
        await ensureUser(data.userId);
        await ensureUser(data.moderatorId);

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

        return { success: true, case: moderationCase };
    });

    // Log timeout action
    app.post('/guilds/:guildId/moderation/timeout', async (request) => {
        const { guildId } = request.params as { guildId: string };
        const data = ModerationActionSchema.parse(request.body);

        await ensureGuild(guildId);
        await ensureUser(data.userId);
        await ensureUser(data.moderatorId);

        // Get next case number
        const lastCase = await prisma.moderationCase.findFirst({
            where: { guildId },
            orderBy: { caseNumber: 'desc' },
        });
        const caseNumber = (lastCase?.caseNumber || 0) + 1;

        const expiresAt = data.duration ? new Date(Date.now() + data.duration * 1000) : null;

        const moderationCase = await prisma.moderationCase.create({
            data: {
                guildId,
                caseNumber,
                targetId: data.userId,
                moderatorId: data.moderatorId,
                type: 'TIMEOUT',
                reason: data.reason,
                duration: data.duration,
                expiresAt,
            },
        });

        return { success: true, case: moderationCase };
    });
}
