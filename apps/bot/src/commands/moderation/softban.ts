import { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits, MessageFlags } from 'discord.js';
import type { Command } from '../../types/command';
import { apiClient } from '../../utils/api-client';

export const softban: Command = {
    data: new SlashCommandBuilder()
        .setName('softban')
        .setDescription('Ban and immediately unban a user to delete their messages')
        .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers)
        .addUserOption(option =>
            option
                .setName('user')
                .setDescription('The user to soft ban')
                .setRequired(true)
        )
        .addStringOption(option =>
            option
                .setName('reason')
                .setDescription('Reason for the soft ban')
        )
        .addIntegerOption(option =>
            option
                .setName('days')
                .setDescription('Number of days of messages to delete (1-7)')
                .setMinValue(1)
                .setMaxValue(7)
        ),
    category: 'moderation',
    async execute(interaction) {
        if (!interaction.guild) return;

        const targetUser = interaction.options.getUser('user', true);
        const reason = interaction.options.getString('reason') || 'No reason provided';
        const days = interaction.options.getInteger('days') || 7;

        const member = interaction.guild.members.cache.get(targetUser.id);

        if (!member) {
            await interaction.reply({
                content: '❌ User not found in this server!',
                flags: MessageFlags.Ephemeral
            });
            return;
        }

        if (member.roles.highest.position >= (interaction.member as any).roles.highest.position) {
            await interaction.reply({
                content: '❌ You cannot soft ban this user due to role hierarchy!',
                flags: MessageFlags.Ephemeral
            });
            return;
        }

        try {
            // Ban the user
            await member.ban({ deleteMessageSeconds: days * 24 * 60 * 60, reason });

            // Immediately unban
            await interaction.guild.members.unban(targetUser.id, 'Soft ban - automatic unban');

            // Log to API
            await apiClient.post(`/guilds/${interaction.guild.id}/moderation/softban`, {
                userId: targetUser.id,
                moderatorId: interaction.user.id,
                reason,
                messageDays: days
            });

            const embed = new EmbedBuilder()
                .setColor('#E67E22')
                .setTitle('🔨 User Soft Banned')
                .setDescription(`${targetUser.tag} has been soft banned.`)
                .addFields(
                    { name: 'User', value: `${targetUser} (${targetUser.id})`, inline: true },
                    { name: 'Moderator', value: interaction.user.tag, inline: true },
                    { name: 'Messages Deleted', value: `${days} days`, inline: true },
                    { name: 'Reason', value: reason }
                )
                .setTimestamp();

            await interaction.reply({ embeds: [embed] });
        } catch (error) {
            await interaction.reply({
                content: '❌ Failed to soft ban user. Make sure I have the Ban Members permission!',
                flags: MessageFlags.Ephemeral
            });
        }
    },
};
