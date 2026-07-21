/**
 * Role Command
 * 
 * Comprehensive role management system
 */

import { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits, MessageFlags, Role } from 'discord.js';
import type { Command } from '../../types/command';

export const role: Command = {
    data: new SlashCommandBuilder()
        .setName('role')
        .setDescription('Manage server roles')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles)
        .setDMPermission(false)
        .addSubcommand(subcommand =>
            subcommand
                .setName('create')
                .setDescription('Create a new role')
                .addStringOption(option =>
                    option
                        .setName('name')
                        .setDescription('Role name')
                        .setRequired(true)
                )
                .addStringOption(option =>
                    option
                        .setName('color')
                        .setDescription('Role color (hex code, e.g., #FF0000)')
                        .setRequired(false)
                )
                .addBooleanOption(option =>
                    option
                        .setName('hoisted')
                        .setDescription('Display role separately in member list')
                        .setRequired(false)
                )
                .addBooleanOption(option =>
                    option
                        .setName('mentionable')
                        .setDescription('Allow anyone to mention this role')
                        .setRequired(false)
                )
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('delete')
                .setDescription('Delete a role')
                .addRoleOption(option =>
                    option
                        .setName('role')
                        .setDescription('Role to delete')
                        .setRequired(true)
                )
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('give')
                .setDescription('Give a role to a user')
                .addUserOption(option =>
                    option
                        .setName('user')
                        .setDescription('User to give role to')
                        .setRequired(true)
                )
                .addRoleOption(option =>
                    option
                        .setName('role')
                        .setDescription('Role to give')
                        .setRequired(true)
                )
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('remove')
                .setDescription('Remove a role from a user')
                .addUserOption(option =>
                    option
                        .setName('user')
                        .setDescription('User to remove role from')
                        .setRequired(true)
                )
                .addRoleOption(option =>
                    option
                        .setName('role')
                        .setDescription('Role to remove')
                        .setRequired(true)
                )
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('list')
                .setDescription('List all server roles')
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('info')
                .setDescription('Get information about a role')
                .addRoleOption(option =>
                    option
                        .setName('role')
                        .setDescription('Role to get info about')
                        .setRequired(true)
                )
        ),
    category: 'setup',

    async execute(interaction) {
        if (!interaction.guild) return;

        const subcommand = interaction.options.getSubcommand();

        try {
            switch (subcommand) {
                case 'create': {
                    const name = interaction.options.getString('name', true);
                    const color = interaction.options.getString('color');
                    const hoisted = interaction.options.getBoolean('hoisted') ?? false;
                    const mentionable = interaction.options.getBoolean('mentionable') ?? false;

                    const role = await interaction.guild.roles.create({
                        name,
                        color: color ? color as `#${string}` : undefined,
                        hoist: hoisted,
                        mentionable,
                        reason: `Created by ${interaction.user.tag}`
                    });

                    const embed = new EmbedBuilder()
                        .setColor('#2ECC71')
                        .setTitle('✅ Role Created')
                        .setDescription(`Successfully created role ${role}`)
                        .addFields(
                            { name: 'Name', value: role.name, inline: true },
                            { name: 'ID', value: role.id, inline: true },
                            { name: 'Color', value: role.hexColor, inline: true },
                            { name: 'Hoisted', value: hoisted ? 'Yes' : 'No', inline: true },
                            { name: 'Mentionable', value: mentionable ? 'Yes' : 'No', inline: true }
                        )
                        .setTimestamp();

                    await interaction.reply({ embeds: [embed] });
                    break;
                }

                case 'delete': {
                    const role = interaction.options.getRole('role', true) as Role;

                    if (role.managed) {
                        await interaction.reply({
                            content: '❌ Cannot delete managed roles (bot roles, boosts, etc.)',
                            flags: MessageFlags.Ephemeral
                        });
                        return;
                    }

                    if (role.position >= interaction.guild.members.me!.roles.highest.position) {
                        await interaction.reply({
                            content: '❌ I cannot delete roles higher than or equal to my highest role',
                            flags: MessageFlags.Ephemeral
                        });
                        return;
                    }

                    const roleName = role.name;
                    await role.delete(`Deleted by ${interaction.user.tag}`);

                    const embed = new EmbedBuilder()
                        .setColor('#E74C3C')
                        .setTitle('🗑️ Role Deleted')
                        .setDescription(`Successfully deleted role **${roleName}**`)
                        .setTimestamp();

                    await interaction.reply({ embeds: [embed] });
                    break;
                }

                case 'give': {
                    const user = interaction.options.getUser('user', true);
                    const role = interaction.options.getRole('role', true) as Role;
                    const member = await interaction.guild.members.fetch(user.id);

                    if (member.roles.cache.has(role.id)) {
                        await interaction.reply({
                            content: `❌ ${user} already has the ${role} role`,
                            flags: MessageFlags.Ephemeral
                        });
                        return;
                    }

                    await member.roles.add(role, `Added by ${interaction.user.tag}`);

                    const embed = new EmbedBuilder()
                        .setColor('#2ECC71')
                        .setTitle('✅ Role Given')
                        .setDescription(`Successfully gave ${role} to ${user}`)
                        .setTimestamp();

                    await interaction.reply({ embeds: [embed] });
                    break;
                }

                case 'remove': {
                    const user = interaction.options.getUser('user', true);
                    const role = interaction.options.getRole('role', true) as Role;
                    const member = await interaction.guild.members.fetch(user.id);

                    if (!member.roles.cache.has(role.id)) {
                        await interaction.reply({
                            content: `❌ ${user} doesn't have the ${role} role`,
                            flags: MessageFlags.Ephemeral
                        });
                        return;
                    }

                    await member.roles.remove(role, `Removed by ${interaction.user.tag}`);

                    const embed = new EmbedBuilder()
                        .setColor('#E74C3C')
                        .setTitle('✅ Role Removed')
                        .setDescription(`Successfully removed ${role} from ${user}`)
                        .setTimestamp();

                    await interaction.reply({ embeds: [embed] });
                    break;
                }

                case 'list': {
                    const roles = interaction.guild.roles.cache
                        .filter(r => r.id !== interaction.guild!.id)
                        .sort((a, b) => b.position - a.position)
                        .map(r => `${r} - ${r.members.size} members`)
                        .slice(0, 25);

                    const embed = new EmbedBuilder()
                        .setColor('#5865F2')
                        .setTitle(`📋 Server Roles (${interaction.guild.roles.cache.size - 1})`)
                        .setDescription(roles.join('\n') || 'No roles found')
                        .setFooter({ text: `Showing ${roles.length} roles` })
                        .setTimestamp();

                    await interaction.reply({ embeds: [embed] });
                    break;
                }

                case 'info': {
                    const role = interaction.options.getRole('role', true) as Role;

                    const permissions = role.permissions.toArray().slice(0, 10).join(', ') || 'None';

                    const embed = new EmbedBuilder()
                        .setColor(role.color || '#5865F2')
                        .setTitle(`📊 Role Information: ${role.name}`)
                        .addFields(
                            { name: 'ID', value: role.id, inline: true },
                            { name: 'Color', value: role.hexColor, inline: true },
                            { name: 'Position', value: role.position.toString(), inline: true },
                            { name: 'Members', value: role.members.size.toString(), inline: true },
                            { name: 'Hoisted', value: role.hoist ? 'Yes' : 'No', inline: true },
                            { name: 'Mentionable', value: role.mentionable ? 'Yes' : 'No', inline: true },
                            { name: 'Managed', value: role.managed ? 'Yes (Bot/Integration)' : 'No', inline: true },
                            { name: 'Created', value: `<t:${Math.floor(role.createdTimestamp / 1000)}:R>`, inline: true },
                            { name: 'Permissions', value: permissions, inline: false }
                        )
                        .setTimestamp();

                    await interaction.reply({ embeds: [embed] });
                    break;
                }
            }
        } catch (error) {
            console.error('Role command error:', error);
            await interaction.reply({
                content: '❌ An error occurred while managing roles. Please check my permissions and try again.',
                flags: MessageFlags.Ephemeral
            });
        }
    }
};
