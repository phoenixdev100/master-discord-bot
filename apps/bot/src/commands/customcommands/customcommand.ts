import { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits, MessageFlags } from 'discord.js';
import type { Command } from '../../types/command';

export const customcommand: Command = {
    data: new SlashCommandBuilder()
        .setName('customcommand')
        .setDescription('Create and manage custom server commands')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
        .setDMPermission(false),
    category: 'customcommands',
    async execute(interaction) {
        if (!interaction.guild) return;
        try {
            const embed = new EmbedBuilder()
                .setColor('#5865F2')
                .setTitle('🚧 Command In Development')
                .setDescription('This command is currently being developed and will be available soon!')
                .setTimestamp();
            await interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral });
        } catch (error: any) {
            console.error('customcommand command error:', error);
            await interaction.reply({ content: '❌ An error occurred', flags: MessageFlags.Ephemeral });
        }
    },
};
