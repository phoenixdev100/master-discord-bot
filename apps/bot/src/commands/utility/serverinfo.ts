import { SlashCommandBuilder, EmbedBuilder, ChannelType } from 'discord.js';
import type { Command } from '../../types/command';

export const serverinfo: Command = {
    data: new SlashCommandBuilder()
        .setName('serverinfo')
        .setDescription('Display information about this server'),
    category: 'utility',
    async execute(interaction) {
        const { guild } = interaction;
        if (!guild) return;

        const owner = await guild.fetchOwner();
        const channels = guild.channels.cache;
        const textChannels = channels.filter(c => c.type === ChannelType.GuildText).size;
        const voiceChannels = channels.filter(c => c.type === ChannelType.GuildVoice).size;
        const categories = channels.filter(c => c.type === ChannelType.GuildCategory).size;

        const embed = new EmbedBuilder()
            .setColor('#5865F2')
            .setTitle(`📊 ${guild.name}`)
            .setThumbnail(guild.iconURL({ size: 256 }))
            .addFields(
                { name: '🆔 Server ID', value: guild.id, inline: true },
                { name: '👑 Owner', value: `${owner.user.tag}`, inline: true },
                { name: '📅 Created', value: `<t:${Math.floor(guild.createdTimestamp / 1000)}:R>`, inline: true },
                { name: '👥 Members', value: `${guild.memberCount}`, inline: true },
                { name: '📝 Text Channels', value: `${textChannels}`, inline: true },
                { name: '🔊 Voice Channels', value: `${voiceChannels}`, inline: true },
                { name: '📁 Categories', value: `${categories}`, inline: true },
                { name: '😀 Emojis', value: `${guild.emojis.cache.size}`, inline: true },
                { name: '🎭 Roles', value: `${guild.roles.cache.size}`, inline: true },
                { name: '🚀 Boost Level', value: `Level ${guild.premiumTier}`, inline: true },
                { name: '💎 Boosts', value: `${guild.premiumSubscriptionCount || 0}`, inline: true },
                { name: '🔒 Verification', value: guild.verificationLevel.toString(), inline: true }
            )
            .setFooter({ text: `Requested by ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL() })
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    },
};
