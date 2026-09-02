import { SlashCommandBuilder, EmbedBuilder, MessageFlags } from 'discord.js';
import type { Command } from '../../types/command';
import { apiClient } from '../../utils/api-client';

export const balance: Command = {
    data: new SlashCommandBuilder()
        .setName('balance')
        .setDescription('Check your or another user\'s balance')
        .addUserOption(option =>
            option
                .setName('user')
                .setDescription('The user to check balance for')
                .setRequired(false)
        ),
    category: 'economy',
    async execute(interaction) {
        if (!interaction.guild) return;

        const targetUser = interaction.options.getUser('user') || interaction.user;

        try {
            const response = await apiClient.get(
                `/guilds/${interaction.guild.id}/economy/${targetUser.id}`
            );

            const responseData = response as { data?: { balance: number; bank: number } };
            const { balance = 0, bank = 0 } = responseData.data || {};
            const total = balance + bank;

            const embed = new EmbedBuilder()
                .setColor('#2ECC71')
                .setTitle(`💰 ${targetUser.tag}'s Balance`)
                .setThumbnail(targetUser.displayAvatarURL({ size: 256 }))
                .addFields(
                    { name: '💵 Wallet', value: `🪙 ${balance.toLocaleString()}`, inline: true },
                    { name: '🏦 Bank', value: `🪙 ${bank.toLocaleString()}`, inline: true },
                    { name: '💎 Total', value: `🪙 ${total.toLocaleString()}`, inline: true }
                )
                .setFooter({ text: `Use /daily to claim your daily reward!` })
                .setTimestamp();

            await interaction.reply({ embeds: [embed] });
        } catch (error) {
            await interaction.reply({
                content: 'Failed to fetch balance. Make sure economy is enabled!',
                flags: MessageFlags.Ephemeral
            });
        }
    },
};
