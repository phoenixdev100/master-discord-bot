/**
 * Ai Command
 * 
 * AI assistant commands
 */

import { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits, MessageFlags } from 'discord.js';
import type { Command } from '../../types/command';

export const ai: Command = {
    data: new SlashCommandBuilder()
        .setName('ai')
        .setDescription('AI assistant commands')
        .setDefaultMemberPermissions(PermissionFlagsBits.SendMessages)
        .setDMPermission(false)
        .addSubcommand(subcommand =>
            subcommand
                .setName('chat')
                .setDescription('Chat ai')
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('summarize')
                .setDescription('Summarize ai')
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('translate')
                .setDescription('Translate ai')
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('explain')
                .setDescription('Explain ai')
        ),
    category: 'ai',

    async execute(interaction) {
        if (!interaction.guild) return;

        try {
            const embed = new EmbedBuilder()
                .setColor('#5865F2')
                .setTitle('🚧 Command In Development')
                .setDescription(`This command is currently being developed!\n\n**Command:** \`/ai\`\n**Category:** ai\n\nCheck back soon for updates!`)
                .setFooter({ text: 'Coming soon!' })
                .setTimestamp();

            await interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral });
        } catch (error: any) {
            console.error('ai command error:', error);
            await interaction.reply({
                content: '❌ An error occurred while executing this command',
                flags: MessageFlags.Ephemeral
            });
        }
    }
};
