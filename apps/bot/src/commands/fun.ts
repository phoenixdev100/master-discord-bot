/**
 * Fun Command Group
 * 
 * Fun and entertainment commands
 */

import { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits, MessageFlags } from 'discord.js';
import type { Command } from '../types/command';

export const fun: Command = {
    data: new SlashCommandBuilder()
        .setName('fun')
        .setDescription('Fun and entertainment commands')
        .setDefaultMemberPermissions(PermissionFlagsBits.SendMessages)
        .setDMPermission(false)
        // 8ball subcommand
        .addSubcommand(subcommand =>
            subcommand
                .setName('8ball')
                .setDescription('Ask the magic 8ball a question')
                .addStringOption(option =>
                    option
                        .setName('question')
                        .setDescription('Your question')
                        .setRequired(true)
                )
        )
        // Meme subcommand
        .addSubcommand(subcommand =>
            subcommand
                .setName('meme')
                .setDescription('Get a random meme')
                .addStringOption(option =>
                    option
                        .setName('subreddit')
                        .setDescription('Subreddit to get meme from')
                        .setRequired(false)
                )
        )
        // Joke subcommand
        .addSubcommand(subcommand =>
            subcommand
                .setName('joke')
                .setDescription('Get a random joke')
                .addStringOption(option =>
                    option
                        .setName('type')
                        .setDescription('Joke type')
                        .setRequired(false)
                        .addChoices(
                            { name: 'Any', value: 'any' },
                            { name: 'Programming', value: 'programming' },
                            { name: 'Pun', value: 'pun' },
                            { name: 'Dad Joke', value: 'dad' }
                        )
                )
        )
        // Fact subcommand
        .addSubcommand(subcommand =>
            subcommand
                .setName('fact')
                .setDescription('Get a random fact')
        )
        // Quote subcommand
        .addSubcommand(subcommand =>
            subcommand
                .setName('quote')
                .setDescription('Get an inspirational quote')
        )
        // Roll subcommand
        .addSubcommand(subcommand =>
            subcommand
                .setName('roll')
                .setDescription('Roll a dice')
                .addIntegerOption(option =>
                    option
                        .setName('sides')
                        .setDescription('Number of sides')
                        .setRequired(false)
                        .setMinValue(2)
                        .setMaxValue(100)
                )
        )
        // Choose subcommand
        .addSubcommand(subcommand =>
            subcommand
                .setName('choose')
                .setDescription('Choose between options')
                .addStringOption(option =>
                    option
                        .setName('options')
                        .setDescription('Options separated by | (e.g., option1|option2|option3)')
                        .setRequired(true)
                )
        )
        // Coinflip subcommand
        .addSubcommand(subcommand =>
            subcommand
                .setName('coinflip')
                .setDescription('Flip a coin')
        ),
    category: 'fun',

    async execute(interaction) {
        if (!interaction.guild) return;

        try {
            const subcommand = interaction.options.getSubcommand();

            const embed = new EmbedBuilder()
                .setColor('#5865F2')
                .setTitle('🎉 Fun Command In Development')
                .setDescription(
                    `This fun feature is currently being developed!\n\n` +
                    `**Command:** \`/fun ${subcommand}\`\n` +
                    `**Category:** Fun\n\n` +
                    `Check back soon for updates!`
                )
                .setFooter({ text: 'Coming soon!' })
                .setTimestamp();

            await interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral });
        } catch (error: any) {
            console.error('fun command error:', error);
            await interaction.reply({
                content: '❌ An error occurred while executing this command',
                flags: MessageFlags.Ephemeral
            });
        }
    }
};
