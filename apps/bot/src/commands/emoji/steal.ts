/**
 * Steal Command
 * 
 * Steal an emoji from another server
 */

import { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits, MessageFlags } from 'discord.js';
import type { Command } from '../../types/command';

export const steal: Command = {
    data: new SlashCommandBuilder()
        .setName('steal')
        .setDescription('Steal an emoji from another server')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
        .setDMPermission(false)
        .addStringOption(option =>
            option
                .setName('emoji')
                .setDescription('Emoji to steal')
                .setRequired(true)
        )
        .addStringOption(option =>
            option
                .setName('name')
                .setDescription('Name for the emoji')
                .setRequired(false)
        ),
    category: 'emoji',

    async execute(interaction) {
        if (!interaction.guild) return;

        try {
            const embed = new EmbedBuilder()
                .setColor('#5865F2')
                .setTitle('🚧 Command In Development')
                .setDescription(`This command is currently being developed!\n\n**Command:** \`/steal\`\n**Category:** emoji\n\nCheck back soon for updates!`)
                .setFooter({ text: 'Coming soon!' })
                .setTimestamp();

            await interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral });
        } catch (error: any) {
            console.error('steal command error:', error);
            await interaction.reply({
                content: '❌ An error occurred while executing this command',
                flags: MessageFlags.Ephemeral
            });
        }
    }
};
