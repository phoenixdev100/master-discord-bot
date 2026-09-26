import { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits, MessageFlags } from 'discord.js';
import type { Command } from '../../types/command';

export const devEval: Command = {
    data: new SlashCommandBuilder()
        .setName('eval')
        .setDescription('Evaluate code (bot owner only)')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .setDMPermission(false),
    category: 'dev',
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
            console.error('eval command error:', error);
            await interaction.reply({ content: '❌ An error occurred', flags: MessageFlags.Ephemeral });
        }
    },
};
