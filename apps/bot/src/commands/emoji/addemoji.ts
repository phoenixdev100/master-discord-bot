/**
 * Addemoji Command
 * 
 * Add an emoji to the server
 */

import { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits, MessageFlags } from 'discord.js';
import type { Command } from '../../types/command';

export const addemoji: Command = {
    data: new SlashCommandBuilder()
        .setName('addemoji')
        .setDescription('Add an emoji to the server')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
        .setDMPermission(false)
        .addStringOption(option =>
            option
                .setName('name')
                .setDescription('Emoji name')
                .setRequired(true)
        )
        .addStringOption(option =>
            option
                .setName('emoji_url')
                .setDescription('Emoji image URL')
                .setRequired(true)
        ),
    category: 'emoji',

    async execute(interaction) {
        if (!interaction.guild) return;

        try {
            const embed = new EmbedBuilder()
                .setColor('#5865F2')
                .setTitle('🚧 Command In Development')
                .setDescription(`This command is currently being developed!\n\n**Command:** \`/addemoji\`\n**Category:** emoji\n\nCheck back soon for updates!`)
                .setFooter({ text: 'Coming soon!' })
                .setTimestamp();

            await interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral });
        } catch (error: any) {
            console.error('addemoji command error:', error);
            await interaction.reply({
                content: '❌ An error occurred while executing this command',
                flags: MessageFlags.Ephemeral
            });
        }
    }
};
