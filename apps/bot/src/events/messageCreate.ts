/**
 * Message Create Event Handler
 * 
 * Handles bot mentions and shows welcome/info message
 */

import { Message, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import type { BotClient } from '../client';
import logger from '../config/logger';

export async function handleMessageCreate(
    client: BotClient,
    message: Message
): Promise<void> {
    // Ignore bot messages
    if (message.author.bot) return;

    // Check if bot is mentioned
    const botMention = `<@${client.user?.id}>`;
    const botMentionNickname = `<@!${client.user?.id}>`;

    if (message.content === botMention || message.content === botMentionNickname ||
        message.content.startsWith(botMention) || message.content.startsWith(botMentionNickname)) {

        try {
            const totalCommands = client.commands.size;
            const totalServers = client.guilds.cache.size;
            const totalUsers = client.users.cache.size;

            const embed = new EmbedBuilder()
                .setColor('#5865F2')
                .setAuthor({
                    name: `${client.user?.username} - Your All-in-One Discord Bot`,
                    iconURL: client.user?.displayAvatarURL()
                })
                .setDescription(
                    `### 👋 Hey ${message.author}! Thanks for summoning me!\n\n` +
                    `I'm a **powerful multi-purpose bot** with **${totalCommands} commands** across **32+ categories**. ` +
                    `From moderation to music, games to AI - I've got everything you need!\n\n` +
                    `┌─────────────────────────────────┐\n` +
                    `│ 🎯 **Quick Start Guide**       │\n` +
                    `└─────────────────────────────────┘\n` +
                    `> **Step 1:** Type \`/help\` to explore all commands\n` +
                    `> **Step 2:** Use \`/setup\` to configure the bot\n` +
                    `> **Step 3:** Type \`/\` to see command suggestions\n\n` +
                    `┌─────────────────────────────────┐\n` +
                    `│ ⭐ **Popular Features**        │\n` +
                    `└─────────────────────────────────┘`
                )
                .addFields(
                    {
                        name: '🛡️ Moderation & Safety',
                        value: '`/ban` `/kick` `/mute` `/warn`\n`/antispam` `/antiraid` `/filter`',
                        inline: true
                    },
                    {
                        name: '💰 Economy & Leveling',
                        value: '`/balance` `/daily` `/shop`\n`/rank` `/leaderboard` `/work`',
                        inline: true
                    },
                    {
                        name: '🎮 Fun & Games',
                        value: '`/trivia` `/chess` `/tictactoe`\n`/akinator` `/wordle` `/8ball`',
                        inline: true
                    },
                    {
                        name: '🎵 Music Player',
                        value: '`/play` `/queue` `/skip`\n`/pause` `/resume` `/volume`',
                        inline: true
                    },
                    {
                        name: '🤖 AI Assistant',
                        value: '`/ai chat` `/ai image` `/ai code`\n`/translate` `/summarize`',
                        inline: true
                    },
                    {
                        name: '⚙️ Server Setup',
                        value: '`/setup` `/autorole` `/welcome`\n`/logs` `/verification` `/backup`',
                        inline: true
                    }
                )
                .addFields({
                    name: '\u200b',
                    value:
                        `┌─────────────────────────────────┐\n` +
                        `│ � **Bot Statistics**           │\n` +
                        `└─────────────────────────────────┘\n` +
                        `🌐 **Servers:** \`${totalServers}\` | 👥 **Users:** \`${totalUsers}\` | 📝 **Commands:** \`${totalCommands}\`\n` +
                        `⚡ **Uptime:** \`${Math.floor(process.uptime() / 3600)}h ${Math.floor((process.uptime() % 3600) / 60)}m\` | 🏓 **Ping:** \`${client.ws.ping}ms\``,
                    inline: false
                })
                .setThumbnail(client.user?.displayAvatarURL() || '')
                .setImage('https://i.imgur.com/AfFp7pu.png') // Add a banner image (you can replace this)
                .setFooter({
                    text: `Requested by ${message.author.tag} • Made with ❤️`,
                    iconURL: message.author.displayAvatarURL()
                })
                .setTimestamp();

            const row1 = new ActionRowBuilder<ButtonBuilder>()
                .addComponents(
                    new ButtonBuilder()
                        .setLabel('Commands')
                        .setStyle(ButtonStyle.Primary)
                        .setCustomId('view_commands')
                        .setEmoji('📚'),
                    new ButtonBuilder()
                        .setLabel('Setup')
                        .setStyle(ButtonStyle.Success)
                        .setCustomId('setup_bot')
                        .setEmoji('⚙️'),
                    new ButtonBuilder()
                        .setLabel('Games')
                        .setStyle(ButtonStyle.Secondary)
                        .setCustomId('play_games')
                        .setEmoji('🎮'),
                    new ButtonBuilder()
                        .setLabel('Music')
                        .setStyle(ButtonStyle.Secondary)
                        .setCustomId('music_player')
                        .setEmoji('🎵')
                );

            const row2 = new ActionRowBuilder<ButtonBuilder>()
                .addComponents(
                    new ButtonBuilder()
                        .setLabel('Dashboard')
                        .setStyle(ButtonStyle.Link)
                        .setURL('https://discord.com')
                        .setEmoji('🔗'),
                    new ButtonBuilder()
                        .setLabel('Support')
                        .setStyle(ButtonStyle.Link)
                        .setURL('https://discord.gg/discord')
                        .setEmoji('❓'),
                    new ButtonBuilder()
                        .setLabel('Invite')
                        .setStyle(ButtonStyle.Link)
                        .setURL(`https://discord.com/api/oauth2/authorize?client_id=${client.user?.id}&permissions=8&scope=bot%20applications.commands`)
                        .setEmoji('➕'),
                    new ButtonBuilder()
                        .setLabel('Vote')
                        .setStyle(ButtonStyle.Link)
                        .setURL('https://top.gg')
                        .setEmoji('⭐')
                );

            await message.reply({
                embeds: [embed],
                components: [row1, row2]
            });

            logger.debug({ user: message.author.tag, guild: message.guild?.name }, 'Bot mentioned');
        } catch (error) {
            logger.error({ error }, 'Failed to send mention response');
        }
    }
}
