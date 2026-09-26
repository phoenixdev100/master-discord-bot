/**
 * DeleteChannel Command
 *
 * Delete a channel from the server.
 */

import { SlashCommandBuilder, PermissionFlagsBits, MessageFlags, ChannelType } from 'discord.js';
import type { Command } from '../../types/command';

export const deletechannel: Command = {
    data: new SlashCommandBuilder()
        .setName('deletechannel')
        .setDescription('Delete a channel')
        .setDMPermission(false)
        .addChannelOption(o =>
            o.setName('channel').setDescription('Channel to delete (default: this one)').setRequired(false)
                .addChannelTypes(ChannelType.GuildText, ChannelType.GuildVoice, ChannelType.GuildAnnouncement, ChannelType.GuildCategory)
        ),
    requiredPermission: PermissionFlagsBits.ManageChannels,
    category: 'admin',

    async execute(interaction) {
        if (!interaction.guild) return;

        const raw = interaction.options.getChannel('channel') ?? interaction.channel;
        const channel = raw ? interaction.guild.channels.cache.get(raw.id) : undefined;
        if (!channel || !('delete' in channel)) {
            await interaction.reply({ content: '❌ Could not resolve that channel.', flags: MessageFlags.Ephemeral });
            return;
        }
        const deletingSelf = channel.id === interaction.channelId;

        try {
            if (deletingSelf) {
                // We must reply BEFORE deleting the channel we are in
                await interaction.reply({ content: `✅ Deleting this channel...`, flags: MessageFlags.Ephemeral });
            }

            await channel.delete(`Deleted by ${interaction.user.tag}`);

            if (!deletingSelf) {
                await interaction.reply({ content: `✅ Channel **#${channel.name}** has been deleted.`, flags: MessageFlags.Ephemeral });
            }
        } catch (error: any) {
            console.error('deletechannel error:', error);
            const content = `❌ Failed to delete channel: ${error.message ?? 'Unknown error'}`;
            if (interaction.replied) {
                await interaction.followUp({ content, flags: MessageFlags.Ephemeral }).catch(() => {});
            } else {
                await interaction.reply({ content, flags: MessageFlags.Ephemeral }).catch(() => {});
            }
        }
    },
};
