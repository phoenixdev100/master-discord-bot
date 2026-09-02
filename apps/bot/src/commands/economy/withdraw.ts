import { SlashCommandBuilder, EmbedBuilder, MessageFlags } from 'discord.js';
import type { Command } from '../../types/command';
import { apiClient } from '../../utils/api-client';

export const withdraw: Command = {
    data: new SlashCommandBuilder()
        .setName('withdraw')
        .setDescription('Withdraw money from your bank')
        .addIntegerOption(option =>
            option
                .setName('amount')
                .setDescription('Amount to withdraw')
                .setRequired(true)
                .setMinValue(1)
        ),
    category: 'economy',
    async execute(interaction) {
        if (!interaction.guild) return;

        const amount = interaction.options.getInteger('amount', true);

        try {
            const response = await apiClient.post(
                `/guilds/${interaction.guild.id}/economy/${interaction.user.id}/withdraw`,
                { amount }
            );

            const responseData = response as { data?: { withdrawn: number; newBalance: number; newBank: number } };
            const { withdrawn = 0, newBalance = 0, newBank = 0 } = responseData.data || {};

            const embed = new EmbedBuilder()
                .setColor('#3498DB')
                .setTitle('💵 Withdrawal Successful!')
                .setDescription(`You withdrew **🪙 ${withdrawn.toLocaleString()}** from your bank.`)
                .addFields(
                    { name: '💵 Wallet', value: `🪙 ${newBalance.toLocaleString()}`, inline: true },
                    { name: '🏦 Bank', value: `🪙 ${newBank.toLocaleString()}`, inline: true }
                )
                .setTimestamp();

            await interaction.reply({ embeds: [embed] });
        } catch (error: any) {
            if (error.response?.status === 400) {
                await interaction.reply({
                    content: '❌ Insufficient funds in bank!',
                    flags: MessageFlags.Ephemeral
                });
            } else {
                await interaction.reply({
                    content: '❌ Failed to withdraw. Make sure economy is enabled!',
                    flags: MessageFlags.Ephemeral
                });
            }
        }
    },
};
