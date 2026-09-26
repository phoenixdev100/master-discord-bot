/**
 * InRole Command
 *
 * List members who have a specific role.
 */

import { SlashCommandBuilder, EmbedBuilder, MessageFlags } from 'discord.js';
import type { Command } from '../../types/command';

export const inrole: Command = {
    data: new SlashCommandBuilder()
        .setName('inrole')
        .setDescription('List members who have a role')
        .setDMPermission(false)
        .addRoleOption(o => o.setName('role').setDescription('Role to inspect').setRequired(true)),
    category: 'admin',

    async execute(interaction) {
        if (!interaction.guild) return;

        const raw = interaction.options.getRole('role', true);
        const role = interaction.guild.roles.cache.get(raw.id);
        if (!role) {
            await interaction.reply({ content: '❌ Could not resolve that role.', flags: MessageFlags.Ephemeral });
            return;
        }
        await interaction.deferReply({ flags: MessageFlags.Ephemeral });

        try {
            const members = role.members.size > 0
                ? role.members
                : (await interaction.guild.members.fetch()).filter(m => m.roles.cache.has(role.id));

            const list = [...members.values()].sort((a, b) => a.displayName.localeCompare(b.displayName));
            const shown = list.slice(0, 40).map(m => `• ${m.user.tag}`).join('\n') || 'No members';
            const extra = list.length > 40 ? `\n*…and ${list.length - 40} more*` : '';

            const embed = new EmbedBuilder()
                .setColor(role.color || 0x5865f2)
                .setTitle(`Members with ${role.name} (${list.length})`)
                .setDescription((shown + extra).slice(0, 4000))
                .setTimestamp();

            await interaction.editReply({ embeds: [embed] });
        } catch (error: any) {
            console.error('inrole error:', error);
            await interaction.editReply({ content: `❌ Failed: ${error.message ?? 'Unknown error'}` });
        }
    },
};
