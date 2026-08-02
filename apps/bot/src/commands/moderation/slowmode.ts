import { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits, MessageFlags } from 'discord.js';
import type { Command } from '../../types/command';

export const slowmode: Command = {
    data: new SlashCommandBuilder()
        .setName('slowmode')
        .setDescription('Set slowmode for the current channel')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels)
        .addIntegerOption(option =>
            option
                .setName('seconds')
                .setDescription('Slowmode duration in seconds (0 to disable)')
                .setRequired(true)
                .setMinValue(0)
                .setMaxValue(21600) // 6 hours max
        ),
    category: 'moderation',
    async execute(interaction) {
        if (!interaction.channel || !('setRateLimitPerUser' in interaction.channel)) {
            await interaction.reply({ content: 'This command can only be used in text channels!', flags: MessageFlags.Ephemeral });
            return;
        }

        const seconds = interaction.options.getInteger('seconds', true);

        try {
            await interaction.channel.setRateLimitPerUser(seconds);

            const embed = new EmbedBuilder()
                .setColor(seconds > 0 ? '#E74C3C' : '#2ECC71')
                .setTitle(seconds > 0 ? '🐌 Slowmode Enabled' : '✅ Slowmode Disabled')
                .setDescription(
                    seconds > 0
                        ? `Slowmode has been set to **${seconds} second(s)**.`
                        : 'Slowmode has been disabled.'
                )
                .setFooter({ text: `Set by ${interaction.user.tag}` })
                .setTimestamp();

            await interaction.reply({ embeds: [embed] });
        } catch (error) {
            await interaction.reply({
                content: 'Failed to set slowmode. Make sure I have the Manage Channels permission!',
                flags: MessageFlags.Ephemeral
            });
        }
    },
};
