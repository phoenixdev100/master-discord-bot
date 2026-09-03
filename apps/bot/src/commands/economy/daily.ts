import { SlashCommandBuilder, EmbedBuilder, MessageFlags } from 'discord.js';
import type { Command } from '../../types/command';
import { apiClient } from '../../utils/api-client';

export const daily: Command = {
    data: new SlashCommandBuilder()
        .setName('daily')
        .setDescription('Claim your daily reward'),
    category: 'economy',
    async execute(interaction) {
        if (!interaction.guild) return;

        try {
            const response = await apiClient.post(
                `/guilds/${interaction.guild.id}/economy/${interaction.user.id}/daily`
            );

            const responseData = response as { data?: { amount: number; newBalance: number; streak: number } };
            const { amount = 0, newBalance = 0, streak = 0 } = responseData.data || {};

            const embed = new EmbedBuilder()
                .setColor('#2ECC71')
                .setTitle('💰 Daily Reward Claimed!')
                .setDescription(`You received **🪙 ${amount.toLocaleString()}**!`)
                .addFields(
                    { name: '💵 New Balance', value: `🪙 ${newBalance.toLocaleString()}`, inline: true },
                    { name: '🔥 Streak', value: `${streak} days`, inline: true }
                )
                .setFooter({ text: 'Come back tomorrow for another reward!' })
                .setTimestamp();

            await interaction.reply({ embeds: [embed] });
        } catch (error: any) {
            if (error.response?.status === 429) {
                const timeLeft = error.response.data.timeLeft;
                const hours = Math.floor(timeLeft / 3600);
                const minutes = Math.floor((timeLeft % 3600) / 60);

                await interaction.reply({
                    content: `⏰ You already claimed your daily reward! Come back in **${hours}h ${minutes}m**.`,
                    flags: MessageFlags.Ephemeral
                });
            } else {
                await interaction.reply({
                    content: 'Failed to claim daily reward. Make sure economy is enabled!',
                    flags: MessageFlags.Ephemeral
                });
            }
        }
    },
};
