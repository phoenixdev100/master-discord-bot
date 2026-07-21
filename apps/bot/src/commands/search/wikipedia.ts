/**
 * Wikipedia Command
 * 
 * Search Wikipedia
 */

import { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits, MessageFlags } from 'discord.js';
import type { Command } from '../../types/command';

export const wikipedia: Command = {
    data: new SlashCommandBuilder()
        .setName('wikipedia')
        .setDescription('Search Wikipedia')
        .setDefaultMemberPermissions(PermissionFlagsBits.SendMessages)
        .setDMPermission(false)
        .addStringOption(option =>
            option
                .setName('query')
                .setDescription('Search query')
                .setRequired(true)
        ),
    category: 'search',

    async execute(interaction) {
        if (!interaction.guild) return;

        try {
            const embed = new EmbedBuilder()
                .setColor('#5865F2')
                .setTitle('🚧 Command In Development')
                .setDescription(`This command is currently being developed!\n\n**Command:** \`/wikipedia\`\n**Category:** search\n\nCheck back soon for updates!`)
                .setFooter({ text: 'Coming soon!' })
                .setTimestamp();

            await interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral });
        } catch (error: any) {
            console.error('wikipedia command error:', error);
            await interaction.reply({
                content: '❌ An error occurred while executing this command',
                flags: MessageFlags.Ephemeral
            });
        }
    }
};
