/**
 * Bot Client
 * 
 * Extended Discord.js client with command handling and custom properties.
 */

import { Client, Collection, GatewayIntentBits, Partials } from 'discord.js';
import type { Command } from './types/command';
import logger from './config/logger';

export class BotClient extends Client {
    public commands: Collection<string, Command>;
    public cooldowns: Collection<string, Collection<string, number>>;
    public logger = logger;

    constructor() {
        super({
            intents: [
                GatewayIntentBits.Guilds,
                GatewayIntentBits.GuildMembers,
                GatewayIntentBits.GuildMessages,
                GatewayIntentBits.GuildMessageReactions,
                GatewayIntentBits.GuildVoiceStates,
                GatewayIntentBits.MessageContent,
            ],
            partials: [
                Partials.Message,
                Partials.Channel,
                Partials.Reaction,
                Partials.User,
                Partials.GuildMember,
            ],
            presence: {
                status: 'online',
                activities: [
                    {
                        name: 'your server',
                        type: 0, // Playing
                    },
                ],
            },
        });

        this.commands = new Collection();
        this.cooldowns = new Collection();
    }

    /**
     * Register a command
     */
    registerCommand(command: Command): void {
        this.commands.set(command.data.name, command);
        logger.debug(`Registered command: ${command.data.name}`);
    }

    /**
     * Get command by name
     */
    getCommand(name: string): Command | undefined {
        return this.commands.get(name);
    }

    /**
     * Check if user is on cooldown for a command
     */
    isOnCooldown(userId: string, commandName: string): number | null {
        if (!this.cooldowns.has(commandName)) {
            this.cooldowns.set(commandName, new Collection());
        }

        const now = Date.now();
        const timestamps = this.cooldowns.get(commandName)!;
        const cooldownAmount = (this.commands.get(commandName)?.cooldown ?? 3) * 1000;

        if (timestamps.has(userId)) {
            const expirationTime = timestamps.get(userId)! + cooldownAmount;

            if (now < expirationTime) {
                const timeLeft = (expirationTime - now) / 1000;
                return timeLeft;
            }
        }

        timestamps.set(userId, now);
        setTimeout(() => timestamps.delete(userId), cooldownAmount);

        return null;
    }
}
