import { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits, MessageFlags } from 'discord.js';
import type { Command } from '../../types/command';

export const untimeout: Command = {
    data: new SlashCommandBuilder()
        .setName('untimeout')
        .setDescription('Remove timeout from a user')
        .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
        .addUserOption(option =>
            option
                .setName('user')
                .setDescription('The user to remove timeout from')
                .setRequired(true)
        )
        .addStringOption(option =>
            option
                .setName('reason')
                .setDescription('Reason for removing timeout')
        ),
    category: 'moderation',
    async execute(interaction) {
        if (!interaction.guild) return;

        const targetUser = interaction.options.getUser('user', true);
        const reason = interaction.options.getString('reason') || 'No reason provided';

        const member = interaction.guild.members.cache.get(targetUser.id);

        if (!member) {
            await interaction.reply({
                content: '❌ User not found in this server!',
                flags: MessageFlags.Ephemeral
            });
            return;
        }

        if (!member.communicationDisabledUntil) {
            await interaction.reply({
                content: '❌ This user is not timed out!',
                flags: MessageFlags.Ephemeral
            });
            return;
        }

        try {
            await member.timeout(null, reason);

            const embed = new EmbedBuilder()
                .setColor('#2ECC71')
                .setTitle('✅ Timeout Removed')
                .setDescription(`${targetUser.tag}'s timeout has been removed.`)
                .addFields(
                    { name: 'User', value: `${targetUser} (${targetUser.id})`, inline: true },
                    { name: 'Moderator', value: interaction.user.tag, inline: true },
                    { name: 'Reason', value: reason }
                )
                .setTimestamp();

            await interaction.reply({ embeds: [embed] });
        } catch (error) {
            await interaction.reply({
                content: '❌ Failed to remove timeout. Make sure I have the Moderate Members permission!',
                flags: MessageFlags.Ephemeral
            });
        }
    },
};
