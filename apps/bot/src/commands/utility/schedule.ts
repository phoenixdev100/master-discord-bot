/**
 * Schedule Command
 * 
 * Schedule messages
 */

import { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits, MessageFlags } from 'discord.js';
import type { Command } from '../../types/command';

export const schedule: Command = {
    data: new SlashCommandBuilder()
        .setName('schedule')
        .setDescription('Schedule messages')
        .setDefaultMemberPermissions(PermissionFlagsBits.SendMessages)
        .setDMPermission(false)
        .addSubcommand(subcommand =>
            subcommand
                .setName('message')
                .setDescription('Message schedule')
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('list')
                .setDescription('List schedule')
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('cancel')
                .setDescription('Cancel schedule')
        ),
    category: 'utility',

    async execute(interaction) {
        if (!interaction.guild) return;

        try {
            const embed = new EmbedBuilder()
                .setColor('#5865F2')
                .setTitle('🚧 Command In Development')
                .setDescription(`This command is currently being developed!\n\n**Command:** \`/schedule\`\n**Category:** utility\n\nCheck back soon for updates!`)
                .setFooter({ text: 'Coming soon!' })
                .setTimestamp();

            await interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral });
        } catch (error: any) {
            console.error('schedule command error:', error);
            await interaction.reply({
                content: '❌ An error occurred while executing this command',
                flags: MessageFlags.Ephemeral
            });
        }
    }
};
