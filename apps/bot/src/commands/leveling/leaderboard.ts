import { SlashCommandBuilder, EmbedBuilder, MessageFlags } from 'discord.js';
import type { Command } from '../../types/command';
import { apiClient } from '../../utils/api-client';

export const leaderboard: Command = {
    data: new SlashCommandBuilder()
        .setName('leaderboard')
        .setDescription('View the server XP leaderboard')
        .addIntegerOption(option =>
            option
                .setName('page')
                .setDescription('Page number to view')
                .setRequired(false)
                .setMinValue(1)
        ),
    category: 'leveling',
    async execute(interaction) {
        if (!interaction.guild) return;

        const page = interaction.options.getInteger('page') || 1;

        try {
            const response = await apiClient.get(
                `/guilds/${interaction.guild.id}/leveling/leaderboard?page=${page}&limit=10`
            );

            interface LeaderboardUser {
                userId: string;
                level: number;
                xp: number;
            }
            const responseData = response as { data?: { users: LeaderboardUser[]; total: number } };
            const { users = [], total = 0 } = responseData.data || {};
            const totalPages = Math.ceil(total / 10);

            if (users.length === 0) {
                await interaction.reply({
                    content: 'No leveling data available yet!',
                    flags: MessageFlags.Ephemeral
                });
                return;
            }

            const leaderboardText = users.map((user: any, index: number) => {
                const position = (page - 1) * 10 + index + 1;
                const medal = position === 1 ? '🥇' : position === 2 ? '🥈' : position === 3 ? '🥉' : `**${position}.**`;
                return `${medal} <@${user.userId}> - Level ${user.level} (${user.xp} XP)`;
            }).join('\n');

            const embed = new EmbedBuilder()
                .setColor('#FFD700')
                .setTitle(`🏆 ${interaction.guild.name} Leaderboard`)
                .setDescription(leaderboardText)
                .setFooter({ text: `Page ${page}/${totalPages} • Total members: ${total}` })
                .setTimestamp();

            await interaction.reply({ embeds: [embed] });
        } catch (error) {
            await interaction.reply({
                content: 'Failed to fetch leaderboard. Make sure leveling is enabled!',
                flags: MessageFlags.Ephemeral
            });
        }
    },
};
