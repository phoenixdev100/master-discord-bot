/**
 * Warn Command
 * 
 * Issues a warning to a user.
 */

import { SlashCommandBuilder, PermissionFlagsBits, ChatInputCommandInteraction, EmbedBuilder, MessageFlags } from 'discord.js';
import type { Command } from '../../types';
import { apiClient } from '../../utils/api-client';

export const command: Command = {
    data: new SlashCommandBuilder()
        .setName('warn')
        .setDescription('Warn a user')
        .addUserOption(option =>
            option
                .setName('user')
                .setDescription('The user to warn')
                .setRequired(true)
        )
        .addStringOption(option =>
            option
                .setName('reason')
                .setDescription('Reason for the warning')
                .setRequired(true)
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
        const reason = interaction.options.getString('reason', true);

        if (user.id === interaction.user.id) {
            return interaction.reply({
                content: '❌ You cannot warn yourself!',
                flags: MessageFlags.Ephemeral,
            });
        }

        if (user.bot) {
            return interaction.reply({
                content: '❌ You cannot warn bots!',
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

            // Create moderation case and warning via API
            const response = await apiClient.post(
                `/guilds/${interaction.guild.id}/moderation/warn`,
                {
                    userId: user.id,
                    moderatorId: interaction.user.id,
                    reason,
                }
            );

            const responseData = response as { success: boolean; case?: { caseNumber: number } };
            if (!responseData.success) {
                throw new Error('Failed to create warning');
            }

            const warningsResponse = await apiClient.get(
                `/guilds/${interaction.guild.id}/moderation/warnings/${user.id}`
            );

            const warningsData = warningsResponse as { success: boolean; count?: number };
            const warningCount = warningsData.success ? (warningsData.count || 1) : 1;

            await interaction.editReply({
                content: `✅ **${user.tag}** has been warned.\n**Reason:** ${reason}\n**Case #${responseData.case?.caseNumber || 'N/A'}**\n**Total Warnings:** ${warningCount}`,
            });

            // Try to DM the user
            try {
                const embed = new EmbedBuilder()
                    .setColor(0xFFA500)
                    .setTitle('⚠️ Warning Received')
                    .setDescription(`You have been warned in **${interaction.guild.name}**`)
                    .addFields(
                        { name: 'Reason', value: reason },
                        { name: 'Moderator', value: interaction.user.tag },
                        { name: 'Total Warnings', value: warningCount.toString() }
                    )
                    .setTimestamp();

                await user.send({ embeds: [embed] });
            } catch {
                // User has DMs disabled, ignore
            }
            return;

        } catch (error) {
            console.error('Failed to warn user:', error, { guildId: interaction.guild.id, userId: user.id });

            return interaction.editReply({
                content: '❌ Failed to warn user. Please try again.',
            });
        }
    },
};
