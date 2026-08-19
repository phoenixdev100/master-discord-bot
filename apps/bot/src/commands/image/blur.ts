/**
 * Blur Command
 * 
 * Blur an image
 */

import { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits, MessageFlags } from 'discord.js';
import type { Command } from '../../types/command';

export const blur: Command = {
    data: new SlashCommandBuilder()
        .setName('blur')
        .setDescription('Blur an image')
        .setDefaultMemberPermissions(PermissionFlagsBits.SendMessages)
        .setDMPermission(false)
        .addUserOption(option =>
            option
                .setName('user')
                .setDescription('User avatar to blur')
                .setRequired(false)
        ),
    category: 'image',

    async execute(interaction) {
        if (!interaction.guild) return;

        try {
            const embed = new EmbedBuilder()
                .setColor('#5865F2')
                .setTitle('🚧 Command In Development')
                .setDescription(`This command is currently being developed!\n\n**Command:** \`/blur\`\n**Category:** image\n\nCheck back soon for updates!`)
                .setFooter({ text: 'Coming soon!' })
                .setTimestamp();

            await interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral });
        } catch (error: any) {
            console.error('blur command error:', error);
            await interaction.reply({
                content: '❌ An error occurred while executing this command',
                flags: MessageFlags.Ephemeral
            });
        }
    }
};
