import { SlashCommandBuilder, EmbedBuilder, MessageFlags } from 'discord.js';
import type { Command } from '../../types/command';

export const userinfo: Command = {
    data: new SlashCommandBuilder()
        .setName('userinfo')
        .setDescription('Display information about a user')
        .addUserOption(option =>
            option
                .setName('user')
                .setDescription('The user to get information about')
                .setRequired(false)
        ),
    category: 'utility',
    async execute(interaction) {
        const targetUser = interaction.options.getUser('user') || interaction.user;
        const member = interaction.guild?.members.cache.get(targetUser.id);

        if (!member) {
            await interaction.reply({ content: 'User not found in this server.', flags: MessageFlags.Ephemeral });
            return;
        }

        const roles = member.roles.cache
            .filter(role => role.id !== interaction.guild?.id)
            .sort((a, b) => b.position - a.position)
            .map(role => role.toString())
            .slice(0, 10);

        const embed = new EmbedBuilder()
            .setColor(member.displayHexColor || '#5865F2')
            .setTitle(`👤 ${targetUser.tag}`)
            .setThumbnail(targetUser.displayAvatarURL({ size: 256 }))
            .addFields(
                { name: '🆔 User ID', value: targetUser.id, inline: true },
                { name: '📛 Nickname', value: member.nickname || 'None', inline: true },
                { name: '🤖 Bot', value: targetUser.bot ? 'Yes' : 'No', inline: true },
                { name: '📅 Account Created', value: `<t:${Math.floor(targetUser.createdTimestamp / 1000)}:R>`, inline: true },
                { name: '📥 Joined Server', value: member.joinedAt ? `<t:${Math.floor(member.joinedAt.getTime() / 1000)}:R>` : 'Unknown', inline: true },
                { name: '🎨 Accent Color', value: member.displayHexColor || 'None', inline: true },
                { name: `🎭 Roles [${member.roles.cache.size - 1}]`, value: roles.length > 0 ? roles.join(', ') : 'None', inline: false }
            )
            .setFooter({ text: `Requested by ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL() })
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    },
};
