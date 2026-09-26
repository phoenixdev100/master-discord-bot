/**
 * DeleteRole Command
 *
 * Delete a role from the server (with hierarchy + managed-role guards).
 */

import { SlashCommandBuilder, PermissionFlagsBits, MessageFlags } from 'discord.js';
import type { Command } from '../../types/command';

export const deleterole: Command = {
    data: new SlashCommandBuilder()
        .setName('deleterole')
        .setDescription('Delete a role from the server')
        .setDMPermission(false)
        .addRoleOption(o => o.setName('role').setDescription('Role to delete').setRequired(true)),
    requiredPermission: PermissionFlagsBits.ManageRoles,
    category: 'admin',

    async execute(interaction) {
        if (!interaction.guild) return;

        const raw = interaction.options.getRole('role', true);
        const role = interaction.guild.roles.cache.get(raw.id);
        if (!role) {
            await interaction.reply({ content: '❌ Could not resolve that role.', flags: MessageFlags.Ephemeral });
            return;
        }

        if (role.id === interaction.guild.id) {
            await interaction.reply({ content: '❌ You cannot delete the @everyone role.', flags: MessageFlags.Ephemeral });
            return;
        }
        if (role.managed) {
            await interaction.reply({ content: '❌ That role is managed by an integration/bot and cannot be deleted.', flags: MessageFlags.Ephemeral });
            return;
        }

        const me = interaction.guild.members.me ?? await interaction.guild.members.fetchMe();
        if (role.position >= me.roles.highest.position) {
            await interaction.reply({ content: '❌ I cannot delete a role at or above my highest role.', flags: MessageFlags.Ephemeral });
            return;
        }

        await interaction.deferReply({ flags: MessageFlags.Ephemeral });

        try {
            await role.delete(`Deleted by ${interaction.user.tag}`);
            await interaction.editReply({ content: `✅ Role **${role.name}** has been deleted.` });
        } catch (error: any) {
            console.error('deleterole error:', error);
            await interaction.editReply({ content: `❌ Failed to delete role: ${error.message ?? 'Unknown error'}` });
        }
    },
};
