import { SlashCommandBuilder, EmbedBuilder, MessageFlags } from 'discord.js';
import type { Command } from '../../types/command';

export const translate: Command = {
    data: new SlashCommandBuilder()
        .setName('translate')
        .setDescription('Translate text to another language')
        .addStringOption(o => o.setName('text').setDescription('Text to translate').setRequired(true))
        .addStringOption(o => o.setName('language').setDescription('Target language (e.g. es, fr, hi)'))
        .setDMPermission(false),
    category: 'translation',
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
            console.error('translate command error:', error);
            await interaction.reply({ content: '❌ An error occurred', flags: MessageFlags.Ephemeral });
        }
    },
};
