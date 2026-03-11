/**
 * Guild Routes
 * 
 * Handles guild registration and module management.
 */

import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { prisma } from '@discord-platform/database';

export async function guildRoutes(app: FastifyInstance): Promise<void> {

    // Schema for guild registration
    const registerSchema = z.object({
        name: z.string(),
        icon: z.string().nullable(),
        ownerId: z.string(),
    });

    /**
     * POST /api/guilds/:guildId/register
     * Register or update a guild
     */
    app.post('/:guildId/register', async (request, reply) => {
        const { guildId } = request.params as { guildId: string };

        // Validate body
        const result = registerSchema.safeParse(request.body);
        if (!result.success) {
            return reply.status(400).send({ error: 'Invalid request body' });
        }

        const { name, icon, ownerId } = result.data;

        try {
            // Ensure default modules exist
            const defaultModules = ['utility', 'moderation', 'automod', 'leveling', 'economy', 'tickets'];
            for (const modName of defaultModules) {
                await prisma.module.upsert({
                    where: { name: modName },
                    update: {},
                    create: {
                        name: modName,
                        category: 'system', // Default category
                        description: `${modName} module`,
                        isDefault: true
                    }
                });
            }

            // Upsert guild
            const guild = await prisma.guild.upsert({
                where: { id: guildId },
                update: {
                    name,
                    icon,
                    ownerId,
                },
                create: {
                    id: guildId,
                    name,
                    icon,
                    ownerId,
                    modules: {
                        create: defaultModules.map(modName => ({
                            isEnabled: ['utility', 'moderation', 'automod'].includes(modName),
                            module: { connect: { name: modName } }
                        }))
                    }
                },
            });

            // Ensure modules exist for existing guilds (if they were missing)
            const existingModules = await prisma.guildModule.findMany({
                where: { guildId },
                include: { module: true }
            });
            const existingModuleNames = existingModules.map(m => m.module.name);

            const missingModules = defaultModules.filter((m: string) => !existingModuleNames.includes(m));

            if (missingModules.length > 0) {
                for (const modName of missingModules) {
                    const module = await prisma.module.findUnique({
                        where: { name: modName }
                    });

                    if (module) {
                        await prisma.guildModule.create({
                            data: {
                                guildId,
                                moduleId: module.id,
                                isEnabled: ['utility', 'moderation', 'automod'].includes(modName),
                            }
                        });
                    }
                }
            }

            return { success: true, guild };
        } catch (error) {
            request.log.error(error);
            return reply.status(500).send({ error: 'Failed to register guild' });
        }
    });

    /**
     * GET /api/guilds/:guildId/modules/:moduleName
     * Check if a module is enabled
     */
    app.get('/:guildId/modules/:moduleName', async (request, reply) => {
        const { guildId, moduleName } = request.params as { guildId: string; moduleName: string };

        try {
            const guildModule = await prisma.guildModule.findFirst({
                where: {
                    guildId,
                    module: {
                        name: moduleName
                    }
                },
            });

            return { enabled: guildModule?.isEnabled ?? false };
        } catch (error) {
            request.log.error(error);
            return reply.status(500).send({ error: 'Failed to check module status' });
        }
    });
}
