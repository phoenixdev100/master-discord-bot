/**
 * Gstart Command
 * 
 * Start a giveaway
 */

import { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits, MessageFlags } from 'discord.js';
import type { Command } from '../../types/command';

export const gstart: Command = {
    data: new SlashCommandBuilder()
        .setName('gstart')
        .setDescription('Start a giveaway')
        .setDefaultMemberPermissions(PermissionFlagsBits.SendMessages)
        .setDMPermission(false)
        .addStringOption(option =>
            option
                .setName('duration')
                .setDescription('Duration (e.g., 1h, 30m)')
                .setRequired(true)
        )
        .addIntegerOption(option =>
            option
                .setName('winners')
                .setDescription('Number of winners')
                .setRequired(true)
        )
        .addStringOption(option =>
            option
                .setName('prize')
                .setDescription('Prize description')
                .setRequired(true)
        ),
    category: 'giveaway',

    async execute(interaction) {
        if (!interaction.guild) return;

        try {
            const embed = new EmbedBuilder()
                .setColor('#5865F2')
                .setTitle('🚧 Command In Development')
                .setDescription(`This command is currently being developed!\n\n**Command:** \`/gstart\`\n**Category:** giveaway\n\nCheck back soon for updates!`)
                .setFooter({ text: 'Coming soon!' })
                .setTimestamp();

            await interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral });
        } catch (error: any) {
            console.error('gstart command error:', error);
            await interaction.reply({
                content: '❌ An error occurred while executing this command',
                flags: MessageFlags.Ephemeral
            });
        }
    }
};
