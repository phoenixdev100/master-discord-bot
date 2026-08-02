import { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits, MessageFlags } from 'discord.js';
import type { Command } from '../../types/command';
import { apiClient } from '../../utils/api-client';

export const unban: Command = {
    data: new SlashCommandBuilder()
        .setName('unban')
        .setDescription('Unban a user from the server')
        .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers)
        .addStringOption(option =>
            option
                .setName('userid')
                .setDescription('The ID of the user to unban')
                .setRequired(true)
        )
        .addStringOption(option =>
            option
                .setName('reason')
                .setDescription('Reason for the unban')
        ),
    category: 'moderation',
    async execute(interaction) {
        if (!interaction.guild) return;

        const userId = interaction.options.getString('userid', true);
        const reason = interaction.options.getString('reason') || 'No reason provided';

        try {
            // Check if user is actually banned
            const bans = await interaction.guild.bans.fetch();
            const bannedUser = bans.get(userId);

            if (!bannedUser) {
                await interaction.reply({
                    content: '❌ This user is not banned!',
                    flags: MessageFlags.Ephemeral
                });
                return;
            }

            // Unban the user
            await interaction.guild.members.unban(userId, reason);

            // Log to API
            await apiClient.post(`/guilds/${interaction.guild.id}/moderation/unban`, {
                userId,
                moderatorId: interaction.user.id,
                reason
            });

            const embed = new EmbedBuilder()
                .setColor('#2ECC71')
                .setTitle('✅ User Unbanned')
                .setDescription(`${bannedUser.user.tag} has been unbanned.`)
                .addFields(
                    { name: 'User', value: `${bannedUser.user.tag} (${userId})`, inline: true },
                    { name: 'Moderator', value: interaction.user.tag, inline: true },
                    { name: 'Reason', value: reason }
                )
                .setTimestamp();

            await interaction.reply({ embeds: [embed] });
        } catch (error) {
            await interaction.reply({
                content: '❌ Failed to unban user. Make sure the user ID is correct and I have the Ban Members permission!',
                flags: MessageFlags.Ephemeral
            });
        }
    },
};
