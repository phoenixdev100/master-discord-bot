import { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits, MessageFlags } from 'discord.js';
import type { Command } from '../../types/command';
import { apiClient } from '../../utils/api-client';

export const automod: Command = {
    data: new SlashCommandBuilder()
        .setName('automod')
        .setDescription('Configure auto-moderation settings')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
        .addSubcommand(subcommand =>
            subcommand
                .setName('spam')
                .setDescription('Configure spam detection')
                .addBooleanOption(option =>
                    option
                        .setName('enabled')
                        .setDescription('Enable or disable spam detection')
                        .setRequired(true)
                )
                .addIntegerOption(option =>
                    option
                        .setName('threshold')
                        .setDescription('Number of messages in 5 seconds to trigger')
                        .setMinValue(3)
                        .setMaxValue(20)
                )
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('caps')
                .setDescription('Configure caps lock detection')
                .addBooleanOption(option =>
                    option
                        .setName('enabled')
                        .setDescription('Enable or disable caps detection')
                        .setRequired(true)
                )
                .addIntegerOption(option =>
                    option
                        .setName('threshold')
                        .setDescription('Percentage of caps to trigger (0-100)')
                        .setMinValue(50)
                        .setMaxValue(100)
                )
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('mentions')
                .setDescription('Configure mention spam detection')
                .addBooleanOption(option =>
                    option
                        .setName('enabled')
                        .setDescription('Enable or disable mention spam detection')
                        .setRequired(true)
                )
                .addIntegerOption(option =>
                    option
                        .setName('threshold')
                        .setDescription('Number of mentions to trigger')
                        .setMinValue(3)
                        .setMaxValue(20)
                )
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('links')
                .setDescription('Configure link filtering')
                .addBooleanOption(option =>
                    option
                        .setName('enabled')
                        .setDescription('Enable or disable link filtering')
                        .setRequired(true)
                )
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('status')
                .setDescription('View current auto-moderation settings')
        ),
    category: 'automod',
    async execute(interaction) {
        if (!interaction.guild) return;

        const subcommand = interaction.options.getSubcommand();

        try {
            if (subcommand === 'status') {
                const response = await apiClient.get(`/guilds/${interaction.guild.id}/automod`);

                interface AutoModRule {
                    name: string;
                    type: string;
                    enabled: boolean;
                    action: string;
                    threshold?: number;
                }
                const responseData = response as { data?: { rules?: AutoModRule[] } };
                const rules = responseData.data?.rules || [];

                const embed = new EmbedBuilder()
                    .setColor('#E74C3C')
                    .setTitle('🛡️ Auto-Moderation Settings')
                    .setDescription('Current auto-moderation configuration:')
                    .addFields(
                        rules.map((rule: any) => ({
                            name: `${rule.enabled ? '✅' : '❌'} ${rule.name}`,
                            value: `Type: ${rule.type}\nAction: ${rule.action}${rule.threshold ? `\nThreshold: ${rule.threshold}` : ''}`,
                            inline: true
                        }))
                    )
                    .setFooter({ text: 'Use /automod <type> to configure' })
                    .setTimestamp();

                await interaction.reply({ embeds: [embed] });
            } else {
                const enabled = interaction.options.getBoolean('enabled', true);
                const threshold = interaction.options.getInteger('threshold');

                await apiClient.post(`/guilds/${interaction.guild.id}/automod/${subcommand}`, {
                    enabled,
                    threshold
                });

                const embed = new EmbedBuilder()
                    .setColor('#2ECC71')
                    .setTitle('✅ Auto-Moderation Updated')
                    .setDescription(`**${subcommand.toUpperCase()}** detection has been **${enabled ? 'enabled' : 'disabled'}**.`)
                    .addFields(
                        threshold ? [{ name: 'Threshold', value: `${threshold}`, inline: true }] : []
                    )
                    .setTimestamp();

                await interaction.reply({ embeds: [embed] });
            }
        } catch (error) {
            await interaction.reply({
                content: 'Failed to update auto-moderation settings!',
                flags: MessageFlags.Ephemeral
            });
        }
    },
};
