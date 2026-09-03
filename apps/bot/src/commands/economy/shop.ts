/**
 * Shop Command
 * 
 * View the shop
 */

import { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits, MessageFlags } from 'discord.js';
import type { Command } from '../../types/command';


export const shop: Command = {
    data: new SlashCommandBuilder()
        .setName('shop')
        .setDescription('View the shop')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
        .setDMPermission(false),
    category: 'economy',

    async execute(interaction) {
        if (!interaction.guild) return;

        

        try {
            // TODO: Implement shop command logic
            
            const embed = new EmbedBuilder()
                .setColor('#5865F2')
                .setTitle('🚧 Command In Development')
                .setDescription('This command is currently being developed and will be available soon!')
                .setTimestamp();

            await interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral });
        } catch (error: any) {
            console.error('shop command error:', error);
            await interaction.reply({
                content: error.response?.data?.message || '❌ An error occurred',
                flags: MessageFlags.Ephemeral
            });
        }
    }
};
