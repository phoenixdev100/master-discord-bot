/**
 * Auto Role Command
 * 
 * Automatically assign roles to new members
 */

import { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits, MessageFlags, Role } from 'discord.js';
import type { Command } from '../../types/command';
import { apiClient } from '../../utils/api-client';

export const autorole: Command = {
    data: new SlashCommandBuilder()
        .setName('autorole')
        .setDescription('Manage auto-assigned roles for new members')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles)
        .setDMPermission(false)
        .addSubcommand(subcommand =>
            subcommand
                .setName('add')
                .setDescription('Add a role to be auto-assigned')
                .addRoleOption(option =>
                    option
                        .setName('role')
                        .setDescription('Role to auto-assign')
                        .setRequired(true)
                )
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('remove')
                .setDescription('Remove an auto-assigned role')
                .addRoleOption(option =>
                    option
                        .setName('role')
                        .setDescription('Role to remove from auto-assign')
                        .setRequired(true)
                )
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('list')
                .setDescription('List all auto-assigned roles')
        ),
    category: 'setup',

    async execute(interaction) {
        if (!interaction.guild) return;

        const subcommand = interaction.options.getSubcommand();

        try {
            switch (subcommand) {
                case 'add': {
                    const role = interaction.options.getRole('role', true) as Role;

                    if (role.managed) {
                        await interaction.reply({
                            content: '❌ Cannot auto-assign managed roles (bot roles, boosts, etc.)',
                            flags: MessageFlags.Ephemeral
                        });
                        return;
                    }

                    if (role.position >= interaction.guild.members.me!.roles.highest.position) {
                        await interaction.reply({
                            content: '❌ I cannot assign roles higher than or equal to my highest role',
                            flags: MessageFlags.Ephemeral
                        });
                        return;
                    }

                    await apiClient.post(
                        `/guilds/${interaction.guild.id}/autoroles`,
                        { roleId: role.id }
                    );

                    const embed = new EmbedBuilder()
                        .setColor('#2ECC71')
                        .setTitle('✅ Auto Role Added')
                        .setDescription(`${role} will now be automatically assigned to new members`)
                        .setTimestamp();

                    await interaction.reply({ embeds: [embed] });
                    break;
                }

                case 'remove': {
                    const role = interaction.options.getRole('role', true) as Role;

                    await apiClient.delete(
                        `/guilds/${interaction.guild.id}/autoroles/${role.id}`
                    );

                    const embed = new EmbedBuilder()
                        .setColor('#E74C3C')
                        .setTitle('✅ Auto Role Removed')
                        .setDescription(`${role} will no longer be automatically assigned to new members`)
                        .setTimestamp();

                    await interaction.reply({ embeds: [embed] });
                    break;
                }

                case 'list': {
                    const response = await apiClient.get(
                        `/guilds/${interaction.guild.id}/autoroles`
                    );

                    interface AutoRole {
                        roleId: string;
                    }
                    const responseData = response as { data?: { autoroles: AutoRole[] } };
                    const { autoroles = [] } = responseData.data || {};

                    if (autoroles.length === 0) {
                        await interaction.reply({
                            content: '📋 No auto-assigned roles configured',
                            flags: MessageFlags.Ephemeral
                        });
                        return;
                    }

                    const rolesList = autoroles
                        .map((ar: AutoRole) => {
                            const role = interaction.guild!.roles.cache.get(ar.roleId);
                            return role ? `${role}` : `<@&${ar.roleId}> (deleted)`;
                        })
                        .join('\n');

                    const embed = new EmbedBuilder()
                        .setColor('#5865F2')
                        .setTitle('📋 Auto-Assigned Roles')
                        .setDescription(rolesList || 'None')
                        .setFooter({ text: `${autoroles.length} role(s) configured` })
                        .setTimestamp();

                    await interaction.reply({ embeds: [embed] });
                    break;
                }
            }
        } catch (error: any) {
            console.error('Auto role error:', error);
            await interaction.reply({
                content: error.response?.data?.message || '❌ Failed to manage auto roles',
                flags: MessageFlags.Ephemeral
            });
        }
    }
};
