/**
 * Case Command
 * 
 * View details of a moderation case.
 */

import { SlashCommandBuilder, PermissionFlagsBits, ChatInputCommandInteraction, EmbedBuilder, MessageFlags } from 'discord.js';
import type { Command } from '../../types/command';
import { apiClient } from '../../utils/api-client';

export const command: Command = {
    data: new SlashCommandBuilder()
        .setName('case')
        .setDescription('View details of a moderation case')
        .addIntegerOption(option =>
            option
                .setName('number')
                .setDescription('Case number to view')
                .setRequired(true)
                .setMinValue(1)
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

        const caseNumber = interaction.options.getInteger('number', true);

        await interaction.deferReply();

        try {
            const response = await apiClient.get(
                `/guilds/${interaction.guild.id}/moderation/cases/${caseNumber}`
            );

            interface ModerationCase {
                caseNumber: number;
                type: string;
                targetId: string;
                moderatorId: string;
                reason?: string;
                duration?: number;
                expiresAt?: string;
                isActive: boolean;
                createdAt: string;
            }
            const responseData = response as { success?: boolean; case?: ModerationCase };

            if (!responseData.success || !responseData.case) {
                return interaction.editReply({
                    content: `❌ Case #${caseNumber} not found.`,
                });
            }

            const moderationCase = responseData.case;

            // Fetch user information
            const targetUser = await interaction.client.users.fetch(moderationCase.targetId).catch(() => null);
            const moderatorUser = await interaction.client.users.fetch(moderationCase.moderatorId).catch(() => null);

            const embed = new EmbedBuilder()
                .setColor(moderationCase.isActive ? 0xFF0000 : 0x808080)
                .setTitle(`Case #${moderationCase.caseNumber}`)
                .addFields(
                    { name: 'Type', value: moderationCase.type.toUpperCase(), inline: true },
                    { name: 'Status', value: moderationCase.isActive ? '🟢 Active' : '⚫ Inactive', inline: true },
                    { name: 'Target', value: targetUser ? `${targetUser.tag} (${targetUser.id})` : moderationCase.targetId, inline: false },
                    { name: 'Moderator', value: moderatorUser ? `${moderatorUser.tag} (${moderatorUser.id})` : moderationCase.moderatorId, inline: false },
                    { name: 'Reason', value: moderationCase.reason || 'No reason provided', inline: false }
                )
                .setTimestamp(new Date(moderationCase.createdAt));

            if (moderationCase.duration) {
                const durationText = moderationCase.duration < 3600
                    ? `${Math.floor(moderationCase.duration / 60)} minutes`
                    : moderationCase.duration < 86400
                        ? `${Math.floor(moderationCase.duration / 3600)} hours`
                        : `${Math.floor(moderationCase.duration / 86400)} days`;

                embed.addFields({ name: 'Duration', value: durationText, inline: true });
            }

            if (moderationCase.expiresAt) {
                embed.addFields({
                    name: 'Expires',
                    value: `<t:${Math.floor(new Date(moderationCase.expiresAt).getTime() / 1000)}:R>`,
                    inline: true
                });
            }

            await interaction.editReply({ embeds: [embed] });
            return;

        } catch (error) {
            console.error('Failed to fetch case:', error);

            return interaction.editReply({
                content: '❌ Failed to fetch case details. Please try again.',
            });
        }
    },
};
