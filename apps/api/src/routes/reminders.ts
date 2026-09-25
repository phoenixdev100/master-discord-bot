/**
 * Reminders Routes
 * 
 * Handles user reminders
 */

import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { prisma } from '../config/database';
import { authenticateOrInternal } from '../middleware/auth';
import { ensureUser } from '../services/ensure';

const ReminderSchema = z.object({
    message: z.string(),
    remindAt: z.string(),
    channelId: z.string(),
    guildId: z.string().optional(),
});

export async function remindersRoutes(app: FastifyInstance) {
    app.addHook('preHandler', authenticateOrInternal);

    // Create reminder
    app.post('/users/:userId/reminders', async (request) => {
        const { userId } = request.params as { userId: string };
        const data = ReminderSchema.parse(request.body);

        await ensureUser(userId);

        const reminder = await prisma.reminder.create({
            data: {
                userId,
                message: data.message,
                remindAt: new Date(data.remindAt),
                channelId: data.channelId,
                guildId: data.guildId,
            },
        });

        return reminder;
    });

    // Get user reminders
    app.get('/users/:userId/reminders', async (request) => {
        const { userId } = request.params as { userId: string };

        const reminders = await prisma.reminder.findMany({
            where: {
                userId,
                completed: false,
            },
            orderBy: {
                remindAt: 'asc',
            },
        });

        return reminders;
    });

    // Delete reminder
    app.delete('/users/:userId/reminders/:reminderId', async (request) => {
        const { userId, reminderId } = request.params as { userId: string; reminderId: string };

        await prisma.reminder.delete({
            where: {
                id: reminderId,
                userId,
            },
        });

        return { success: true };
    });

    // Mark reminder as completed
    app.patch('/users/:userId/reminders/:reminderId/complete', async (request) => {
        const { userId, reminderId } = request.params as { userId: string; reminderId: string };

        const reminder = await prisma.reminder.update({
            where: {
                id: reminderId,
                userId,
            },
            data: {
                completed: true,
            },
        });

        return reminder;
    });

    // Get pending reminders (for bot to process)
    app.get('/reminders/pending', async () => {
        const now = new Date();

        const reminders = await prisma.reminder.findMany({
            where: {
                completed: false,
                remindAt: {
                    lte: now,
                },
            },
            take: 100,
        });

        return reminders;
    });
}
