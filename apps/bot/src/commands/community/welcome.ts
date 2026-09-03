/**
 * Welcome Command
 * 
 * Setup welcome messages
 */

import { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits, MessageFlags } from 'discord.js';
import type { Command } from '../../types/command';

export const welcome: Command = {
    data: new SlashCommandBuilder()
        .setName('welcome')
        .setDescription('Setup welcome messages')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
        .setDMPermission(false)
        .addSubcommand(subcommand =>
            subcommand
                .setName('setup')
                .setDescription('Setup welcome')
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('test')
                .setDescription('Test welcome')
        ),
    category: 'community',

    async execute(interaction) {
        if (!interaction.guild) return;
        try {
            // TODO: Implement welcome command logic

            const embed = new EmbedBuilder()
                .setColor('#5865F2')
                .setTitle('🚧 Command In Development')
                .setDescription('This command is currently being developed and will be available soon!')
                .setTimestamp();

            await interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral });
        } catch (error: any) {
            console.error('welcome command error:', error);
            await interaction.reply({
                content: error.response?.data?.message || '❌ An error occurred',
                flags: MessageFlags.Ephemeral
            });
        }
    }
};
