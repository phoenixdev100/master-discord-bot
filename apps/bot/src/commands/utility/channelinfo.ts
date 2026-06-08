import { SlashCommandBuilder, EmbedBuilder, ChannelType, MessageFlags } from 'discord.js';
import type { Command } from '../../types/command';

export const channelinfo: Command = {
    data: new SlashCommandBuilder()
        .setName('channelinfo')
        .setDescription('Get information about a channel')
        .addChannelOption(option =>
            option
                .setName('channel')
                .setDescription('The channel to get information about')
        ),
    category: 'utility',
    async execute(interaction) {
        if (!interaction.guild) return;

        const channel = (interaction.options.getChannel('channel') || interaction.channel) as any;

        if (!channel) {
            await interaction.reply({ content: '❌ Channel not found!', flags: MessageFlags.Ephemeral });
            return;
        }

        const channelTypes: Record<number, string> = {
            [ChannelType.GuildText]: '💬 Text Channel',
            [ChannelType.GuildVoice]: '🔊 Voice Channel',
            [ChannelType.GuildCategory]: '📁 Category',
            [ChannelType.GuildAnnouncement]: '📢 Announcement Channel',
            [ChannelType.GuildStageVoice]: '🎙️ Stage Channel',
            [ChannelType.GuildForum]: '💭 Forum Channel',
        };

        const embed = new EmbedBuilder()
            .setColor('#5865F2')
            .setTitle(`📋 Channel Information: ${channel.name}`)
            .addFields(
                { name: '🆔 ID', value: channel.id, inline: true },
                { name: '📝 Type', value: channelTypes[channel.type] || 'Unknown', inline: true },
                { name: '📍 Position', value: `${channel.position || 'N/A'}`, inline: true },
                { name: '📅 Created', value: `<t:${Math.floor(channel.createdTimestamp / 1000)}:R>`, inline: true }
            );

        if (channel.topic) {
            embed.addFields({ name: '📌 Topic', value: channel.topic, inline: false });
        }

        if (channel.type === ChannelType.GuildText) {
            embed.addFields(
                { name: '🐌 Slowmode', value: channel.rateLimitPerUser ? `${channel.rateLimitPerUser}s` : 'None', inline: true },
                { name: '🔞 NSFW', value: channel.nsfw ? 'Yes' : 'No', inline: true }
            );
        }

        if (channel.type === ChannelType.GuildVoice) {
            embed.addFields(
                { name: '👥 User Limit', value: channel.userLimit ? `${channel.userLimit}` : 'Unlimited', inline: true },
                { name: '🎵 Bitrate', value: `${channel.bitrate / 1000}kbps`, inline: true }
            );
        }

        if (channel.parent) {
            embed.addFields({ name: '📁 Category', value: channel.parent.name, inline: true });
        }

        embed.setFooter({ text: `Requested by ${interaction.user.tag}` })
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    },
};
