/**
 * Timezone Command
 * 
 * Timezone conversion
 */

import { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits, MessageFlags } from 'discord.js';
import type { Command } from '../../types/command';

export const timezone: Command = {
    data: new SlashCommandBuilder()
        .setName('timezone')
        .setDescription('Timezone conversion')
        .setDefaultMemberPermissions(PermissionFlagsBits.SendMessages)
        .setDMPermission(false)
        .addStringOption(option =>
            option
                .setName('time')
                .setDescription('Time to convert')
                .setRequired(true)
        )
        .addStringOption(option =>
            option
                .setName('from_zone')
                .setDescription('From timezone')
                .setRequired(true)
        )
        .addStringOption(option =>
            option
                .setName('to_zone')
                .setDescription('To timezone')
                .setRequired(true)
        ),
    category: 'utility',

    async execute(interaction) {
        if (!interaction.guild) return;

        try {
            const embed = new EmbedBuilder()
                .setColor('#5865F2')
                .setTitle('🚧 Command In Development')
                .setDescription(`This command is currently being developed!\n\n**Command:** \`/timezone\`\n**Category:** utility\n\nCheck back soon for updates!`)
                .setFooter({ text: 'Coming soon!' })
                .setTimestamp();

            await interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral });
        } catch (error: any) {
            console.error('timezone command error:', error);
            await interaction.reply({
                content: '❌ An error occurred while executing this command',
                flags: MessageFlags.Ephemeral
            });
        }
    }
};
