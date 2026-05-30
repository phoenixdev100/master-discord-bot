/**
 * Warn Event Handler
 * 
 * Handles Discord.js client warnings.
 */

import type { BotClient } from '../client';
import logger from '../config/logger';

export async function handleWarn(_client: BotClient, warning: string): Promise<void> {
    logger.warn({ warning }, 'Discord client warning');
}
