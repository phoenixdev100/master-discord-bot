import { SlashCommandBuilder, EmbedBuilder, MessageFlags } from 'discord.js';
import type { Command } from '../../types/command';
import { apiClient } from '../../utils/api-client';

export const deposit: Command = {
    data: new SlashCommandBuilder()
        .setName('deposit')
        .setDescription('Deposit money to your bank')
        .addIntegerOption(option =>
            option
                .setName('amount')
                .setDescription('Amount to deposit (use "all" for everything)')
                .setRequired(true)
                .setMinValue(1)
        ),
    category: 'economy',
    async execute(interaction) {
        if (!interaction.guild) return;

        const amount = interaction.options.getInteger('amount', true);

        try {
            const response = await apiClient.post(
                `/guilds/${interaction.guild.id}/economy/${interaction.user.id}/deposit`,
                { amount }
            );

            const responseData = response as { data?: { deposited: number; newBalance: number; newBank: number } };
            const { deposited = 0, newBalance = 0, newBank = 0 } = responseData.data || {};

            const embed = new EmbedBuilder()
                .setColor('#2ECC71')
                .setTitle('🏦 Deposit Successful!')
                .setDescription(`You deposited **🪙 ${deposited.toLocaleString()}** to your bank.`)
                .addFields(
                    { name: '💵 Wallet', value: `🪙 ${newBalance.toLocaleString()}`, inline: true },
                    { name: '🏦 Bank', value: `🪙 ${newBank.toLocaleString()}`, inline: true }
                )
                .setTimestamp();

            await interaction.reply({ embeds: [embed] });
        } catch (error: any) {
            if (error.response?.status === 400) {
                await interaction.reply({
                    content: '❌ Insufficient funds in wallet!',
                    flags: MessageFlags.Ephemeral
                });
            } else {
                await interaction.reply({
                    content: '❌ Failed to deposit. Make sure economy is enabled!',
                    flags: MessageFlags.Ephemeral
                });
            }
        }
    },
};
