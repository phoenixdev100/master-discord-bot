/**
 * Purge Command
 *
 * Bulk-delete recent messages in the current channel,
 * optionally filtered to a single user.
 */

import { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits, MessageFlags } from 'discord.js';
import type { Command } from '../../types/command';

export const purge: Command = {
    data: new SlashCommandBuilder()
        .setName('purge')
        .setDescription('Purge messages from a user')
        .setDMPermission(false)
        .addIntegerOption(option =>
            option.setName('amount').setDescription('Number of messages (1-100)').setRequired(true).setMinValue(1).setMaxValue(100)
        )
        .addUserOption(option =>
            option.setName('user').setDescription('Only delete this user\'s messages').setRequired(false)
        ),
    requiredPermission: PermissionFlagsBits.ManageMessages,
    category: 'admin',

    async execute(interaction) {
        if (!interaction.guild || !interaction.channel) return;

        const amount = interaction.options.getInteger('amount', true);
        const user = interaction.options.getUser('user');

        try {
            const channel = interaction.channel;
            if (!('bulkDelete' in channel) || !('messages' in channel)) {
                await interaction.reply({ content: '❌ This command can only be used in text channels.', flags: MessageFlags.Ephemeral });
                return;
            }

            const me = interaction.guild.members.me ?? await interaction.guild.members.fetchMe();
            if (!channel.permissionsFor(me)?.has(PermissionFlagsBits.ManageMessages)) {
                await interaction.reply({ content: '❌ I need the Manage Messages permission in this channel.', flags: MessageFlags.Ephemeral });
                return;
            }

            await interaction.deferReply({ flags: MessageFlags.Ephemeral });

            let deleted = 0;
            if (user) {
                // Fetch recent history and filter to the target user
                const fetched = await channel.messages.fetch({ limit: 100 });
                const toDelete = fetched.filter(m => m.author.id === user.id).first(amount);
                if (toDelete.length === 0) {
                    await interaction.editReply({ content: `❌ No recent messages from ${user.tag} found in this channel.` });
                    return;
                }
                const result = await channel.bulkDelete(toDelete, true);
                deleted = result.size;
            } else {
                const result = await channel.bulkDelete(amount, true);
                deleted = result.size;
            }

            const embed = new EmbedBuilder()
                .setColor(0x57f287)
                .setTitle('🧹 Messages Purged')
                .setDescription(`Deleted **${deleted}** message(s)${user ? ` from ${user.tag}` : ''}.`)
                .setFooter({ text: `Requested by ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL() })
                .setTimestamp();

            await interaction.editReply({ embeds: [embed] });
        } catch (error: any) {
            console.error('purge command error:', error);
            const content = `❌ Failed to purge: ${error.message ?? 'Unknown error'}`;
            if (interaction.deferred) {
                await interaction.editReply({ content });
            } else {
                await interaction.reply({ content, flags: MessageFlags.Ephemeral });
            }
        }
    }
};
