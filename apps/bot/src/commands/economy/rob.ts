/**
 * Rob Command
 * 
 * Rob another user
 */

import { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits, MessageFlags } from 'discord.js';
import type { Command } from '../../types/command';


export const rob: Command = {
    data: new SlashCommandBuilder()
        .setName('rob')
        .setDescription('Rob another user')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
        .setDMPermission(false),
    category: 'economy',

    async execute(interaction) {
        if (!interaction.guild) return;

        

        try {
            // TODO: Implement rob command logic
            
            const embed = new EmbedBuilder()
                .setColor('#5865F2')
                .setTitle('🚧 Command In Development')
                .setDescription('This command is currently being developed and will be available soon!')
                .setTimestamp();

            await interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral });
        } catch (error: any) {
            console.error('rob command error:', error);
            await interaction.reply({
                content: error.response?.data?.message || '❌ An error occurred',
                flags: MessageFlags.Ephemeral
            });
        }
    }
};
