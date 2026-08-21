/**
 * Trivia Command
 * 
 * Play trivia
 */

import { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits, MessageFlags } from 'discord.js';
import type { Command } from '../../types/command';

export const trivia: Command = {
    data: new SlashCommandBuilder()
        .setName('trivia')
        .setDescription('Play trivia')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
        .setDMPermission(false)
        .addSubcommand(subcommand =>
            subcommand
                .setName('start')
                .setDescription('Start trivia')
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('answer')
                .setDescription('Answer trivia')
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('leaderboard')
                .setDescription('Leaderboard trivia')
        ),
    category: 'games',

    async execute(interaction) {
        if (!interaction.guild) return;

        try {
            // TODO: Implement trivia command logic
            
            const embed = new EmbedBuilder()
                .setColor('#5865F2')
                .setTitle('🚧 Command In Development')
                .setDescription('This command is currently being developed and will be available soon!')
                .setTimestamp();

            await interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral });
        } catch (error: any) {
            console.error('trivia command error:', error);
            await interaction.reply({
                content: error.response?.data?.message || '❌ An error occurred',
                flags: MessageFlags.Ephemeral
            });
        }
    }
};
