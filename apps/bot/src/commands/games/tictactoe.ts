/**
 * Tictactoe Command
 * 
 * Play tic-tac-toe
 */

import { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits, MessageFlags } from 'discord.js';
import type { Command } from '../../types/command';


export const tictactoe: Command = {
    data: new SlashCommandBuilder()
        .setName('tictactoe')
        .setDescription('Play tic-tac-toe')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
        .setDMPermission(false),
    category: 'games',

    async execute(interaction) {
        if (!interaction.guild) return;

        

        try {
            // TODO: Implement tictactoe command logic
            
            const embed = new EmbedBuilder()
                .setColor('#5865F2')
                .setTitle('🚧 Command In Development')
                .setDescription('This command is currently being developed and will be available soon!')
                .setTimestamp();

            await interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral });
        } catch (error: any) {
            console.error('tictactoe command error:', error);
            await interaction.reply({
                content: error.response?.data?.message || '❌ An error occurred',
                flags: MessageFlags.Ephemeral
            });
        }
    }
};
