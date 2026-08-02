import { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits, MessageFlags } from 'discord.js';
import type { Command } from '../../types/command';
import { apiClient } from '../../utils/api-client';

export const timeout: Command = {
    data: new SlashCommandBuilder()
        .setName('timeout')
        .setDescription('Timeout a user (prevent them from sending messages)')
        .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
        .addUserOption(option =>
            option
                .setName('user')
                .setDescription('The user to timeout')
                .setRequired(true)
        )
        .addIntegerOption(option =>
            option
                .setName('duration')
                .setDescription('Duration in minutes')
                .setRequired(true)
                .setMinValue(1)
                .setMaxValue(40320) // 28 days max
        )
        .addStringOption(option =>
            option
                .setName('reason')
                .setDescription('Reason for the timeout')
        ),
    category: 'moderation',
    async execute(interaction) {
        if (!interaction.guild) return;

        const targetUser = interaction.options.getUser('user', true);
        const duration = interaction.options.getInteger('duration', true);
        const reason = interaction.options.getString('reason') || 'No reason provided';

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
                content: '❌ You cannot timeout this user due to role hierarchy!',
                flags: MessageFlags.Ephemeral
            });
            return;
        }

        if (!member.moderatable) {
            await interaction.reply({
                content: '❌ I cannot timeout this user!',
                flags: MessageFlags.Ephemeral
            });
            return;
        }

        try {
            const timeoutUntil = new Date(Date.now() + duration * 60 * 1000);
            await member.timeout(duration * 60 * 1000, reason);

            // Log to API
            await apiClient.post(`/guilds/${interaction.guild.id}/moderation/timeout`, {
                userId: targetUser.id,
                moderatorId: interaction.user.id,
                duration,
                reason
            });

            const embed = new EmbedBuilder()
                .setColor('#E67E22')
                .setTitle('⏱️ User Timed Out')
                .setDescription(`${targetUser.tag} has been timed out.`)
                .addFields(
                    { name: 'User', value: `${targetUser} (${targetUser.id})`, inline: true },
                    { name: 'Moderator', value: interaction.user.tag, inline: true },
                    { name: 'Duration', value: `${duration} minutes`, inline: true },
                    { name: 'Until', value: `<t:${Math.floor(timeoutUntil.getTime() / 1000)}:F>`, inline: false },
                    { name: 'Reason', value: reason }
                )
                .setTimestamp();

            await interaction.reply({ embeds: [embed] });
        } catch (error) {
            await interaction.reply({
                content: '❌ Failed to timeout user. Make sure I have the Moderate Members permission!',
                flags: MessageFlags.Ephemeral
            });
        }
    },
};
