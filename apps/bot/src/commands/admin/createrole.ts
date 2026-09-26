/**
 * CreateRole Command
 *
 * Create a new role with optional color, hoist and mentionable flags.
 */

import { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits, MessageFlags } from 'discord.js';
import type { Command } from '../../types/command';

export const createrole: Command = {
    data: new SlashCommandBuilder()
        .setName('createrole')
        .setDescription('Create a new role')
        .setDMPermission(false)
        .addStringOption(o => o.setName('name').setDescription('Role name').setRequired(true).setMaxLength(100))
        .addStringOption(o => o.setName('color').setDescription('Hex color (e.g. #5865F2)').setRequired(false))
        .addBooleanOption(o => o.setName('hoist').setDescription('Show members separately in the sidebar').setRequired(false))
        .addBooleanOption(o => o.setName('mentionable').setDescription('Allow anyone to mention this role').setRequired(false)),
    requiredPermission: PermissionFlagsBits.ManageRoles,
    category: 'admin',

    async execute(interaction) {
        if (!interaction.guild) return;

        const name = interaction.options.getString('name', true);
        const colorInput = interaction.options.getString('color');
        const hoist = interaction.options.getBoolean('hoist') ?? false;
        const mentionable = interaction.options.getBoolean('mentionable') ?? false;

        let color: number | undefined;
        if (colorInput) {
            const hex = colorInput.trim().replace(/^#/, '');
            if (!/^[0-9a-fA-F]{6}$/.test(hex)) {
                await interaction.reply({ content: '❌ Invalid color. Use a hex code like `#5865F2`.', flags: MessageFlags.Ephemeral });
                return;
            }
            color = parseInt(hex, 16);
        }

        await interaction.deferReply({ flags: MessageFlags.Ephemeral });

        try {
            const role = await interaction.guild.roles.create({
                name,
                colors: color !== undefined ? { primaryColor: color } : undefined,
                hoist,
                mentionable,
                reason: `Created by ${interaction.user.tag}`,
            });

            const embed = new EmbedBuilder()
                .setColor(role.color || 0x5865f2)
                .setTitle('✅ Role Created')
                .addFields(
                    { name: 'Role', value: `<@&${role.id}>`, inline: true },
                    { name: 'Hoisted', value: hoist ? 'Yes' : 'No', inline: true },
                    { name: 'Mentionable', value: mentionable ? 'Yes' : 'No', inline: true },
                )
                .setTimestamp();

            await interaction.editReply({ embeds: [embed] });
        } catch (error: any) {
            console.error('createrole error:', error);
            await interaction.editReply({ content: `❌ Failed to create role: ${error.message ?? 'Unknown error'}` });
        }
    },
};
