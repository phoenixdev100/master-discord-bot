/**
 * Mute Command
 * 
 * Mutes a user (timeout) with optional duration.
 */

import { SlashCommandBuilder, PermissionFlagsBits, ChatInputCommandInteraction, MessageFlags } from 'discord.js';
import type { Command } from '../../types';
import { apiClient } from '../../utils/api-client';

export const command: Command = {
    data: new SlashCommandBuilder()
        .setName('mute')
        .setDescription('Mute a user (timeout)')
        .addUserOption(option =>
            option
                .setName('user')
                .setDescription('The user to mute')
                .setRequired(true)
        )
        .addIntegerOption(option =>
            option
                .setName('duration')
                .setDescription('Mute duration in minutes (max 40320 = 28 days)')
                .setRequired(true)
                .setMinValue(1)
                .setMaxValue(40320)
        )
        .addStringOption(option =>
            option
                .setName('reason')
                .setDescription('Reason for the mute')
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
        const durationMinutes = interaction.options.getInteger('duration', true);
        const reason = interaction.options.getString('reason') || 'No reason provided';

        if (user.id === interaction.user.id) {
            return interaction.reply({
                content: '❌ You cannot mute yourself!',
                flags: MessageFlags.Ephemeral,
            });
        }

        if (user.id === interaction.client.user.id) {
            return interaction.reply({
                content: '❌ I cannot mute myself!',
                flags: MessageFlags.Ephemeral,
            });
        }

        await interaction.deferReply();

        try {
            const member = await interaction.guild.members.fetch(user.id).catch(() => null);

            if (!member) {
                return interaction.editReply({
                    content: '❌ User is not in this server.',
                });
            }

            const executorMember = await interaction.guild.members.fetch(interaction.user.id);

            if (member.roles.highest.position >= executorMember.roles.highest.position) {
                return interaction.editReply({
                    content: '❌ You cannot mute this user due to role hierarchy.',
                });
            }

            const botMember = await interaction.guild.members.fetch(interaction.client.user.id);
            if (member.roles.highest.position >= botMember.roles.highest.position) {
                return interaction.editReply({
                    content: '❌ I cannot mute this user due to role hierarchy.',
                });
            }

            const durationSeconds = durationMinutes * 60;

            // Create moderation case via API
            const response = await apiClient.post(
                `/guilds/${interaction.guild.id}/moderation/mute`,
                {
                    userId: user.id,
                    reason,
                    duration: durationSeconds,
                }
            );

            const responseData = response as { success: boolean; case?: { caseNumber: number } };
            if (!responseData.success) {
                throw new Error('Failed to create moderation case');
            }

            // Execute Discord timeout
            const durationMs = durationMinutes * 60 * 1000;
            await member.timeout(durationMs, `${reason} | Moderator: ${interaction.user.tag}`);

            const durationText = durationMinutes < 60
                ? `${durationMinutes} minute(s)`
                : `${Math.floor(durationMinutes / 60)} hour(s)`;

            await interaction.editReply({
                content: `✅ **${user.tag}** has been muted for ${durationText}.\n**Reason:** ${reason}\n**Case #${responseData.case?.caseNumber || 'N/A'}**`,
            });

            // Try to DM the user
            try {
                await user.send({
                    content: `You have been muted in **${interaction.guild.name}** for ${durationText}.\n**Reason:** ${reason}`,
                });
            } catch {
                // User has DMs disabled, ignore
            }
            return;

        } catch (error) {
            console.error('Failed to mute user:', error, { guildId: interaction.guild.id, userId: user.id });

            return interaction.editReply({
                content: '❌ Failed to mute user. Please check my permissions and try again.',
            });
        }
    },
};
