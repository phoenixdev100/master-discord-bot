import { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits, MessageFlags } from 'discord.js';
import type { Command } from '../../types/command';

export const clone: Command = {
    data: new SlashCommandBuilder()
        .setName('clone')
        .setDescription('Clone the current channel')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels)
        .addStringOption(option =>
            option
                .setName('name')
                .setDescription('Name for the cloned channel (optional)')
        ),
    category: 'moderation',
    async execute(interaction) {
        if (!interaction.channel || !('clone' in interaction.channel)) {
            await interaction.reply({
                content: '❌ This command can only be used in cloneable channels!',
                flags: MessageFlags.Ephemeral
            });
            return;
        }

        await interaction.deferReply({ flags: MessageFlags.Ephemeral });

        try {
            const channel = interaction.channel as any;
            const name = interaction.options.getString('name') || `${channel.name}-clone`;

            const clonedChannel = await channel.clone({
                name,
                reason: `Channel cloned by ${interaction.user.tag}`
            });

            const embed = new EmbedBuilder()
                .setColor('#2ECC71')
                .setTitle('✅ Channel Cloned!')
                .setDescription(`Successfully cloned ${channel} to ${clonedChannel}`)
                .addFields(
                    { name: 'Original', value: channel.toString(), inline: true },
                    { name: 'Clone', value: clonedChannel.toString(), inline: true }
                )
                .setFooter({ text: `Cloned by ${interaction.user.tag}` })
                .setTimestamp();

            await interaction.editReply({ embeds: [embed] });
        } catch (error) {
            await interaction.editReply({
                content: '❌ Failed to clone channel. Make sure I have the Manage Channels permission!'
            });
        }
    },
};
