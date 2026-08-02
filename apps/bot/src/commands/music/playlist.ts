/**
 * Playlist Command
 * 
 * Manage playlists
 */

import { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits, MessageFlags } from 'discord.js';
import type { Command } from '../../types/command';

export const playlist: Command = {
    data: new SlashCommandBuilder()
        .setName('playlist')
        .setDescription('Manage playlists')
        .setDefaultMemberPermissions(PermissionFlagsBits.SendMessages)
        .setDMPermission(false)
        .addSubcommand(subcommand =>
            subcommand
                .setName('create')
                .setDescription('Create playlist')
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('add')
                .setDescription('Add playlist')
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('play')
                .setDescription('Play playlist')
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('list')
                .setDescription('List playlist')
        ),
    category: 'music',

    async execute(interaction) {
        if (!interaction.guild) return;

        try {
            const embed = new EmbedBuilder()
                .setColor('#5865F2')
                .setTitle('🚧 Command In Development')
                .setDescription(`This command is currently being developed!\n\n**Command:** \`/playlist\`\n**Category:** music\n\nCheck back soon for updates!`)
                .setFooter({ text: 'Coming soon!' })
                .setTimestamp();

            await interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral });
        } catch (error: any) {
            console.error('playlist command error:', error);
            await interaction.reply({
                content: '❌ An error occurred while executing this command',
                flags: MessageFlags.Ephemeral
            });
        }
    }
};
