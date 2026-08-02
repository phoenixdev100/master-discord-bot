/**
 * Ban Command
 * 
 * Bans a user from the server with optional duration and reason.
 */

import { SlashCommandBuilder, PermissionFlagsBits, ChatInputCommandInteraction, MessageFlags } from 'discord.js';
import type { Command } from '../../types/command';
import { apiClient } from '../../utils/api-client';

export const command: Command = {
    data: new SlashCommandBuilder()
        .setName('ban')
        .setDescription('Ban a user from the server')
        .addUserOption(option =>
            option
                .setName('user')
                .setDescription('The user to ban')
                .setRequired(true)
        )
        .addStringOption(option =>
            option
                .setName('reason')
                .setDescription('Reason for the ban')
                .setRequired(false)
        )
        .addIntegerOption(option =>
            option
                .setName('duration')
                .setDescription('Ban duration in days (leave empty for permanent)')
                .setRequired(false)
                .setMinValue(1)
                .setMaxValue(365)
        )
        .addIntegerOption(option =>
            option
                .setName('delete_days')
                .setDescription('Number of days of messages to delete (0-7)')
                .setRequired(false)
                .setMinValue(0)
                .setMaxValue(7)
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers)
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
        const durationDays = interaction.options.getInteger('duration');
        const deleteMessageDays = interaction.options.getInteger('delete_days') || 0;

        // Check if user is trying to ban themselves
        if (user.id === interaction.user.id) {
            return interaction.reply({
                content: '❌ You cannot ban yourself!',
                flags: MessageFlags.Ephemeral,
            });
        }

        // Check if user is trying to ban the bot
        if (user.id === interaction.client.user.id) {
            return interaction.reply({
                content: '❌ I cannot ban myself!',
                flags: MessageFlags.Ephemeral,
            });
        }

        await interaction.deferReply();

        try {
            // Get member to check role hierarchy
            const member = await interaction.guild.members.fetch(user.id).catch(() => null);

            if (member) {
                const executorMember = await interaction.guild.members.fetch(interaction.user.id);

                // Check role hierarchy
                if (member.roles.highest.position >= executorMember.roles.highest.position) {
                    return interaction.editReply({
                        content: '❌ You cannot ban this user due to role hierarchy.',
                    });
                }

                // Check if bot can ban this user
                const botMember = await interaction.guild.members.fetch(interaction.client.user.id);
                if (member.roles.highest.position >= botMember.roles.highest.position) {
                    return interaction.editReply({
                        content: '❌ I cannot ban this user due to role hierarchy.',
                    });
                }
            }

            // Calculate duration in seconds if specified
            const duration = durationDays ? durationDays * 24 * 60 * 60 : undefined;

            // Create moderation case via API
            const response = await apiClient.post(
                `/guilds/${interaction.guild.id}/moderation/ban`,
                {
                    userId: user.id,
                    reason,
                    duration,
                    deleteMessageDays,
                }
            );

            const responseData = response as { success?: boolean; case?: { caseNumber: number } };
            if (!responseData.success) {
                throw new Error('Failed to create moderation case');
            }

            // Execute Discord ban
            await interaction.guild.members.ban(user.id, {
                reason: `${reason} | Moderator: ${interaction.user.tag}`,
                deleteMessageDays,
            });

            // Send success message
            const durationText = durationDays ? ` for ${durationDays} day(s)` : ' permanently';
            await interaction.editReply({
                content: `✅ **${user.tag}** has been banned${durationText}.\n**Reason:** ${reason}\n**Case #${responseData.case?.caseNumber || 'N/A'}**`,
            });

            // Try to DM the user
            try {
                await user.send({
                    content: `You have been banned from **${interaction.guild.name}**${durationText}.\n**Reason:** ${reason}`,
                });
            } catch {
                // User has DMs disabled, ignore
            }
            return;

        } catch (error) {
            console.error('Failed to ban user:', error);

            return interaction.editReply({
                content: '❌ Failed to ban user. Please check my permissions and try again.',
            });
        }
    },
};
