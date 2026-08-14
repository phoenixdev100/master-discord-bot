import { SlashCommandBuilder, EmbedBuilder, MessageFlags } from 'discord.js';
import type { Command } from '../../types/command';
import { apiClient } from '../../utils/api-client';

export const rank: Command = {
    data: new SlashCommandBuilder()
        .setName('rank')
        .setDescription('Check your or another user\'s rank and XP')
        .addUserOption(option =>
            option
                .setName('user')
                .setDescription('The user to check rank for')
                .setRequired(false)
        ),
    category: 'leveling',
    async execute(interaction) {
        if (!interaction.guild) return;

        const targetUser = interaction.options.getUser('user') || interaction.user;

        try {
            const response = await apiClient.get(
                `/guilds/${interaction.guild.id}/leveling/${targetUser.id}`
            );

            const responseData = response as { data?: { level: number; xp: number; messages: number; rank: number } };
            const { level = 0, xp = 0, messages = 0, rank = 0 } = responseData.data || {};
            const xpNeeded = Math.floor(100 * Math.pow(level + 1, 1.5));
            const progress = Math.floor((xp / xpNeeded) * 100);

            const embed = new EmbedBuilder()
                .setColor('#FFD700')
                .setTitle(`📊 ${targetUser.tag}'s Rank`)
                .setThumbnail(targetUser.displayAvatarURL({ size: 256 }))
                .addFields(
                    { name: '🏆 Rank', value: `#${rank}`, inline: true },
                    { name: '⭐ Level', value: `${level}`, inline: true },
                    { name: '💬 Messages', value: `${messages}`, inline: true },
                    { name: '✨ XP', value: `${xp} / ${xpNeeded}`, inline: true },
                    { name: '📈 Progress', value: `${progress}%`, inline: true },
                    { name: '🎯 Next Level', value: `${xpNeeded - xp} XP`, inline: true }
                )
                .setFooter({ text: `Keep chatting to level up!` })
                .setTimestamp();

            await interaction.reply({ embeds: [embed] });
        } catch (error) {
            await interaction.reply({
                content: 'Failed to fetch rank data. Make sure leveling is enabled!',
                flags: MessageFlags.Ephemeral
            });
        }
    },
};
