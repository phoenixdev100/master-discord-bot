/**
 * CreateChannel Command
 *
 * Create a text, voice, announcement channel or category.
 */

import { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits, MessageFlags, ChannelType } from 'discord.js';
import type { Command } from '../../types/command';

export const createchannel: Command = {
    data: new SlashCommandBuilder()
        .setName('createchannel')
        .setDescription('Create a new channel')
        .setDMPermission(false)
        .addStringOption(o => o.setName('name').setDescription('Channel name').setRequired(true).setMaxLength(100))
        .addStringOption(o =>
            o.setName('type').setDescription('Channel type').setRequired(false)
                .addChoices(
                    { name: 'Text', value: 'text' },
                    { name: 'Voice', value: 'voice' },
                    { name: 'Announcement', value: 'announcement' },
                    { name: 'Category', value: 'category' },
                )
        )
        .addChannelOption(o =>
            o.setName('category').setDescription('Parent category').addChannelTypes(ChannelType.GuildCategory).setRequired(false)
        )
        .addStringOption(o => o.setName('topic').setDescription('Channel topic (text channels only)').setRequired(false)),
    requiredPermission: PermissionFlagsBits.ManageChannels,
    category: 'admin',

    async execute(interaction) {
        if (!interaction.guild) return;

        const name = interaction.options.getString('name', true);
        const type = interaction.options.getString('type') ?? 'text';
        const parent = interaction.options.getChannel('category');
        const topic = interaction.options.getString('topic');

        const typeMap = {
            text: ChannelType.GuildText,
            voice: ChannelType.GuildVoice,
            announcement: ChannelType.GuildAnnouncement,
            category: ChannelType.GuildCategory,
        } as const;

        await interaction.deferReply({ flags: MessageFlags.Ephemeral });

        try {
            const channel = await interaction.guild.channels.create({
                name: type === 'voice' || type === 'category' ? name : name.toLowerCase().replace(/\s+/g, '-'),
                type: typeMap[type as keyof typeof typeMap] ?? ChannelType.GuildText,
                parent: parent?.id,
                topic: topic ?? undefined,
                reason: `Created by ${interaction.user.tag}`,
            });

            const embed = new EmbedBuilder()
                .setColor(0x57f287)
                .setTitle('✅ Channel Created')
                .setDescription(`<#${channel.id}>`)
                .setTimestamp();

            await interaction.editReply({ embeds: [embed] });
        } catch (error: any) {
            console.error('createchannel error:', error);
            await interaction.editReply({ content: `❌ Failed to create channel: ${error.message ?? 'Unknown error'}` });
        }
    },
};
