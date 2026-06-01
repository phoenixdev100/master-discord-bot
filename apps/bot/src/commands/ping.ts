/**
 * Ping Command
 * 
 * Simple ping command to test bot responsiveness.
 */

import { SlashCommandBuilder } from 'discord.js';
import type { Command } from '../types/command';

export const pingCommand: Command = {
    data: new SlashCommandBuilder()
        .setName('ping')
        .setDescription('Check bot latency and API response time'),

    category: 'utility',

    async execute(interaction) {
        const sent = await interaction.reply({
            content: '🏓 Pinging...',
            fetchReply: true,
        });

        const latency = sent.createdTimestamp - interaction.createdTimestamp;
        const apiLatency = Math.round(interaction.client.ws.ping);

        await interaction.editReply({
            content: null,
            embeds: [
                {
                    title: '🏓 Pong!',
                    fields: [
                        {
                            name: 'Bot Latency',
                            value: `${latency}ms`,
                            inline: true,
                        },
                        {
                            name: 'API Latency',
                            value: `${apiLatency}ms`,
                            inline: true,
                        },
                    ],
                    color: 0x5865f2,
                    timestamp: new Date().toISOString(),
                },
            ],
        });
    },
};
