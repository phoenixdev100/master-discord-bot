import { SlashCommandBuilder, EmbedBuilder, MessageFlags } from 'discord.js';
import type { Command } from '../../types/command';

export const pet: Command = {
    data: new SlashCommandBuilder()
        .setName('pet')
        .setDescription('View and care for your virtual pet')
        .setDMPermission(false),
    category: 'pets',
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
            console.error('pet command error:', error);
            await interaction.reply({ content: '❌ An error occurred', flags: MessageFlags.Ephemeral });
        }
    },
};
