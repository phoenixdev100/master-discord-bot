/**
 * EditChannel Command
 *
 * Rename a channel, set its topic or slowmode.
 */

import { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits, MessageFlags, ChannelType } from 'discord.js';
import type { Command } from '../../types/command';

export const editchannel: Command = {
    data: new SlashCommandBuilder()
        .setName('editchannel')
        .setDescription('Edit a channel (name, topic, slowmode)')
        .setDMPermission(false)
        .addChannelOption(o =>
            o.setName('channel').setDescription('Channel to edit (default: this one)').setRequired(false)
                .addChannelTypes(ChannelType.GuildText, ChannelType.GuildAnnouncement)
        )
        .addStringOption(o => o.setName('name').setDescription('New channel name').setRequired(false).setMaxLength(100))
        .addStringOption(o => o.setName('topic').setDescription('New channel topic').setRequired(false).setMaxLength(1024))
        .addIntegerOption(o => o.setName('slowmode').setDescription('Slowmode in seconds (0 = off)').setRequired(false).setMinValue(0).setMaxValue(21600)),
    requiredPermission: PermissionFlagsBits.ManageChannels,
    category: 'admin',

    async execute(interaction) {
        if (!interaction.guild) return;

        const raw = interaction.options.getChannel('channel') ?? interaction.channel;
        const channel = raw ? interaction.guild.channels.cache.get(raw.id) : undefined;
        if (!channel || !channel.isTextBased() || !('edit' in channel)) {
            await interaction.reply({ content: '❌ That channel cannot be edited.', flags: MessageFlags.Ephemeral });
            return;
        }
        const name = interaction.options.getString('name');
        const topic = interaction.options.getString('topic');
        const slowmode = interaction.options.getInteger('slowmode');

        if (!name && topic === null && slowmode === null) {
            await interaction.reply({ content: '❌ Provide at least one thing to change: `name`, `topic` or `slowmode`.', flags: MessageFlags.Ephemeral });
            return;
        }

        await interaction.deferReply({ flags: MessageFlags.Ephemeral });

        try {
            const changes: string[] = [];
            const edit: Record<string, unknown> = {};
            if (name) { edit.name = name.toLowerCase().replace(/\s+/g, '-'); changes.push(`name → \`${edit.name}\``); }
            if (topic !== null) { edit.topic = topic; changes.push('topic updated'); }
            if (slowmode !== null) { edit.rateLimitPerUser = slowmode; changes.push(`slowmode → ${slowmode}s`); }

            await channel.edit({ ...edit, reason: `Edited by ${interaction.user.tag}` });

            const embed = new EmbedBuilder()
                .setColor(0x57f287)
                .setTitle('✅ Channel Updated')
                .setDescription(`<#${channel.id}>: ${changes.join(', ')}`)
                .setTimestamp();

            await interaction.editReply({ embeds: [embed] });
        } catch (error: any) {
            console.error('editchannel error:', error);
            await interaction.editReply({ content: `❌ Failed to edit channel: ${error.message ?? 'Unknown error'}` });
        }
    },
};
