/**
 * Help Command
 * 
 * Beautiful help command with category dropdown and pagination
 */

import {
    SlashCommandBuilder,
    EmbedBuilder,
    ActionRowBuilder,
    StringSelectMenuBuilder,
    StringSelectMenuInteraction,
    MessageFlags,
    ComponentType
} from 'discord.js';
import type { Command } from '../types/command';

// Category emojis and descriptions
const categoryInfo: Record<string, { emoji: string; description: string }> = {
    moderation: { emoji: '🛡️', description: 'Moderation and safety tools' },
    admin: { emoji: '⚙️', description: 'Server administration commands' },
    setup: { emoji: '🔧', description: 'Server setup and configuration' },
    utility: { emoji: '🔨', description: 'Useful utility commands' },
    economy: { emoji: '💰', description: 'Economy and currency system' },
    leveling: { emoji: '⭐', description: 'Leveling and XP system' },
    fun: { emoji: '🎮', description: 'Fun and entertainment' },
    games: { emoji: '🎲', description: 'Interactive games' },
    music: { emoji: '🎵', description: 'Music player commands' },
    community: { emoji: '👥', description: 'Community engagement' },
    voice: { emoji: '🔊', description: 'Voice channel management' },
    giveaway: { emoji: '🎁', description: 'Giveaway system' },
    suggestions: { emoji: '💡', description: 'Suggestion system' },
    tickets: { emoji: '🎫', description: 'Support ticket system' },
    ai: { emoji: '🤖', description: 'AI-powered features' },
    events: { emoji: '📅', description: 'Event management' },
    logs: { emoji: '📝', description: 'Logging and moderation logs' },
    analytics: { emoji: '📊', description: 'Server analytics' },
    starboard: { emoji: '⭐', description: 'Starboard system' },
    afk: { emoji: '💤', description: 'AFK status system' },
    emoji: { emoji: '😀', description: 'Emoji management' },
    image: { emoji: '🖼️', description: 'Image manipulation' },
    social: { emoji: '💕', description: 'Social interactions' },
    search: { emoji: '🔍', description: 'Search and information' },
    birthday: { emoji: '🎂', description: 'Birthday tracking' },
    automod: { emoji: '🤖', description: 'Auto-moderation' }
};

export const help: Command = {
    data: new SlashCommandBuilder()
        .setName('help')
        .setDescription('View all available commands and modules')
        .setDMPermission(true),
    category: 'utility',

    async execute(interaction: any) {
        try {
            console.log('[HELP] Command executed by:', interaction.user.tag);

            // Get all commands from the client
            const client = interaction.client;

            if (!client || !client.commands) {
                console.error('[HELP] Client or commands collection is undefined');
                throw new Error('Bot client is not properly initialized');
            }

            console.log('[HELP] Total commands in client:', client.commands.size);

            const commandsByCategory: Record<string, string[]> = {};

            // Organize commands by category
            for (const [name, command] of client.commands) {
                const category = (command as any).category || 'other';
                if (!commandsByCategory[category]) {
                    commandsByCategory[category] = [];
                }
                commandsByCategory[category].push(name);
            }

            console.log('[HELP] Commands organized into', Object.keys(commandsByCategory).length, 'categories');

            const totalCommands = client.commands.size;
            const totalCategories = Object.keys(commandsByCategory).length;

            // Create main embed
            const mainEmbed = new EmbedBuilder()
                .setColor('#5865F2')
                .setTitle('📚 Command Help Menu')
                .setDescription(
                    `Welcome to the help menu! Select a category from the dropdown below to view commands.\n\n` +
                    `**Statistics:**\n` +
                    `📊 Total Commands: **${totalCommands}**\n` +
                    `📁 Categories: **${totalCategories}**\n\n` +
                    `**Quick Links:**\n` +
                    `[Dashboard](https://discord.com) • [Support](https://discord.gg/discord)`
                )
                .addFields(
                    {
                        name: '💡 How to Use',
                        value: '• Select a category from the dropdown menu\n• Use `/command` to execute any command\n• Most commands require specific permissions',
                        inline: false
                    }
                )
                .setFooter({ text: `Requested by ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL() })
                .setTimestamp();

            console.log('[HELP] Embed created successfully');

            // Create category select menu
            const categories = Object.keys(commandsByCategory).sort();
            console.log('[HELP] Creating select menu with', categories.length, 'categories');

            // Discord allows max 25 options in select menu
            // Prioritize the most important categories
            const priorityCategories = [
                'moderation', 'setup', 'utility', 'admin', 'economy',
                'leveling', 'community', 'games', 'fun', 'music',
                'ai', 'giveaway', 'tickets', 'suggestions', 'voice',
                'events', 'logs', 'search', 'social', 'emoji',
                'image', 'starboard', 'afk', 'birthday', 'analytics'
            ];

            // Filter to show only categories that exist and limit to 25
            const categoriesToShow = priorityCategories
                .filter(cat => categories.includes(cat))
                .slice(0, 25);

            // Add any remaining categories if we have space
            const remainingCategories = categories
                .filter(cat => !categoriesToShow.includes(cat))
                .slice(0, 25 - categoriesToShow.length);

            const finalCategories = [...categoriesToShow, ...remainingCategories].slice(0, 25);

            console.log('[HELP] Showing', finalCategories.length, 'categories in select menu');

            const selectMenu = new StringSelectMenuBuilder()
                .setCustomId('help_category')
                .setPlaceholder('📂 Select a category to view commands')
                .addOptions(
                    finalCategories.map(category => ({
                        label: category.charAt(0).toUpperCase() + category.slice(1),
                        description: categoryInfo[category]?.description || `${commandsByCategory[category].length} commands`,
                        value: category,
                        emoji: categoryInfo[category]?.emoji || '📁'
                    }))
                );

            const row = new ActionRowBuilder<StringSelectMenuBuilder>()
                .addComponents(selectMenu);

            console.log('[HELP] Sending reply...');

            const response = await interaction.reply({
                embeds: [mainEmbed],
                components: [row],
                flags: MessageFlags.Ephemeral
            });

            console.log('[HELP] Reply sent successfully');

            // Create collector for select menu
            const collector = response.createMessageComponentCollector({
                componentType: ComponentType.StringSelect,
                time: 300000 // 5 minutes
            });

            collector.on('collect', async (i: StringSelectMenuInteraction) => {
                if (i.user.id !== interaction.user.id) {
                    await i.reply({ content: '❌ This menu is not for you!', flags: MessageFlags.Ephemeral });
                    return;
                }

                const selectedCategory = i.values[0];
                const commands = commandsByCategory[selectedCategory] || [];

                const categoryEmbed = new EmbedBuilder()
                    .setColor('#5865F2')
                    .setTitle(`${categoryInfo[selectedCategory]?.emoji || '📁'} ${selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1)} Commands`)
                    .setDescription(categoryInfo[selectedCategory]?.description || 'Available commands in this category')
                    .addFields({
                        name: `Commands (${commands.length})`,
                        value: commands.length > 0
                            ? commands.map(cmd => `\`/${cmd}\``).join(', ')
                            : 'No commands in this category',
                        inline: false
                    })
                    .setFooter({ text: `Category: ${selectedCategory} • Use /command to execute`, iconURL: interaction.user.displayAvatarURL() })
                    .setTimestamp();

                await i.update({ embeds: [categoryEmbed], components: [row] });
            });

            collector.on('end', async () => {
                try {
                    await interaction.editReply({ components: [] });
                } catch (error) {
                    // Message might be deleted
                }
            });

        } catch (error) {
            console.error('Help command error:', error);

            const errorEmbed = new EmbedBuilder()
                .setColor('#E74C3C')
                .setTitle('❌ Error')
                .setDescription('An error occurred while loading the help menu. Please try again later.')
                .setTimestamp();

            if (interaction.replied || interaction.deferred) {
                await interaction.editReply({ embeds: [errorEmbed], components: [] });
            } else {
                await interaction.reply({ embeds: [errorEmbed], flags: MessageFlags.Ephemeral });
            }
        }
    }
};
