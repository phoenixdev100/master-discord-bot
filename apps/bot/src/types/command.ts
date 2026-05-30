/**
 * Command Structure
 * 
 * Base types and interfaces for slash commands.
 */

import type {
    ChatInputCommandInteraction,
    SlashCommandBuilder,
    SlashCommandSubcommandsOnlyBuilder,
    SlashCommandOptionsOnlyBuilder,
} from 'discord.js';
import type { BotClient } from '../client';

/**
 * Command execution context
 */
export interface CommandContext {
    interaction: ChatInputCommandInteraction;
    client: BotClient;
}

/**
 * Command definition
 */
export interface Command {
    data: SlashCommandBuilder | SlashCommandSubcommandsOnlyBuilder | SlashCommandOptionsOnlyBuilder;
    category: string; // Category name (e.g., 'moderation', 'utility', 'automod', 'leveling', 'economy', 'tickets')
    permissions?: string[]; // Required permissions
    cooldown?: number; // Cooldown in seconds
    execute: (interaction: ChatInputCommandInteraction) => Promise<void | any>;
}

/**
 * Command category for organization
 */
export enum CommandCategory {
    MODERATION = 'moderation',
    UTILITY = 'utility',
    AUTOMOD = 'automod',
    LEVELING = 'leveling',
    ECONOMY = 'economy',
    TICKETS = 'tickets',
    ADMIN = 'admin',
}
