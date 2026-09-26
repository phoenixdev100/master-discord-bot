import { SlashCommandBuilder, EmbedBuilder, MessageFlags } from 'discord.js';
import type { Command } from '../../types/command';

export const report: Command = {
    data: new SlashCommandBuilder()
        .setName('report')
        .setDescription('Report a user or message to the staff team')
        .addUserOption(o => o.setName('user').setDescription('User to report').setRequired(true))
        .addStringOption(o => o.setName('reason').setDescription('Reason for the report').setRequired(true))
        .setDMPermission(false),
    category: 'reports',
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
            console.error('report command error:', error);
            await interaction.reply({ content: '❌ An error occurred', flags: MessageFlags.Ephemeral });
        }
    },
};
