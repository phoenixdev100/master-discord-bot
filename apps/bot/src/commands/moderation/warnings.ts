import { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits, MessageFlags } from 'discord.js';
import type { Command } from '../../types/command';
import { apiClient } from '../../utils/api-client';

export const warnings: Command = {
    data: new SlashCommandBuilder()
        .setName('warnings')
        .setDescription('View warnings for a user')
        .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
        .addUserOption(option =>
            option
                .setName('user')
                .setDescription('The user to check warnings for')
                .setRequired(true)
        ),
    category: 'moderation',
    async execute(interaction) {
        if (!interaction.guild) return;

        const targetUser = interaction.options.getUser('user', true);

        try {
            const response = await apiClient.get(
                `/guilds/${interaction.guild.id}/moderation/warnings/${targetUser.id}`
            );

            interface Warning {
                id: string;
                reason: string;
                moderatorId: string;
                createdAt: string;
            }
            const responseData = response as { data?: Warning[] };
            const warnings = responseData.data || [];

            if (warnings.length === 0) {
                await interaction.reply({
                    content: `✅ ${targetUser.tag} has no warnings.`,
                    flags: MessageFlags.Ephemeral
                });
                return;
            }

            const warningList = warnings.map((w: any, index: number) =>
                `**${index + 1}.** ${w.reason}\n` +
                `   Moderator: <@${w.moderatorId}> • <t:${Math.floor(new Date(w.createdAt).getTime() / 1000)}:R>`
            ).join('\n\n');

            const embed = new EmbedBuilder()
                .setColor('#E74C3C')
                .setTitle(`⚠️ Warnings for ${targetUser.tag}`)
                .setDescription(warningList)
                .setFooter({ text: `Total warnings: ${warnings.length}` })
                .setTimestamp();

            await interaction.reply({ embeds: [embed] });
        } catch (error) {
            await interaction.reply({
                content: '❌ Failed to fetch warnings!',
                flags: MessageFlags.Ephemeral
            });
        }
    },
};
