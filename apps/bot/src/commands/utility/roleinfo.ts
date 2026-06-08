import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import type { Command } from '../../types/command';

export const roleinfo: Command = {
    data: new SlashCommandBuilder()
        .setName('roleinfo')
        .setDescription('Get information about a role')
        .addRoleOption(option =>
            option
                .setName('role')
                .setDescription('The role to get information about')
                .setRequired(true)
        ),
    category: 'utility',
    async execute(interaction) {
        if (!interaction.guild) return;

        const role = interaction.options.getRole('role', true) as any;

        const permissions = role.permissions.toArray().join(', ') || 'None';
        const members = interaction.guild.members.cache.filter((m: any) => m.roles.cache.has(role.id));

        const embed = new EmbedBuilder()
            .setColor(role.color || '#99AAB5')
            .setTitle(`🎭 Role Information: ${role.name}`)
            .addFields(
                { name: '🆔 ID', value: role.id, inline: true },
                { name: '🎨 Color', value: role.hexColor, inline: true },
                { name: '📍 Position', value: `${role.position}`, inline: true },
                { name: '👥 Members', value: `${members.size}`, inline: true },
                { name: '🔗 Mentionable', value: role.mentionable ? 'Yes' : 'No', inline: true },
                { name: '🔒 Hoisted', value: role.hoist ? 'Yes' : 'No', inline: true },
                { name: '🤖 Managed', value: role.managed ? 'Yes (Bot/Integration)' : 'No', inline: true },
                { name: '📅 Created', value: `<t:${Math.floor(role.createdTimestamp / 1000)}:R>`, inline: true },
                { name: '🔑 Permissions', value: permissions.length > 1024 ? 'Too many to display' : permissions, inline: false }
            )
            .setFooter({ text: `Requested by ${interaction.user.tag}` })
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    },
};
