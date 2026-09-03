/**
 * Rep Command
 * 
 * Give reputation to users
 */

import { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits, MessageFlags } from 'discord.js';
import type { Command } from '../../types/command';

export const rep: Command = {
    data: new SlashCommandBuilder()
        .setName('rep')
        .setDescription('Give reputation to users')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
        .setDMPermission(false)
        .addSubcommand(subcommand =>
            subcommand
                .setName('give')
                .setDescription('Give rep')
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('leaderboard')
                .setDescription('Leaderboard rep')
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('stats')
                .setDescription('Stats rep')
        ),
    category: 'community',

    async execute(interaction) {
        if (!interaction.guild) return;
        try {
            // TODO: Implement rep command logic
            
            const embed = new EmbedBuilder()
                .setColor('#5865F2')
                .setTitle('🚧 Command In Development')
                .setDescription('This command is currently being developed and will be available soon!')
                .setTimestamp();

            await interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral });
        } catch (error: any) {
            console.error('rep command error:', error);
            await interaction.reply({
                content: error.response?.data?.message || '❌ An error occurred',
                flags: MessageFlags.Ephemeral
            });
        }
    }
};
