/**
 * Discord Bot Entry Point
 * 
 * Initializes and starts the Discord bot.
 */

// import './config/dotenv'; // Handled by dotenv-cli
import { BotClient } from './client';
import { env } from './config/env';
import logger from './config/logger';
import { loadEvents } from './utils/event-loader';
import { loadCommands } from './utils/command-loader';

async function main() {
    try {
        logger.info('🤖 Starting Discord Bot...');

        // Debug env
        logger.info(`Token present: ${!!env.DISCORD_BOT_TOKEN}`);
        if (env.DISCORD_BOT_TOKEN) {
            logger.info(`Token length: ${env.DISCORD_BOT_TOKEN.length}`);
            logger.info(`Token start: ${env.DISCORD_BOT_TOKEN.substring(0, 5)}...`);
        }

        // Create client
        const client = new BotClient();

        // Load commands
        try {
            await loadCommands(client);
            logger.info('✅ Commands loaded');
        } catch (error) {
            logger.warn({ error }, '⚠️ Failed to load commands, continuing...');
        }

        // Load event handlers
        try {
            loadEvents(client);
            logger.info('✅ Events loaded');
        } catch (error) {
            logger.warn({ error }, '⚠️ Failed to load events, continuing...');
        }

        // Login to Discord
        if (env.DISCORD_BOT_TOKEN) {
            logger.info('Attempting to login...');
            await client.login(env.DISCORD_BOT_TOKEN);
            logger.info('✅ Bot logged in to Discord');
        } else {
            logger.warn('⚠️ No bot token found, skipping Discord login');
        }

        logger.info('✅ Bot initialization complete');
    } catch (error: any) {
        logger.error('❌ Failed to start bot');

        // Check for Disallowed Intents
        if (error.message && (error.message.includes('disallowed intents') || error.code === 'DisallowedIntents')) {
            logger.error('!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!');
            logger.error('🚨 CRITICAL ERROR: PRIVILEGED INTENTS NOT ENABLED');
            logger.error('!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!');
            logger.error('To fix this:');
            logger.error('1. Go to https://discord.com/developers/applications');
            logger.error('2. Select your application');
            logger.error('3. Click "Bot" in the left sidebar');
            logger.error('4. Scroll down to "Privileged Gateway Intents"');
            logger.error('5. Enable ALL three intents:');
            logger.error('   - Presence Intent');
            logger.error('   - Server Members Intent');
            logger.error('   - Message Content Intent');
            logger.error('6. Click "Save Changes"');
            logger.error('!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!');
            process.exit(1);
        }

        console.error(error); // Force console error to see full object
        if (error instanceof Error) {
            logger.error(`Error name: ${error.name}`);
            logger.error(`Error message: ${error.message}`);
            logger.error(`Stack: ${error.stack}`);
        }
        process.exit(1);
    }
}

// Graceful shutdown
async function shutdown(signal: string, client?: BotClient) {
    logger.info(`${signal} received, shutting down gracefully...`);

    try {
        if (client) {
            client.destroy();
            logger.info('✅ Discord client destroyed');
        }

        logger.info('👋 Shutdown complete');
        process.exit(0);
    } catch (error) {
        logger.error({ error }, '❌ Error during shutdown');
        process.exit(1);
    }
}

// Handle uncaught errors
process.on('uncaughtException', (error) => {
    logger.error({ error }, '❌ Uncaught exception');
    process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
    logger.error({ reason, promise }, '❌ Unhandled rejection');
    process.exit(1);
});

// Start the bot
main().then((client) => {
    process.on('SIGTERM', () => shutdown('SIGTERM', client as any));
    process.on('SIGINT', () => shutdown('SIGINT', client as any));
});
