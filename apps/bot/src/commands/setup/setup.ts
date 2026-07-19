/**
 * Setup Command
 * 
 * Interactive setup wizard for configuring the bot
 */

import { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits, MessageFlags, ActionRowBuilder, StringSelectMenuBuilder } from 'discord.js';
import type { Command } from '../../types/command';

export const setup: Command = {
    data: new SlashCommandBuilder()
        .setName('setup')
        .setDescription('Run the interactive setup wizard')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .setDMPermission(false),
    category: 'setup',

    async execute(interaction) {
        if (!interaction.guild) return;

        const embed = new EmbedBuilder()
            .setColor('#5865F2')
            .setTitle('🛠️ Server Setup Wizard')
            .setDescription('Welcome to the setup wizard! Select a module to configure:')
            .addFields(
                { name: '🛡️ Moderation', value: 'Configure moderation settings, logging, and auto-mod', inline: true },
                { name: '👋 Welcome', value: 'Setup welcome and goodbye messages', inline: true },
                { name: '⭐ Leveling', value: 'Configure the XP and leveling system', inline: true },
                { name: '💰 Economy', value: 'Setup the economy system', inline: true },
                { name: '🎫 Tickets', value: 'Configure support ticket system', inline: true },
                { name: '✅ Verification', value: 'Setup member verification', inline: true }
            )
            .setFooter({ text: 'Select a module from the dropdown below' })
            .setTimestamp();

        const selectMenu = new StringSelectMenuBuilder()
            .setCustomId('setup_module')
            .setPlaceholder('Choose a module to configure')
            .addOptions([
                {
                    label: 'Moderation',
                    description: 'Configure moderation settings',
                    value: 'moderation',
                    emoji: '🛡️'
                },
                {
                    label: 'Welcome System',
                    description: 'Setup welcome and goodbye messages',
                    value: 'welcome',
                    emoji: '👋'
                },
                {
                    label: 'Leveling',
                    description: 'Configure XP and leveling',
                    value: 'leveling',
                    emoji: '⭐'
                },
                {
                    label: 'Economy',
                    description: 'Setup economy system',
                    value: 'economy',
                    emoji: '💰'
                },
                {
                    label: 'Tickets',
                    description: 'Configure support tickets',
                    value: 'tickets',
                    emoji: '🎫'
                },
                {
                    label: 'Verification',
                    description: 'Setup member verification',
                    value: 'verification',
                    emoji: '✅'
                }
            ]);

        const row = new ActionRowBuilder<StringSelectMenuBuilder>()
            .addComponents(selectMenu);

        await interaction.reply({
            embeds: [embed],
            components: [row],
            flags: MessageFlags.Ephemeral
        });
    }
};
