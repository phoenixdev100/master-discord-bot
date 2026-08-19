/**
 * Memegen Command
 * 
 * Generate a meme
 */

import { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits, MessageFlags } from 'discord.js';
import type { Command } from '../../types/command';

export const memegen: Command = {
    data: new SlashCommandBuilder()
        .setName('memegen')
        .setDescription('Generate a meme')
        .setDefaultMemberPermissions(PermissionFlagsBits.SendMessages)
        .setDMPermission(false)
        .addStringOption(option =>
            option
                .setName('template')
                .setDescription('Meme template')
                .setRequired(true)
        )
        .addStringOption(option =>
            option
                .setName('top_text')
                .setDescription('Top text')
                .setRequired(true)
        )
        .addStringOption(option =>
            option
                .setName('bottom_text')
                .setDescription('Bottom text')
                .setRequired(false)
        ),
    category: 'image',

    async execute(interaction) {
        if (!interaction.guild) return;

        try {
            const embed = new EmbedBuilder()
                .setColor('#5865F2')
                .setTitle('🚧 Command In Development')
                .setDescription(`This command is currently being developed!\n\n**Command:** \`/memegen\`\n**Category:** image\n\nCheck back soon for updates!`)
                .setFooter({ text: 'Coming soon!' })
                .setTimestamp();

            await interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral });
        } catch (error: any) {
            console.error('memegen command error:', error);
            await interaction.reply({
                content: '❌ An error occurred while executing this command',
                flags: MessageFlags.Ephemeral
            });
        }
    }
};
