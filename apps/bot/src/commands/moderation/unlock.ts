import { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits, ChannelType, MessageFlags } from 'discord.js';
import type { Command } from '../../types/command';

export const unlock: Command = {
    data: new SlashCommandBuilder()
        .setName('unlock')
        .setDescription('Unlock a channel to allow members to send messages')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels)
        .addChannelOption(option =>
            option
                .setName('channel')
                .setDescription('Channel to unlock (current channel if not specified)')
                .addChannelTypes(ChannelType.GuildText)
        ),
    category: 'moderation',
    async execute(interaction) {
        if (!interaction.guild) return;

        const channel = (interaction.options.getChannel('channel') || interaction.channel) as any;

        if (!channel || !('permissionOverwrites' in channel)) {
            await interaction.reply({ content: 'Invalid channel!', flags: MessageFlags.Ephemeral });
            return;
        }

        try {
            await channel.permissionOverwrites.edit(interaction.guild.roles.everyone, {
                SendMessages: null
            });

            const embed = new EmbedBuilder()
                .setColor('#2ECC71')
                .setTitle('🔓 Channel Unlocked')
                .setDescription(`${channel} has been unlocked.`)
                .addFields({ name: 'Unlocked By', value: interaction.user.tag })
                .setTimestamp();

            await interaction.reply({ embeds: [embed] });
        } catch (error) {
            await interaction.reply({
                content: 'Failed to unlock channel. Make sure I have the Manage Channels permission!',
                flags: MessageFlags.Ephemeral
            });
        }
    },
};
