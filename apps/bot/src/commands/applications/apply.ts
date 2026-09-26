import { SlashCommandBuilder, EmbedBuilder, MessageFlags } from 'discord.js';
import type { Command } from '../../types/command';

export const apply: Command = {
    data: new SlashCommandBuilder()
        .setName('apply')
        .setDescription('Apply for a staff position via an application form')
        .setDMPermission(false),
    category: 'applications',
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
            console.error('apply command error:', error);
            await interaction.reply({ content: '❌ An error occurred', flags: MessageFlags.Ephemeral });
        }
    },
};
