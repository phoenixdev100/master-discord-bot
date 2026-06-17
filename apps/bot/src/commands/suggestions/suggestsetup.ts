/**
 * Suggestsetup Command
 * 
 * Setup suggestions channel
 */

import { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits, MessageFlags } from 'discord.js';
import type { Command } from '../../types/command';

export const suggestsetup: Command = {
    data: new SlashCommandBuilder()
        .setName('suggestsetup')
        .setDescription('Setup suggestions channel')
        .setDefaultMemberPermissions(PermissionFlagsBits.SendMessages)
        .setDMPermission(false)
        .addChannelOption(option =>
            option
                .setName('channel')
                .setDescription('Suggestions channel')
                .setRequired(true)
        ),
    category: 'suggestions',

    async execute(interaction) {
        if (!interaction.guild) return;

        try {
            const embed = new EmbedBuilder()
                .setColor('#5865F2')
                .setTitle('🚧 Command In Development')
                .setDescription(`This command is currently being developed!\n\n**Command:** \`/suggestsetup\`\n**Category:** suggestions\n\nCheck back soon for updates!`)
                .setFooter({ text: 'Coming soon!' })
                .setTimestamp();

            await interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral });
        } catch (error: any) {
            console.error('suggestsetup command error:', error);
            await interaction.reply({
                content: '❌ An error occurred while executing this command',
                flags: MessageFlags.Ephemeral
            });
        }
    }
};
