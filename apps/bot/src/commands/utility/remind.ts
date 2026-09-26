import { SlashCommandBuilder, EmbedBuilder, MessageFlags } from 'discord.js';
import type { Command } from '../../types/command';
import { apiClient } from '../../utils/api-client';

export const remind: Command = {
    data: new SlashCommandBuilder()
        .setName('remind')
        .setDescription('Set a reminder')
        .addStringOption(option =>
            option
                .setName('message')
                .setDescription('What to remind you about')
                .setRequired(true)
        )
        .addIntegerOption(option =>
            option
                .setName('time')
                .setDescription('Time in minutes')
                .setRequired(true)
                .setMinValue(1)
                .setMaxValue(43200) // 30 days max
        ),
    category: 'utility',
    async execute(interaction) {
        const message = interaction.options.getString('message', true);
        const timeInMinutes = interaction.options.getInteger('time', true);

        const remindAt = new Date(Date.now() + timeInMinutes * 60 * 1000);

        try {
            // Save reminder to database
            await apiClient.post(`/users/${interaction.user.id}/reminders`, {
                message,
                remindAt: remindAt.toISOString(),
                channelId: interaction.channelId,
                guildId: interaction.guildId
            });

            const embed = new EmbedBuilder()
                .setColor('#3498DB')
                .setTitle('⏰ Reminder Set!')
                .setDescription(`I'll remind you about: **${message}**`)
                .addFields({
                    name: 'When',
                    value: `<t:${Math.floor(remindAt.getTime() / 1000)}:R> (<t:${Math.floor(remindAt.getTime() / 1000)}:F>)`
                })
                .setFooter({ text: 'You will be mentioned when the reminder triggers' })
                .setTimestamp();

            await interaction.reply({ embeds: [embed] });
        } catch (error) {
            await interaction.reply({
                content: '❌ Failed to set reminder!',
                flags: MessageFlags.Ephemeral
            });
        }
    },
};
