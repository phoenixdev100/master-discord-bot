/**
 * Convert Command
 * 
 * Unit conversion
 */

import { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits, MessageFlags } from 'discord.js';
import type { Command } from '../../types/command';

export const convert: Command = {
    data: new SlashCommandBuilder()
        .setName('convert')
        .setDescription('Unit conversion')
        .setDefaultMemberPermissions(PermissionFlagsBits.SendMessages)
        .setDMPermission(false)
        .addNumberOption(option =>
            option
                .setName('value')
                .setDescription('Value to convert')
                .setRequired(true)
        )
        .addStringOption(option =>
            option
                .setName('from')
                .setDescription('From unit')
                .setRequired(true)
        )
        .addStringOption(option =>
            option
                .setName('to')
                .setDescription('To unit')
                .setRequired(true)
        ),
    category: 'utility',

    async execute(interaction) {
        if (!interaction.guild) return;

        try {
            const embed = new EmbedBuilder()
                .setColor('#5865F2')
                .setTitle('🚧 Command In Development')
                .setDescription(`This command is currently being developed!\n\n**Command:** \`/convert\`\n**Category:** utility\n\nCheck back soon for updates!`)
                .setFooter({ text: 'Coming soon!' })
                .setTimestamp();

            await interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral });
        } catch (error: any) {
            console.error('convert command error:', error);
            await interaction.reply({
                content: '❌ An error occurred while executing this command',
                flags: MessageFlags.Ephemeral
            });
        }
    }
};
