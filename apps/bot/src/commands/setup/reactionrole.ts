/**
 * Reaction Role Command
 * 
 * Create and manage reaction roles for self-assignable roles
 */

import { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits, MessageFlags, Role, TextChannel } from 'discord.js';
import type { Command } from '../../types/command';
import { apiClient } from '../../utils/api-client';

export const reactionrole: Command = {
    data: new SlashCommandBuilder()
        .setName('reactionrole')
        .setDescription('Manage reaction roles')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles)
        .setDMPermission(false)
        .addSubcommand(subcommand =>
            subcommand
                .setName('create')
                .setDescription('Create a reaction role message')
                .addChannelOption(option =>
                    option
                        .setName('channel')
                        .setDescription('Channel to send the message')
                        .setRequired(true)
                )
                .addStringOption(option =>
                    option
                        .setName('title')
                        .setDescription('Embed title')
                        .setRequired(true)
                )
                .addStringOption(option =>
                    option
                        .setName('description')
                        .setDescription('Embed description')
                        .setRequired(true)
                )
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('add')
                .setDescription('Add a reaction role to a message')
                .addStringOption(option =>
                    option
                        .setName('message_id')
                        .setDescription('Message ID')
                        .setRequired(true)
                )
                .addStringOption(option =>
                    option
                        .setName('emoji')
                        .setDescription('Emoji to react with')
                        .setRequired(true)
                )
                .addRoleOption(option =>
                    option
                        .setName('role')
                        .setDescription('Role to assign')
                        .setRequired(true)
                )
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('remove')
                .setDescription('Remove a reaction role from a message')
                .addStringOption(option =>
                    option
                        .setName('message_id')
                        .setDescription('Message ID')
                        .setRequired(true)
                )
                .addStringOption(option =>
                    option
                        .setName('emoji')
                        .setDescription('Emoji to remove')
                        .setRequired(true)
                )
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('list')
                .setDescription('List all reaction role messages')
        ),
    category: 'setup',

    async execute(interaction) {
        if (!interaction.guild) return;

        const subcommand = interaction.options.getSubcommand();

        try {
            switch (subcommand) {
                case 'create': {
                    const channel = interaction.options.getChannel('channel', true) as TextChannel;
                    const title = interaction.options.getString('title', true);
                    const description = interaction.options.getString('description', true);

                    if (!channel.isTextBased()) {
                        await interaction.reply({
                            content: '❌ Please select a text channel',
                            flags: MessageFlags.Ephemeral
                        });
                        return;
                    }

                    const embed = new EmbedBuilder()
                        .setColor('#5865F2')
                        .setTitle(title)
                        .setDescription(description)
                        .setFooter({ text: 'React to get a role!' })
                        .setTimestamp();

                    const message = await channel.send({ embeds: [embed] });

                    await apiClient.post(
                        `/guilds/${interaction.guild.id}/reactionroles`,
                        {
                            messageId: message.id,
                            channelId: channel.id,
                            title,
                            description
                        }
                    );

                    await interaction.reply({
                        content: `✅ Reaction role message created in ${channel}\nMessage ID: \`${message.id}\`\nUse \`/reactionrole add\` to add roles to this message`,
                        flags: MessageFlags.Ephemeral
                    });
                    break;
                }

                case 'add': {
                    const messageId = interaction.options.getString('message_id', true);
                    const emoji = interaction.options.getString('emoji', true);
                    const role = interaction.options.getRole('role', true) as Role;

                    if (role.managed) {
                        await interaction.reply({
                            content: '❌ Cannot assign managed roles',
                            flags: MessageFlags.Ephemeral
                        });
                        return;
                    }

                    await apiClient.post(
                        `/guilds/${interaction.guild.id}/reactionroles/${messageId}/roles`,
                        {
                            emoji,
                            roleId: role.id
                        }
                    );

                    // Try to add the reaction to the message
                    try {
                        const channels = await interaction.guild.channels.fetch();
                        for (const [, channel] of channels) {
                            if (channel?.isTextBased()) {
                                try {
                                    const message = await (channel as TextChannel).messages.fetch(messageId);
                                    await message.react(emoji);
                                    break;
                                } catch {
                                    continue;
                                }
                            }
                        }
                    } catch (error) {
                        console.error('Failed to add reaction:', error);
                    }

                    await interaction.reply({
                        content: `✅ Added ${emoji} → ${role} to the reaction role message`,
                        flags: MessageFlags.Ephemeral
                    });
                    break;
                }

                case 'remove': {
                    const messageId = interaction.options.getString('message_id', true);
                    const emoji = interaction.options.getString('emoji', true);

                    await apiClient.delete(
                        `/guilds/${interaction.guild.id}/reactionroles/${messageId}/roles/${encodeURIComponent(emoji)}`
                    );

                    await interaction.reply({
                        content: `✅ Removed ${emoji} from the reaction role message`,
                        flags: MessageFlags.Ephemeral
                    });
                    break;
                }

                case 'list': {
                    const response = await apiClient.get(
                        `/guilds/${interaction.guild.id}/reactionroles`
                    );

                    interface ReactionRole {
                        messageId: string;
                        channelId: string;
                        title: string;
                        roles: { emoji: string; roleId: string }[];
                    }
                    const responseData = response as { data?: { reactionRoles: ReactionRole[] } };
                    const { reactionRoles = [] } = responseData.data || {};

                    if (reactionRoles.length === 0) {
                        await interaction.reply({
                            content: '📋 No reaction role messages configured',
                            flags: MessageFlags.Ephemeral
                        });
                        return;
                    }

                    const embed = new EmbedBuilder()
                        .setColor('#5865F2')
                        .setTitle('📋 Reaction Role Messages')
                        .setDescription(
                            reactionRoles.map((rr: ReactionRole) => {
                                const rolesText = rr.roles.map(r => `${r.emoji} <@&${r.roleId}>`).join('\n');
                                return `**${rr.title}**\n<#${rr.channelId}> (ID: \`${rr.messageId}\`)\n${rolesText || 'No roles configured'}`;
                            }).join('\n\n')
                        )
                        .setFooter({ text: `${reactionRoles.length} message(s)` })
                        .setTimestamp();

                    await interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral });
                    break;
                }
            }
        } catch (error: any) {
            console.error('Reaction role error:', error);
            await interaction.reply({
                content: error.response?.data?.message || '❌ Failed to manage reaction roles',
                flags: MessageFlags.Ephemeral
            });
        }
    }
};
