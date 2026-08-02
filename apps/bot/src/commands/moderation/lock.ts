import { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits, ChannelType, MessageFlags } from 'discord.js';
import type { Command } from '../../types/command';

export const lock: Command = {
    data: new SlashCommandBuilder()
        .setName('lock')
        .setDescription('Lock a channel to prevent members from sending messages')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels)
        .addChannelOption(option =>
            option
                .setName('channel')
                .setDescription('Channel to lock (current channel if not specified)')
                .addChannelTypes(ChannelType.GuildText)
        )
        .addStringOption(option =>
            option
                .setName('reason')
                .setDescription('Reason for locking the channel')
        ),
    category: 'moderation',
    async execute(interaction) {
        if (!interaction.guild) return;

        const channel = (interaction.options.getChannel('channel') || interaction.channel) as any;
        const reason = interaction.options.getString('reason') || 'No reason provided';

        if (!channel || !('permissionOverwrites' in channel)) {
            await interaction.reply({ content: 'Invalid channel!', flags: MessageFlags.Ephemeral });
            return;
        }

        try {
            await channel.permissionOverwrites.edit(interaction.guild.roles.everyone, {
                SendMessages: false
            });

            const embed = new EmbedBuilder()
                .setColor('#E74C3C')
                .setTitle('🔒 Channel Locked')
                .setDescription(`${channel} has been locked.`)
                .addFields(
                    { name: 'Reason', value: reason },
                    { name: 'Locked By', value: interaction.user.tag }
                )
                .setTimestamp();

            await interaction.reply({ embeds: [embed] });
        } catch (error) {
            await interaction.reply({
                content: 'Failed to lock channel. Make sure I have the Manage Channels permission!',
                flags: MessageFlags.Ephemeral
            });
        }
    },
};
