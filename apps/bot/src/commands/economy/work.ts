import { SlashCommandBuilder, EmbedBuilder, MessageFlags } from 'discord.js';
import type { Command } from '../../types/command';
import { apiClient } from '../../utils/api-client';

export const work: Command = {
    data: new SlashCommandBuilder()
        .setName('work')
        .setDescription('Work to earn money'),
    category: 'economy',
    async execute(interaction) {
        if (!interaction.guild) return;

        try {
            const response = await apiClient.post(
                `/guilds/${interaction.guild.id}/economy/${interaction.user.id}/work`
            );

            const responseData = response as { data?: { amount: number; job: string; newBalance: number } };
            const { amount = 0, job = 'Worker', newBalance = 0 } = responseData.data || {};

            const embed = new EmbedBuilder()
                .setColor('#2ECC71')
                .setTitle('💼 Work Complete!')
                .setDescription(`You worked as a **${job}** and earned **🪙 ${amount.toLocaleString()}**!`)
                .addFields({ name: '💵 New Balance', value: `🪙 ${newBalance.toLocaleString()}` })
                .setFooter({ text: 'Come back later to work again!' })
                .setTimestamp();

            await interaction.reply({ embeds: [embed] });
        } catch (error: any) {
            if (error.response?.status === 429) {
                const timeLeft = error.response.data.timeLeft;
                const minutes = Math.floor(timeLeft / 60);
                const seconds = timeLeft % 60;

                await interaction.reply({
                    content: `⏰ You're tired! Rest for **${minutes}m ${seconds}s** before working again.`,
                    flags: MessageFlags.Ephemeral
                });
            } else {
                await interaction.reply({
                    content: '❌ Failed to work. Make sure economy is enabled!',
                    flags: MessageFlags.Ephemeral
                });
            }
        }
    },
};
