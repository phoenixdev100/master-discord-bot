import { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits, MessageFlags } from 'discord.js';
import type { Command } from '../../types/command';
import { apiClient } from '../../utils/api-client';

export const clearwarnings: Command = {
    data: new SlashCommandBuilder()
        .setName('clearwarnings')
        .setDescription('Clear all warnings for a user')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addUserOption(option =>
            option
                .setName('user')
                .setDescription('The user to clear warnings for')
                .setRequired(true)
        ),
    category: 'moderation',
    async execute(interaction) {
        if (!interaction.guild) return;

        const targetUser = interaction.options.getUser('user', true);

        try {
            await apiClient.delete(
                `/guilds/${interaction.guild.id}/moderation/warnings/${targetUser.id}`
            );

            const embed = new EmbedBuilder()
                .setColor('#2ECC71')
                .setTitle('✅ Warnings Cleared')
                .setDescription(`All warnings for ${targetUser.tag} have been cleared.`)
                .addFields(
                    { name: 'User', value: targetUser.tag, inline: true },
                    { name: 'Cleared By', value: interaction.user.tag, inline: true }
                )
                .setTimestamp();

            await interaction.reply({ embeds: [embed] });
        } catch (error) {
            await interaction.reply({
                content: '❌ Failed to clear warnings!',
                flags: MessageFlags.Ephemeral
            });
        }
    },
};
