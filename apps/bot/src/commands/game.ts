/**
 * Game Command Group
 * 
 * Unified games with all game-related subcommands
 */

import { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits, MessageFlags } from 'discord.js';
import type { Command } from '../types/command';

export const game: Command = {
    data: new SlashCommandBuilder()
        .setName('game')
        .setDescription('Interactive games')
        .setDefaultMemberPermissions(PermissionFlagsBits.SendMessages)
        .setDMPermission(false)
        // Trivia subcommand
        .addSubcommand(subcommand =>
            subcommand
                .setName('trivia')
                .setDescription('Play trivia game')
                .addStringOption(option =>
                    option
                        .setName('category')
                        .setDescription('Trivia category')
                        .setRequired(false)
                        .addChoices(
                            { name: 'General', value: 'general' },
                            { name: 'Science', value: 'science' },
                            { name: 'History', value: 'history' },
                            { name: 'Geography', value: 'geography' },
                            { name: 'Sports', value: 'sports' }
                        )
                )
        )
        // Chess subcommand
        .addSubcommand(subcommand =>
            subcommand
                .setName('chess')
                .setDescription('Play chess with another user')
                .addUserOption(option =>
                    option
                        .setName('opponent')
                        .setDescription('User to play against')
                        .setRequired(true)
                )
        )
        // Tic Tac Toe subcommand
        .addSubcommand(subcommand =>
            subcommand
                .setName('tictactoe')
                .setDescription('Play tic tac toe')
                .addUserOption(option =>
                    option
                        .setName('opponent')
                        .setDescription('User to play against')
                        .setRequired(true)
                )
        )
        // Akinator subcommand
        .addSubcommand(subcommand =>
            subcommand
                .setName('akinator')
                .setDescription('Play Akinator')
        )
        // Wordle subcommand
        .addSubcommand(subcommand =>
            subcommand
                .setName('wordle')
                .setDescription('Play Wordle')
        )
        // Hangman subcommand
        .addSubcommand(subcommand =>
            subcommand
                .setName('hangman')
                .setDescription('Play Hangman')
        )
        // Blackjack subcommand
        .addSubcommand(subcommand =>
            subcommand
                .setName('blackjack')
                .setDescription('Play Blackjack')
                .addIntegerOption(option =>
                    option
                        .setName('bet')
                        .setDescription('Amount to bet')
                        .setRequired(false)
                        .setMinValue(10)
                )
        )
        // Poker subcommand
        .addSubcommand(subcommand =>
            subcommand
                .setName('poker')
                .setDescription('Play Poker')
                .addIntegerOption(option =>
                    option
                        .setName('bet')
                        .setDescription('Amount to bet')
                        .setRequired(false)
                        .setMinValue(10)
                )
        )
        // Slots subcommand
        .addSubcommand(subcommand =>
            subcommand
                .setName('slots')
                .setDescription('Play slot machine')
                .addIntegerOption(option =>
                    option
                        .setName('bet')
                        .setDescription('Amount to bet')
                        .setRequired(false)
                        .setMinValue(10)
                )
        )
        // Dice subcommand
        .addSubcommand(subcommand =>
            subcommand
                .setName('dice')
                .setDescription('Roll dice')
                .addIntegerOption(option =>
                    option
                        .setName('sides')
                        .setDescription('Number of sides')
                        .setRequired(false)
                        .setMinValue(2)
                        .setMaxValue(100)
                )
        )
        // Connect4 subcommand
        .addSubcommand(subcommand =>
            subcommand
                .setName('connect4')
                .setDescription('Play Connect 4')
                .addUserOption(option =>
                    option
                        .setName('opponent')
                        .setDescription('User to play against')
                        .setRequired(true)
                )
        )
        // UNO subcommand
        .addSubcommand(subcommand =>
            subcommand
                .setName('uno')
                .setDescription('Play UNO')
        )
        // Math Game subcommand
        .addSubcommand(subcommand =>
            subcommand
                .setName('math')
                .setDescription('Play math game')
                .addStringOption(option =>
                    option
                        .setName('difficulty')
                        .setDescription('Difficulty level')
                        .setRequired(false)
                        .addChoices(
                            { name: 'Easy', value: 'easy' },
                            { name: 'Medium', value: 'medium' },
                            { name: 'Hard', value: 'hard' }
                        )
                )
        )
        // Memory Game subcommand
        .addSubcommand(subcommand =>
            subcommand
                .setName('memory')
                .setDescription('Play memory game')
        )
        // Reaction Game subcommand
        .addSubcommand(subcommand =>
            subcommand
                .setName('reaction')
                .setDescription('Test your reaction time')
        )
        // Typing Test subcommand
        .addSubcommand(subcommand =>
            subcommand
                .setName('typing')
                .setDescription('Test your typing speed')
        )
        // Game Stats subcommand
        .addSubcommand(subcommand =>
            subcommand
                .setName('stats')
                .setDescription('View your game statistics')
                .addUserOption(option =>
                    option
                        .setName('user')
                        .setDescription('User to view stats for')
                        .setRequired(false)
                )
        )
        // Game Leaderboard subcommand
        .addSubcommand(subcommand =>
            subcommand
                .setName('leaderboard')
                .setDescription('View game leaderboard')
                .addStringOption(option =>
                    option
                        .setName('game')
                        .setDescription('Game to view leaderboard for')
                        .setRequired(false)
                        .addChoices(
                            { name: 'All Games', value: 'all' },
                            { name: 'Trivia', value: 'trivia' },
                            { name: 'Blackjack', value: 'blackjack' },
                            { name: 'Wordle', value: 'wordle' }
                        )
                )
        ),
    category: 'games',

    async execute(interaction) {
        if (!interaction.guild) return;

        try {
            const subcommand = interaction.options.getSubcommand();

            // Development placeholder for all subcommands
            const embed = new EmbedBuilder()
                .setColor('#5865F2')
                .setTitle('🎮 Game Command In Development')
                .setDescription(
                    `This game is currently being developed!\n\n` +
                    `**Command:** \`/game ${subcommand}\`\n` +
                    `**Category:** Games\n\n` +
                    `Check back soon for updates!`
                )
                .setFooter({ text: 'Coming soon!' })
                .setTimestamp();

            await interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral });
        } catch (error: any) {
            console.error('game command error:', error);
            await interaction.reply({
                content: '❌ An error occurred while executing this command',
                flags: MessageFlags.Ephemeral
            });
        }
    }
};
