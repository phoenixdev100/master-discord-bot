/**
 * ServerIcon Command
 *
 * Update the server icon from an image URL.
 */

import { SlashCommandBuilder, PermissionFlagsBits, MessageFlags } from 'discord.js';
import type { Command } from '../../types/command';

export const servericon: Command = {
    data: new SlashCommandBuilder()
        .setName('servericon')
        .setDescription('Change the server icon')
        .setDMPermission(false)
        .addStringOption(o => o.setName('url').setDescription('Image URL for the new icon').setRequired(true)),
    requiredPermission: PermissionFlagsBits.ManageGuild,
    category: 'admin',

    async execute(interaction) {
        if (!interaction.guild) return;

        const url = interaction.options.getString('url', true);

        if (!/^https?:\/\/\S+\.(png|jpe?g|gif|webp)(\?\S*)?$/i.test(url) && !/^https?:\/\/\S+$/i.test(url)) {
            await interaction.reply({ content: '❌ Please provide a valid image URL (png/jpg/gif/webp).', flags: MessageFlags.Ephemeral });
            return;
        }

        await interaction.deferReply({ flags: MessageFlags.Ephemeral });

        try {
            await interaction.guild.setIcon(url, `Icon changed by ${interaction.user.tag}`);
            await interaction.editReply({ content: '✅ Server icon updated.' });
        } catch (error: any) {
            console.error('servericon error:', error);
            await interaction.editReply({ content: `❌ Failed to set icon: ${error.message ?? 'Unknown error'}` });
        }
    },
};
