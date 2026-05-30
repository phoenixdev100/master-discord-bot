/**
 * Guild Delete Event Handler
 * 
 * Fired when the bot leaves a guild.
 */

import type { Guild } from 'discord.js';
import type { BotClient } from '../client';
import logger from '../config/logger';
import { apiClient } from '../utils/api-client';

export async function handleGuildDelete(client: BotClient, guild: Guild): Promise<void> {
    logger.info(`📤 Left guild: ${guild.name} (${guild.id})`);

    try {
        // Unregister guild from API
        await apiClient.unregisterGuild(guild.id);

        logger.info(`✅ Unregistered guild ${guild.name} from API`);

        // Update presence
        client.user?.setPresence({
            activities: [
                {
                    name: `${client.guilds.cache.size} servers`,
                    type: 0,
                },
            ],
        });
    } catch (error) {
        logger.error({ error, guildId: guild.id }, 'Failed to unregister guild from API');
    }
}
