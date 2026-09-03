/**
 * Goodbye Command
 * 
 * Setup goodbye messages
 */

import { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits, MessageFlags } from 'discord.js';
import type { Command } from '../../types/command';

export const goodbye: Command = {
    data: new SlashCommandBuilder()
        .setName('goodbye')
        .setDescription('Setup goodbye messages')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
        .setDMPermission(false)
        .addSubcommand(subcommand =>
            subcommand
                .setName('setup')
                .setDescription('Setup goodbye')
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('test')
                .setDescription('Test goodbye')
        ),
    category: 'community',

    async execute(interaction) {
        if (!interaction.guild) return;
        try {
            // TODO: Implement goodbye command logic
            
            const embed = new EmbedBuilder()
                .setColor('#5865F2')
                .setTitle('🚧 Command In Development')
                .setDescription('This command is currently being developed and will be available soon!')
                .setTimestamp();

            await interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral });
        } catch (error: any) {
            console.error('goodbye command error:', error);
            await interaction.reply({
                content: error.response?.data?.message || '❌ An error occurred',
                flags: MessageFlags.Ephemeral
            });
        }
    }
};
