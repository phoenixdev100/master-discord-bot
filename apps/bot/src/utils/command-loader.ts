/**
 * Command Loader
 * 
 * Automatically loads and registers all commands from the commands directory.
 */

import type { BotClient } from '../client';
import logger from '../config/logger';
import { readdirSync, existsSync } from 'fs';
import { join, resolve } from 'path';
import { pathToFileURL } from 'url';
import type { Command } from '../types/command';

/**
 * Recursively load all command files from a directory
 */
async function loadCommandsFromDirectory(dir: string): Promise<Command[]> {
    const commands: Command[] = [];

    if (!existsSync(dir)) {
        logger.warn(`Directory does not exist: ${dir}`);
        return commands;
    }

    const entries = readdirSync(dir, { withFileTypes: true });

    for (const entry of entries) {
        const fullPath = join(dir, entry.name);

        if (entry.isDirectory()) {
            // Recursively load commands from subdirectories
            const subCommands = await loadCommandsFromDirectory(fullPath);
            commands.push(...subCommands);
        } else if (entry.isFile() && (entry.name.endsWith('.js') || entry.name.endsWith('.ts'))) {
            try {
                // Skip type definition files
                if (entry.name.endsWith('.d.ts')) {
                    continue;
                }

                // Convert Windows path to file URL for proper ESM import
                const fileUrl = pathToFileURL(fullPath).href;

                // Import the command file
                const commandModule = await import(fileUrl);

                // Try to find the command export
                // Commands can be exported as default, named export, or as the first export
                let command: Command | null = null;

                if (commandModule.default) {
                    command = commandModule.default;
                } else {
                    // Find the first export that looks like a command
                    const exports = Object.values(commandModule);
                    command = exports.find((exp: any) =>
                        exp && typeof exp === 'object' && 'data' in exp && 'execute' in exp
                    ) as Command || null;
                }

                if (command && command.data && typeof command.execute === 'function') {
                    commands.push(command);
                    logger.debug(`Loaded command: ${command.data.name} from ${entry.name}`);
                } else {
                    logger.warn(`Skipped ${entry.name}: No valid command export found`);
                }
            } catch (error) {
                logger.error({ error, file: entry.name }, `Failed to load command from ${entry.name}`);
            }
        }
    }

    return commands;
}

export async function loadCommands(client: BotClient): Promise<void> {
    try {
        // Use the dist/commands directory (compiled JS files)
        const commandsDir = resolve(__dirname, '../commands');
        logger.info(`📂 Loading commands from: ${commandsDir}`);

        // Load all commands recursively
        const commands = await loadCommandsFromDirectory(commandsDir);

        // Register each command with the client
        for (const command of commands) {
            try {
                client.registerCommand(command);
                logger.debug(`Registered command: /${command.data.name}`);
            } catch (error) {
                logger.error({ error, command: command.data.name }, `Failed to register command: ${command.data.name}`);
            }
        }

        logger.info(`✅ Loaded and registered ${commands.length} commands`);

        // Log commands by category
        const commandsByCategory: Record<string, string[]> = {};
        for (const command of commands) {
            const category = command.category || 'uncategorized';
            if (!commandsByCategory[category]) {
                commandsByCategory[category] = [];
            }
            commandsByCategory[category].push(command.data.name);
        }

        logger.info('📊 Commands by category:');
        for (const [category, cmds] of Object.entries(commandsByCategory).sort()) {
            logger.info(`   ${category}: ${cmds.length} commands`);
        }

    } catch (error) {
        logger.error({ error }, '❌ Failed to load commands');
        throw error;
    }
}
