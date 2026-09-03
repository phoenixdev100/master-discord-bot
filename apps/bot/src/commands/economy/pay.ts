import { SlashCommandBuilder, EmbedBuilder, MessageFlags } from 'discord.js';
import type { Command } from '../../types/command';
import { apiClient } from '../../utils/api-client';

export const pay: Command = {
    data: new SlashCommandBuilder()
        .setName('pay')
        .setDescription('Pay coins to another user')
        .addUserOption(option =>
            option
                .setName('user')
                .setDescription('The user to pay')
                .setRequired(true)
        )
        .addIntegerOption(option =>
            option
                .setName('amount')
                .setDescription('Amount of coins to pay')
                .setRequired(true)
                .setMinValue(1)
        ),
    category: 'economy',
    async execute(interaction) {
        if (!interaction.guild) return;

        const targetUser = interaction.options.getUser('user', true);
        const amount = interaction.options.getInteger('amount', true);

        if (targetUser.id === interaction.user.id) {
            await interaction.reply({
                content: '❌ You cannot pay yourself!',
                flags: MessageFlags.Ephemeral
            });
            return;
        }

        if (targetUser.bot) {
            await interaction.reply({
                content: '❌ You cannot pay bots!',
                flags: MessageFlags.Ephemeral
            });
            return;
        }

        try {
            await apiClient.post(
                `/guilds/${interaction.guild.id}/economy/${interaction.user.id}/pay`,
                {
                    recipientId: targetUser.id,
                    amount
                }
            );

            const embed = new EmbedBuilder()
                .setColor('#2ECC71')
                .setTitle('💸 Payment Successful!')
                .setDescription(`${interaction.user} paid **🪙 ${amount.toLocaleString()}** to ${targetUser}`)
                .setFooter({ text: 'Transaction completed' })
                .setTimestamp();

            await interaction.reply({ embeds: [embed] });
        } catch (error: any) {
            if (error.response?.status === 400) {
                await interaction.reply({
                    content: '❌ Insufficient funds!',
                    flags: MessageFlags.Ephemeral
                });
            } else {
                await interaction.reply({
                    content: 'Failed to process payment. Make sure economy is enabled!',
                    flags: MessageFlags.Ephemeral
                });
            }
        }
    },
};
