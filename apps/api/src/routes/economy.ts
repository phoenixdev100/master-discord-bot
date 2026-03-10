/**
 * Economy Routes
 * 
 * Handles all economy-related endpoints
 */

import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { prisma } from '../config/database';

const PaySchema = z.object({
    recipientId: z.string(),
    amount: z.number().int().positive(),
});

const TransactionSchema = z.object({
    amount: z.number().int().positive(),
});

export async function economyRoutes(app: FastifyInstance) {
    // Get user economy data
    app.get('/guilds/:guildId/economy/:userId', async (request) => {
        const { guildId, userId } = request.params as { guildId: string; userId: string };

        let economyData = await prisma.economyData.findUnique({
            where: {
                guildId_userId: {
                    guildId,
                    userId,
                },
            },
        });

        if (!economyData) {
            economyData = await prisma.economyData.create({
                data: {
                    userId,
                    guildId,
                    balance: 0,
                    bank: 0,
                },
            });
        }

        return {
            balance: economyData.balance,
            bank: economyData.bank,
            total: economyData.balance + economyData.bank,
        };
    });

    // Claim daily reward
    app.post('/guilds/:guildId/economy/:userId/daily', async (request, reply) => {
        const { guildId, userId } = request.params as { guildId: string; userId: string };

        const economyData = await prisma.economyData.findUnique({
            where: {
                guildId_userId: {
                    guildId,
                    userId,
                },
            },
        });

        const now = new Date();
        const lastDaily = economyData?.lastDaily;

        if (lastDaily) {
            const timeSinceDaily = now.getTime() - lastDaily.getTime();
            const hoursLeft = 24 - (timeSinceDaily / 1000 / 60 / 60);

            if (hoursLeft > 0) {
                return reply.code(429).send({
                    error: 'Daily already claimed',
                    timeLeft: Math.floor(hoursLeft * 3600),
                });
            }
        }

        // Calculate streak
        let streak = economyData?.dailyStreak || 0;
        if (lastDaily) {
            const daysSinceDaily = (now.getTime() - lastDaily.getTime()) / 1000 / 60 / 60 / 24;
            if (daysSinceDaily < 2) {
                streak += 1;
            } else {
                streak = 1;
            }
        } else {
            streak = 1;
        }

        // Calculate reward (base + streak bonus)
        const baseReward = 100;
        const streakBonus = Math.min(streak * 10, 500); // Max 500 bonus
        const amount = baseReward + streakBonus;

        const updated = await prisma.economyData.upsert({
            where: {
                guildId_userId: {
                    guildId,
                    userId,
                },
            },
            create: {
                userId,
                guildId,
                balance: amount,
                bank: 0,
                lastDaily: now,
                dailyStreak: streak,
            },
            update: {
                balance: {
                    increment: amount,
                },
                lastDaily: now,
                dailyStreak: streak,
            },
        });

        return {
            amount,
            newBalance: updated.balance,
            streak,
        };
    });

    // Work for money
    app.post('/guilds/:guildId/economy/:userId/work', async (request, reply) => {
        const { guildId, userId } = request.params as { guildId: string; userId: string };

        const economyData = await prisma.economyData.findUnique({
            where: {
                guildId_userId: {
                    guildId,
                    userId,
                },
            },
        });

        const now = new Date();
        const lastWork = economyData?.lastWork;

        if (lastWork) {
            const timeSinceWork = now.getTime() - lastWork.getTime();
            const minutesLeft = 60 - (timeSinceWork / 1000 / 60);

            if (minutesLeft > 0) {
                return reply.code(429).send({
                    error: 'Work on cooldown',
                    timeLeft: Math.floor(minutesLeft * 60),
                });
            }
        }

        const jobs = [
            { name: 'Developer', min: 50, max: 150 },
            { name: 'Designer', min: 40, max: 120 },
            { name: 'Teacher', min: 30, max: 100 },
            { name: 'Chef', min: 35, max: 110 },
            { name: 'Mechanic', min: 45, max: 130 },
            { name: 'Artist', min: 25, max: 90 },
            { name: 'Musician', min: 30, max: 105 },
            { name: 'Writer', min: 35, max: 115 },
        ];

        const job = jobs[Math.floor(Math.random() * jobs.length)];
        const amount = Math.floor(Math.random() * (job.max - job.min + 1)) + job.min;

        const updated = await prisma.economyData.upsert({
            where: {
                guildId_userId: {
                    guildId,
                    userId,
                },
            },
            create: {
                userId,
                guildId,
                balance: amount,
                bank: 0,
                lastWork: now,
            },
            update: {
                balance: {
                    increment: amount,
                },
                lastWork: now,
            },
        });

        return {
            amount,
            job: job.name,
            newBalance: updated.balance,
        };
    });

    // Pay another user
    app.post('/guilds/:guildId/economy/:userId/pay', async (request, reply) => {
        const { guildId, userId } = request.params as { guildId: string; userId: string };
        const { recipientId, amount } = PaySchema.parse(request.body);

        if (userId === recipientId) {
            return reply.code(400).send({ error: 'Cannot pay yourself' });
        }

        const senderData = await prisma.economyData.findUnique({
            where: {
                guildId_userId: {
                    guildId,
                    userId,
                },
            },
        });

        if (!senderData || senderData.balance < amount) {
            return reply.code(400).send({ error: 'Insufficient funds' });
        }

        // Transfer money
        await prisma.$transaction([
            prisma.economyData.update({
                where: {
                    guildId_userId: {
                        guildId,
                        userId,
                    },
                },
                data: {
                    balance: {
                        decrement: amount,
                    },
                },
            }),
            prisma.economyData.upsert({
                where: {
                    guildId_userId: {
                        guildId,
                        userId: recipientId,
                    },
                },
                create: {
                    userId: recipientId,
                    guildId,
                    balance: amount,
                    bank: 0,
                },
                update: {
                    balance: {
                        increment: amount,
                    },
                },
            }),
        ]);

        return { success: true };
    });

    // Deposit to bank
    app.post('/guilds/:guildId/economy/:userId/deposit', async (request, reply) => {
        const { guildId, userId } = request.params as { guildId: string; userId: string };
        const { amount } = TransactionSchema.parse(request.body);

        const economyData = await prisma.economyData.findUnique({
            where: {
                guildId_userId: {
                    guildId,
                    userId,
                },
            },
        });

        if (!economyData || economyData.balance < amount) {
            return reply.code(400).send({ error: 'Insufficient funds in wallet' });
        }

        const updated = await prisma.economyData.update({
            where: {
                guildId_userId: {
                    guildId,
                    userId,
                },
            },
            data: {
                balance: {
                    decrement: amount,
                },
                bank: {
                    increment: amount,
                },
            },
        });

        return {
            deposited: amount,
            newBalance: updated.balance,
            newBank: updated.bank,
        };
    });

    // Withdraw from bank
    app.post('/guilds/:guildId/economy/:userId/withdraw', async (request, reply) => {
        const { guildId, userId } = request.params as { guildId: string; userId: string };
        const { amount } = TransactionSchema.parse(request.body);

        const economyData = await prisma.economyData.findUnique({
            where: {
                guildId_userId: {
                    guildId,
                    userId,
                },
            },
        });

        if (!economyData || economyData.bank < amount) {
            return reply.code(400).send({ error: 'Insufficient funds in bank' });
        }

        const updated = await prisma.economyData.update({
            where: {
                guildId_userId: {
                    guildId,
                    userId,
                },
            },
            data: {
                bank: {
                    decrement: amount,
                },
                balance: {
                    increment: amount,
                },
            },
        });

        return {
            withdrawn: amount,
            newBalance: updated.balance,
            newBank: updated.bank,
        };
    });

    // Get economy leaderboard
    app.get('/guilds/:guildId/economy/leaderboard', async (request) => {
        const { guildId } = request.params as { guildId: string };
        const { page = 1, limit = 10 } = request.query as { page?: number; limit?: number };

        const skip = (Number(page) - 1) * Number(limit);

        const [users, total] = await Promise.all([
            prisma.economyData.findMany({
                where: { guildId },
                orderBy: [
                    {
                        balance: 'desc',
                    },
                    {
                        bank: 'desc',
                    },
                ],
                take: Number(limit),
                skip,
                select: {
                    userId: true,
                    balance: true,
                    bank: true,
                },
            }),
            prisma.economyData.count({
                where: { guildId },
            }),
        ]);

        return {
            users: users.map(u => ({
                ...u,
                total: u.balance + u.bank,
            })),
            total,
            page: Number(page),
            limit: Number(limit),
        };
    });
}
