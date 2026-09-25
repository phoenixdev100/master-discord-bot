/**
 * Unmute Command
 * 
 * Removes timeout from a user.
 */

import { SlashCommandBuilder, PermissionFlagsBits, ChatInputCommandInteraction, MessageFlags } from 'discord.js';
import type { Command } from '../../types';
import { apiClient } from '../../utils/api-client';

export const command: Command = {
    data: new SlashCommandBuilder()
        .setName('unmute')
        .setDescription('Unmute a user (remove timeout)')
        .addUserOption(option =>
            option
                .setName('user')
                .setDescription('The user to unmute')
                .setRequired(true)
        )
        .addStringOption(option =>
            option
                .setName('reason')
                .setDescription('Reason for unmuting')
                .setRequired(false)
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
        .setDMPermission(false),
    category: 'moderation',

    async execute(interaction: ChatInputCommandInteraction) {
        if (!interaction.guild) {
            return interaction.reply({
                content: '❌ This command can only be used in a server.',
                flags: MessageFlags.Ephemeral,
            });
        }

        const user = interaction.options.getUser('user', true);
        const reason = interaction.options.getString('reason') || 'No reason provided';

        await interaction.deferReply();

        try {
            const member = await interaction.guild.members.fetch(user.id).catch(() => null);

            if (!member) {
                return interaction.editReply({
                    content: '❌ User is not in this server.',
                });
            }

            if (!member.communicationDisabledUntil) {
                return interaction.editReply({
                    content: '❌ This user is not muted.',
                });
            }

            // Create moderation case via API
            const response = await apiClient.post(
                `/guilds/${interaction.guild.id}/moderation/unmute`,
                {
                    userId: user.id,
                    moderatorId: interaction.user.id,
                    reason,
                }
            );

            const responseData = response as { success: boolean; case?: { caseNumber: number } };
            if (!responseData.success) {
                throw new Error('Failed to create moderation case');
            }

            // Remove Discord timeout
            await member.timeout(null, `${reason} | Moderator: ${interaction.user.tag}`);

            await interaction.editReply({
                content: `✅ **${user.tag}** has been unmuted.\n**Reason:** ${reason}\n**Case #${responseData.case?.caseNumber || 'N/A'}**`,
            });

            // Try to DM the user
            try {
                await user.send({
                    content: `You have been unmuted in **${interaction.guild.name}**.\n**Reason:** ${reason}`,
                });
            } catch {
                // User has DMs disabled, ignore
            }
            return;

        } catch (error) {
            console.error('Failed to unmute user:', error, { guildId: interaction.guild.id, userId: user.id });

            return interaction.editReply({
                content: '❌ Failed to unmute user. Please check my permissions and try again.',
            });
        }
    },
};
