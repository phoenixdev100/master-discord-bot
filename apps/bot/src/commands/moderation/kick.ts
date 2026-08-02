/**
 * Kick Command
 * 
 * Kicks a user from the server.
 */

import { SlashCommandBuilder, PermissionFlagsBits, ChatInputCommandInteraction, MessageFlags } from 'discord.js';
import type { Command } from '../../types';
import { apiClient } from '../../utils/api-client';

export const command: Command = {
    data: new SlashCommandBuilder()
        .setName('kick')
        .setDescription('Kick a user from the server')
        .addUserOption(option =>
            option
                .setName('user')
                .setDescription('The user to kick')
                .setRequired(true)
        )
        .addStringOption(option =>
            option
                .setName('reason')
                .setDescription('Reason for the kick')
                .setRequired(false)
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers)
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

        if (user.id === interaction.user.id) {
            return interaction.reply({
                content: '❌ You cannot kick yourself!',
                flags: MessageFlags.Ephemeral,
            });
        }

        if (user.id === interaction.client.user.id) {
            return interaction.reply({
                content: '❌ I cannot kick myself!',
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
                    content: '❌ You cannot kick this user due to role hierarchy.',
                });
            }

            const botMember = await interaction.guild.members.fetch(interaction.client.user.id);
            if (member.roles.highest.position >= botMember.roles.highest.position) {
                return interaction.editReply({
                    content: '❌ I cannot kick this user due to role hierarchy.',
                });
            }

            // Create moderation case via API
            const response = await apiClient.post(
                `/guilds/${interaction.guild.id}/moderation/kick`,
                {
                    userId: user.id,
                    reason,
                }
            );

            const responseData = response as { success: boolean; case?: { caseNumber: number } };
            if (!responseData.success) {
                throw new Error('Failed to create moderation case');
            }

            // Execute Discord kick
            await member.kick(`${reason} | Moderator: ${interaction.user.tag}`);

            await interaction.editReply({
                content: `✅ **${user.tag}** has been kicked.\n**Reason:** ${reason}\n**Case #${responseData.case?.caseNumber || 'N/A'}**`,
            });

            // Try to DM the user
            try {
                await user.send({
                    content: `You have been kicked from **${interaction.guild.name}**.\n**Reason:** ${reason}`,
                });
            } catch {
                // User has DMs disabled, ignore
            }
            return;

        } catch (error) {
            console.error('Failed to kick user:', error, { guildId: interaction.guild.id, userId: user.id });

            return interaction.editReply({
                content: '❌ Failed to kick user. Please check my permissions and try again.',
            });
        }
    },
};
