/**
 * Guild Create Event Handler
 * 
 * Fired when the bot joins a new guild.
 */

import type { Guild } from 'discord.js';
import type { BotClient } from '../client';
import logger from '../config/logger';
import { apiClient } from '../utils/api-client';

export async function handleGuildCreate(client: BotClient, guild: Guild): Promise<void> {
    logger.info(`📥 Joined guild: ${guild.name} (${guild.id})`);

    try {
        // Register guild with API
        await apiClient.registerGuild(guild.id, {
            name: guild.name,
            icon: guild.icon,
            ownerId: guild.ownerId,
        });

        logger.info(`✅ Registered guild ${guild.name} with API`);

        // Update presence
        client.user?.setPresence({
            activities: [
                {
                    name: `${client.guilds.cache.size} servers`,
                    type: 0,
                },
            ],
        });

        // Send welcome message to system channel if available
        if (guild.systemChannel) {
            await guild.systemChannel.send({
                embeds: [
                    {
                        title: '👋 Thanks for adding me!',
                        description:
                            'I\'m a powerful Discord bot with modular features.\n\n' +
                            '**Getting Started:**\n' +
                            '• Use `/help` to see all available commands\n' +
                            '• Configure modules via the dashboard\n' +
                            '• Server owners have full access\n\n' +
                            '**Need Help?**\n' +
                            'Visit our documentation or contact support.',
                        color: 0x5865f2,
                        timestamp: new Date().toISOString(),
                    },
                ],
            });
        }
    } catch (error) {
        logger.error({ error, guildId: guild.id }, 'Failed to register guild with API');
    }
}
