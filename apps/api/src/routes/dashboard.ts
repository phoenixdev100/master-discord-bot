/**
 * Dashboard Stats Routes
 * 
 * Provides statistics and data for the dashboard
 */

import type { FastifyInstance } from 'fastify';
import { prisma } from '@discord-platform/database';

export async function dashboardRoutes(app: FastifyInstance): Promise<void> {

    /**
     * GET /api/dashboard/stats
     * Get overall dashboard statistics
     */
    app.get('/stats', async (request, reply) => {
        try {
            // Get total guilds
            const totalGuilds = await prisma.guild.count({
                where: { isActive: true }
            });

            // Get total enabled modules across all guilds
            const enabledModules = await prisma.guildModule.count({
                where: { isEnabled: true }
            });

            // Get total users known to the bot
            const totalUsers = await prisma.user.count();

            // Get total custom command executions
            const commandStats = await prisma.customCommand.aggregate({
                _sum: {
                    usageCount: true
                }
            });
            const commandsUsed = commandStats._sum.usageCount || 0;

            return {
                servers: totalGuilds,
                modules: enabledModules,
                commands: commandsUsed,
                users: totalUsers
            };
        } catch (error) {
            request.log.error(error);
            return reply.status(500).send({ error: 'Failed to fetch stats' });
        }
    });

    /**
     * GET /api/dashboard/guilds
     * Get all guilds with their module status
     */
    app.get('/guilds', async (request, reply) => {
        try {
            const guilds = await prisma.guild.findMany({
                where: { isActive: true },
                include: {
                    modules: {
                        include: {
                            module: true
                        }
                    },
                    _count: {
                        select: {
                            users: true,
                            customCommands: true
                        }
                    }
                },
                orderBy: {
                    joinedAt: 'desc'
                }
            });

            return guilds.map(guild => ({
                id: guild.id,
                name: guild.name,
                icon: guild.icon,
                ownerId: guild.ownerId,
                isPremium: guild.isPremium,
                premiumTier: guild.premiumTier,
                joinedAt: guild.joinedAt,
                memberCount: guild._count.users,
                commandCount: guild._count.customCommands,
                enabledModules: guild.modules.filter(m => m.isEnabled).length,
                totalModules: guild.modules.length
            }));
        } catch (error) {
            request.log.error(error);
            return reply.status(500).send({ error: 'Failed to fetch guilds' });
        }
    });

    /**
     * GET /api/dashboard/modules
     * Get all modules with their status across guilds
     */
    app.get('/modules', async (request, reply) => {
        try {
            const modules = await prisma.module.findMany({
                include: {
                    guilds: {
                        where: {
                            guild: {
                                isActive: true
                            }
                        }
                    }
                }
            });

            return modules.map(module => ({
                id: module.id,
                name: module.name,
                description: module.description,
                category: module.category,
                isDefault: module.isDefault,
                enabledInGuilds: module.guilds.filter(g => g.isEnabled).length,
                totalGuilds: module.guilds.length
            }));
        } catch (error) {
            request.log.error(error);
            return reply.status(500).send({ error: 'Failed to fetch modules' });
        }
    });

    /**
     * GET /api/dashboard/activity
     * Get recent activity from audit logs
     */
    app.get('/activity', async (request, reply) => {
        try {
            // Fetch recent audit logs for activity feed
            const recentLogs = await prisma.auditLog.findMany({
                take: 10,
                orderBy: {
                    createdAt: 'desc'
                },
                include: {
                    guild: {
                        select: {
                            name: true
                        }
                    },
                    user: {
                        select: {
                            username: true
                        }
                    }
                }
            });

            if (recentLogs.length > 0) {
                return recentLogs.map(log => ({
                    id: log.id,
                    action: log.action,
                    server: log.guild.name,
                    user: log.user.username,
                    time: log.createdAt,
                    icon: getActionIcon(log.action)
                }));
            }

            // Fallback if no logs: return recent guild joins as before
            const recentGuilds = await prisma.guild.findMany({
                where: { isActive: true },
                orderBy: { joinedAt: 'desc' },
                take: 5,
                select: {
                    id: true,
                    name: true,
                    joinedAt: true
                }
            });

            return recentGuilds.map(guild => ({
                id: guild.id,
                action: 'Server joined',
                server: guild.name,
                time: guild.joinedAt,
                icon: '🎉'
            }));
        } catch (error) {
            request.log.error(error);
            return reply.status(500).send({ error: 'Failed to fetch activity' });
        }
    });

    /**
     * PUT /api/dashboard/modules/:id
     * Toggle module default status
     */
    app.put('/modules/:id', async (request, reply) => {
        const { id } = request.params as { id: string };
        const { isDefault } = request.body as { isDefault: boolean };

        try {
            const module = await prisma.module.update({
                where: { id },
                data: { isDefault }
            });
            return module;
        } catch (error) {
            request.log.error(error);
            return reply.status(500).send({ error: 'Failed to update module' });
        }
    });

    /**
     * GET /api/dashboard/logs
     * Get paginated audit logs
     */
    app.get('/logs', async (request, reply) => {
        const { page = 1, limit = 50 } = request.query as { page: number, limit: number };
        const skip = (page - 1) * limit;

        try {
            const [logs, total] = await prisma.$transaction([
                prisma.auditLog.findMany({
                    skip,
                    take: Number(limit),
                    orderBy: { createdAt: 'desc' },
                    include: {
                        guild: { select: { name: true } },
                        user: { select: { username: true } }
                    }
                }),
                prisma.auditLog.count()
            ]);

            return {
                logs: logs.map(log => ({
                    id: log.id,
                    action: log.action,
                    server: log.guild.name,
                    user: log.user.username,
                    resource: log.resource,
                    time: log.createdAt,
                    icon: getActionIcon(log.action)
                })),
                pagination: {
                    total,
                    pages: Math.ceil(total / limit),
                    current: Number(page)
                }
            };
        } catch (error) {
            request.log.error(error);
            return reply.status(500).send({ error: 'Failed to fetch logs' });
        }
    });

    /**
     * GET /api/dashboard/settings
     * Get system configuration
     */
    app.get('/settings', async (request, reply) => {
        try {
            const configs = await prisma.systemConfig.findMany();
            // Convert array of configs to a single object
            return configs.reduce((acc, curr) => ({
                ...acc,
                [curr.key]: curr.value
            }), {});
        } catch (error) {
            request.log.error(error);
            return reply.status(500).send({ error: 'Failed to fetch settings' });
        }
    });

    /**
     * POST /api/dashboard/settings
     * Update system configuration
     */
    app.post('/settings', async (request, reply) => {
        const settings = request.body as Record<string, any>;

        try {
            const updates = Object.entries(settings).map(([key, value]) =>
                prisma.systemConfig.upsert({
                    where: { key },
                    update: { value },
                    create: { key, value }
                })
            );

            await prisma.$transaction(updates);
            return { success: true };
        } catch (error) {
            request.log.error(error);
            return reply.status(500).send({ error: 'Failed to update settings' });
        }
    });
}

function getActionIcon(action: string): string {
    if (action.includes('ban') || action.includes('kick')) return '🔨';
    if (action.includes('mute') || action.includes('timeout')) return '🔇';
    if (action.includes('delete')) return '🗑️';
    if (action.includes('update')) return '📝';
    if (action.includes('create')) return '✨';
    return '📋';
}
