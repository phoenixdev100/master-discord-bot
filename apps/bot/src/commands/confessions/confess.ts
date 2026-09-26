import { SlashCommandBuilder, EmbedBuilder, MessageFlags } from 'discord.js';
import type { Command } from '../../types/command';

export const confess: Command = {
    data: new SlashCommandBuilder()
        .setName('confess')
        .setDescription('Post an anonymous confession')
        .addStringOption(o => o.setName('message').setDescription('Your confession').setRequired(true))
        .setDMPermission(false),
    category: 'confessions',
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
            console.error('confess command error:', error);
            await interaction.reply({ content: '❌ An error occurred', flags: MessageFlags.Ephemeral });
        }
    },
};
