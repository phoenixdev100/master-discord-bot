/**
 * Error Event Handler
 * 
 * Handles Discord.js client errors.
 */

import type { BotClient } from '../client';
import logger from '../config/logger';

export async function handleError(_client: BotClient, error: Error): Promise<void> {
    logger.error({ error }, 'Discord client error');
}
