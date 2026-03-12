/**
 * Leveling Routes
 * 
 * Handles XP, levels, and ranking
 */

import type { FastifyInstance } from 'fastify';
import { prisma } from '../config/database';

export async function levelingRoutes(app: FastifyInstance) {
    // Get user leveling data
    app.get('/guilds/:guildId/leveling/:userId', async (request) => {
        const { guildId, userId } = request.params as { guildId: string; userId: string };

        let levelingData = await prisma.levelingData.findUnique({
            where: {
                guildId_userId: {
                    guildId,
                    userId,
                },
            },
        });

        if (!levelingData) {
            levelingData = await prisma.levelingData.create({
                data: {
                    userId,
                    guildId,
                    xp: 0,
                    level: 0,
                    messages: 0,
                },
            });
        }

        // Calculate rank
        const rank = await prisma.levelingData.count({
            where: {
                guildId,
                OR: [
                    { level: { gt: levelingData.level } },
                    {
                        AND: [
                            { level: levelingData.level },
                            { xp: { gt: levelingData.xp } },
                        ],
                    },
                ],
            },
        });

        return {
            level: levelingData.level,
            xp: levelingData.xp,
            messages: levelingData.messages,
            rank: rank + 1,
        };
    });

    // Get leveling leaderboard
    app.get('/guilds/:guildId/leveling/leaderboard', async (request) => {
        const { guildId } = request.params as { guildId: string };
        const { page = 1, limit = 10 } = request.query as { page?: number; limit?: number };

        const skip = (Number(page) - 1) * Number(limit);

        const [users, total] = await Promise.all([
            prisma.levelingData.findMany({
                where: { guildId },
                orderBy: [
                    { level: 'desc' },
                    { xp: 'desc' },
                ],
                take: Number(limit),
                skip,
                select: {
                    userId: true,
                    level: true,
                    xp: true,
                    messages: true,
                },
            }),
            prisma.levelingData.count({
                where: { guildId },
            }),
        ]);

        return {
            users,
            total,
            page: Number(page),
            limit: Number(limit),
        };
    });

    // Add XP to user (message handler)
    app.post('/guilds/:guildId/leveling/:userId/xp', async (request) => {
        const { guildId, userId } = request.params as { guildId: string; userId: string };
        const { amount = 15 } = request.body as { amount?: number };

        const levelingData = await prisma.levelingData.upsert({
            where: {
                guildId_userId: {
                    guildId,
                    userId,
                },
            },
            create: {
                userId,
                guildId,
                xp: amount,
                level: 0,
                messages: 1,
            },
            update: {
                xp: {
                    increment: amount,
                },
                messages: {
                    increment: 1,
                },
            },
        });

        // Check for level up
        const xpNeeded = Math.floor(100 * Math.pow(levelingData.level + 1, 1.5));
        let leveledUp = false;
        let newLevel = levelingData.level;

        if (levelingData.xp >= xpNeeded) {
            newLevel = levelingData.level + 1;
            leveledUp = true;

            await prisma.levelingData.update({
                where: {
                    guildId_userId: {
                        guildId,
                        userId,
                    },
                },
                data: {
                    level: newLevel,
                    xp: levelingData.xp - xpNeeded,
                },
            });
        }

        return {
            leveledUp,
            newLevel,
            xp: levelingData.xp,
        };
    });

    // Set user XP (admin)
    app.put('/guilds/:guildId/leveling/:userId/xp', async (request) => {
        const { guildId, userId } = request.params as { guildId: string; userId: string };
        const { xp, level } = request.body as { xp?: number; level?: number };

        const updated = await prisma.levelingData.upsert({
            where: {
                guildId_userId: {
                    guildId,
                    userId,
                },
            },
            create: {
                userId,
                guildId,
                xp: xp || 0,
                level: level || 0,
                messages: 0,
            },
            update: {
                ...(xp !== undefined && { xp }),
                ...(level !== undefined && { level }),
            },
        });

        return updated;
    });

    // Reset user leveling data
    app.delete('/guilds/:guildId/leveling/:userId', async (request) => {
        const { guildId, userId } = request.params as { guildId: string; userId: string };

        await prisma.levelingData.delete({
            where: {
                guildId_userId: {
                    guildId,
                    userId,
                },
            },
        });

        return { success: true };
    });
}
