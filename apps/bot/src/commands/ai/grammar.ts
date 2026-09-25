/**
 * Grammar Command
 *
 * Fix grammar and spelling in a piece of text.
 */

import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import type { Command } from '../../types/command';
import { aiAsk } from '../../utils/ai';

export const grammar: Command = {
    data: new SlashCommandBuilder()
        .setName('grammar')
        .setDescription('Check and fix grammar')
        .setDMPermission(false)
        .addStringOption(option =>
            option.setName('text').setDescription('Text to check').setRequired(true).setMaxLength(2000)
        ),
    category: 'ai',

    async execute(interaction) {
        if (!interaction.guild) return;

        const text = interaction.options.getString('text', true);
        await interaction.deferReply();

        try {
            const answer = await aiAsk(
                `Fix all grammar and spelling mistakes in the text. Reply in this format:
CORRECTED: <fixed text>
NOTES: <short list of what was fixed, or "No mistakes found">`,
                text
            );

            const corrected = answer.match(/CORRECTED:\s*([\s\S]+?)(?=NOTES:|$)/i)?.[1]?.trim() ?? answer;
            const notes = answer.match(/NOTES:\s*([\s\S]+)/i)?.[1]?.trim();

            const embed = new EmbedBuilder()
                .setColor(0x9b59b6)
                .setTitle('✍️ Grammar Check')
                .addFields(
                    { name: 'Original', value: `> ${text.slice(0, 900)}` },
                    { name: 'Corrected', value: `> ${corrected.slice(0, 900)}` },
                )
                .setFooter({ text: `Requested by ${interaction.user.tag}` })
                .setTimestamp();

            if (notes) embed.addFields({ name: 'Notes', value: notes.slice(0, 800) });
            await interaction.editReply({ embeds: [embed] });
        } catch (error: any) {
            console.error('grammar error:', error);
            await interaction.editReply({ content: `❌ Grammar check failed: ${error.message ?? 'Unknown error'}` });
        }
    },
};
