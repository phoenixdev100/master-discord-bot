/**
 * Ensure Helpers
 *
 * Guarantee that parent rows exist before inserting records with
 * foreign keys, so writes never fail on missing User/Guild rows.
 */

import { prisma } from '../config/database';

/**
 * Ensure a User row exists for the given Discord user ID.
 */
export async function ensureUser(userId: string, username = 'unknown'): Promise<void> {
    await prisma.user.upsert({
        where: { id: userId },
        update: {},
        create: {
            id: userId,
            username,
            discriminator: '0',
        },
    });
}

/**
 * Ensure a Guild row exists for the given Discord guild ID.
 */
export async function ensureGuild(guildId: string, name = 'Unknown Server', ownerId = 'unknown'): Promise<void> {
    await prisma.guild.upsert({
        where: { id: guildId },
        update: {},
        create: {
            id: guildId,
            name,
            ownerId,
        },
    });
}
