/**
 * Eventremind Command
 * 
 * Set event reminder
 */

import { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits, MessageFlags } from 'discord.js';
import type { Command } from '../../types/command';

export const eventremind: Command = {
    data: new SlashCommandBuilder()
        .setName('eventremind')
        .setDescription('Set event reminder')
        .setDefaultMemberPermissions(PermissionFlagsBits.SendMessages)
        .setDMPermission(false)
        .addStringOption(option =>
            option
                .setName('event_id')
                .setDescription('Event ID')
                .setRequired(true)
        )
        .addStringOption(option =>
            option
                .setName('time')
                .setDescription('Reminder time')
                .setRequired(true)
        ),
    category: 'events',

    async execute(interaction) {
        if (!interaction.guild) return;

        try {
            const embed = new EmbedBuilder()
                .setColor('#5865F2')
                .setTitle('🚧 Command In Development')
                .setDescription(`This command is currently being developed!\n\n**Command:** \`/eventremind\`\n**Category:** events\n\nCheck back soon for updates!`)
                .setFooter({ text: 'Coming soon!' })
                .setTimestamp();

            await interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral });
        } catch (error: any) {
            console.error('eventremind command error:', error);
            await interaction.reply({
                content: '❌ An error occurred while executing this command',
                flags: MessageFlags.Ephemeral
            });
        }
    }
};
