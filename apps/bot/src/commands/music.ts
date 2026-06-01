/**
 * Music Command Group
 * 
 * Unified music player with all music-related subcommands
 */

import { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits, MessageFlags } from 'discord.js';
import type { Command } from '../types/command';

export const music: Command = {
    data: new SlashCommandBuilder()
        .setName('music')
        .setDescription('Music player commands')
        .setDefaultMemberPermissions(PermissionFlagsBits.SendMessages)
        .setDMPermission(false)
        // Play subcommand
        .addSubcommand(subcommand =>
            subcommand
                .setName('play')
                .setDescription('Play a song')
                .addStringOption(option =>
                    option
                        .setName('query')
                        .setDescription('Song name or URL')
                        .setRequired(true)
                )
        )
        // Pause subcommand
        .addSubcommand(subcommand =>
            subcommand
                .setName('pause')
                .setDescription('Pause the current song')
        )
        // Resume subcommand
        .addSubcommand(subcommand =>
            subcommand
                .setName('resume')
                .setDescription('Resume the paused song')
        )
        // Skip subcommand
        .addSubcommand(subcommand =>
            subcommand
                .setName('skip')
                .setDescription('Skip the current song')
        )
        // Stop subcommand
        .addSubcommand(subcommand =>
            subcommand
                .setName('stop')
                .setDescription('Stop playing and clear the queue')
        )
        // Queue subcommand
        .addSubcommand(subcommand =>
            subcommand
                .setName('queue')
                .setDescription('View the current queue')
        )
        // Queue clear subcommand
        .addSubcommand(subcommand =>
            subcommand
                .setName('queueclear')
                .setDescription('Clear the queue')
        )
        // Queue remove subcommand
        .addSubcommand(subcommand =>
            subcommand
                .setName('queueremove')
                .setDescription('Remove a song from the queue')
                .addIntegerOption(option =>
                    option
                        .setName('position')
                        .setDescription('Position in queue')
                        .setRequired(true)
                        .setMinValue(1)
                )
        )
        // Queue shuffle subcommand
        .addSubcommand(subcommand =>
            subcommand
                .setName('queueshuffle')
                .setDescription('Shuffle the queue')
        )
        // Now playing subcommand
        .addSubcommand(subcommand =>
            subcommand
                .setName('nowplaying')
                .setDescription('Show the currently playing song')
        )
        // Volume subcommand
        .addSubcommand(subcommand =>
            subcommand
                .setName('volume')
                .setDescription('Set the volume')
                .addIntegerOption(option =>
                    option
                        .setName('level')
                        .setDescription('Volume level (0-100)')
                        .setRequired(true)
                        .setMinValue(0)
                        .setMaxValue(100)
                )
        )
        // Loop subcommand
        .addSubcommand(subcommand =>
            subcommand
                .setName('loop')
                .setDescription('Toggle loop mode')
                .addStringOption(option =>
                    option
                        .setName('mode')
                        .setDescription('Loop mode')
                        .setRequired(true)
                        .addChoices(
                            { name: 'Off', value: 'off' },
                            { name: 'Song', value: 'song' },
                            { name: 'Queue', value: 'queue' }
                        )
                )
        )
        // Seek subcommand
        .addSubcommand(subcommand =>
            subcommand
                .setName('seek')
                .setDescription('Seek to a position in the song')
                .addIntegerOption(option =>
                    option
                        .setName('seconds')
                        .setDescription('Position in seconds')
                        .setRequired(true)
                        .setMinValue(0)
                )
        )
        // Previous subcommand
        .addSubcommand(subcommand =>
            subcommand
                .setName('previous')
                .setDescription('Play the previous song')
        )
        // Lyrics subcommand
        .addSubcommand(subcommand =>
            subcommand
                .setName('lyrics')
                .setDescription('Get lyrics for the current song')
        )
        // Playlist subcommand
        .addSubcommand(subcommand =>
            subcommand
                .setName('playlist')
                .setDescription('Manage playlists')
                .addStringOption(option =>
                    option
                        .setName('action')
                        .setDescription('Playlist action')
                        .setRequired(true)
                        .addChoices(
                            { name: 'Create', value: 'create' },
                            { name: 'Load', value: 'load' },
                            { name: 'Save', value: 'save' },
                            { name: 'Delete', value: 'delete' }
                        )
                )
                .addStringOption(option =>
                    option
                        .setName('name')
                        .setDescription('Playlist name')
                        .setRequired(false)
                )
        )
        // Filters subcommand
        .addSubcommand(subcommand =>
            subcommand
                .setName('filters')
                .setDescription('Apply audio filters')
                .addStringOption(option =>
                    option
                        .setName('filter')
                        .setDescription('Audio filter')
                        .setRequired(true)
                        .addChoices(
                            { name: 'None', value: 'none' },
                            { name: 'Bass Boost', value: 'bassboost' },
                            { name: 'Nightcore', value: 'nightcore' },
                            { name: 'Vaporwave', value: 'vaporwave' },
                            { name: '8D', value: '8d' }
                        )
                )
        ),
    category: 'music',

    async execute(interaction) {
        if (!interaction.guild) return;

        try {
            const subcommand = interaction.options.getSubcommand();

            // Development placeholder for all subcommands
            const embed = new EmbedBuilder()
                .setColor('#5865F2')
                .setTitle('🚧 Music Command In Development')
                .setDescription(
                    `This music feature is currently being developed!\n\n` +
                    `**Command:** \`/music ${subcommand}\`\n` +
                    `**Category:** Music Player\n\n` +
                    `Check back soon for updates!`
                )
                .setFooter({ text: 'Coming soon!' })
                .setTimestamp();

            await interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral });
        } catch (error: any) {
            console.error('music command error:', error);
            await interaction.reply({
                content: '❌ An error occurred while executing this command',
                flags: MessageFlags.Ephemeral
            });
        }
    }
};
