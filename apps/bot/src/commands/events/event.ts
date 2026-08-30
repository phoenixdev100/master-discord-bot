/**
 * Event Command
 * 
 * Manage server events
 */

import { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits, MessageFlags } from 'discord.js';
import type { Command } from '../../types/command';

export const event: Command = {
    data: new SlashCommandBuilder()
        .setName('event')
        .setDescription('Manage server events')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
        .setDMPermission(false)
        .addSubcommand(subcommand =>
            subcommand
                .setName('create')
                .setDescription('Create event')
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('edit')
                .setDescription('Edit event')
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('delete')
                .setDescription('Delete event')
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('list')
                .setDescription('List event')
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('join')
                .setDescription('Join event')
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('leave')
                .setDescription('Leave event')
        ),
    category: 'events',

    async execute(interaction) {
        if (!interaction.guild) return;
        try {
            // TODO: Implement event command logic
            
            const embed = new EmbedBuilder()
                .setColor('#5865F2')
                .setTitle('🚧 Command In Development')
                .setDescription('This command is currently being developed and will be available soon!')
                .setTimestamp();

            await interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral });
        } catch (error: any) {
            console.error('event command error:', error);
            await interaction.reply({
                content: error.response?.data?.message || '❌ An error occurred',
                flags: MessageFlags.Ephemeral
            });
        }
    }
};
