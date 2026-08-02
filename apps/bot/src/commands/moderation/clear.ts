import { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits, MessageFlags } from 'discord.js';
import type { Command } from '../../types/command';

export const clear: Command = {
    data: new SlashCommandBuilder()
        .setName('clear')
        .setDescription('Clear messages from the channel')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
        .addIntegerOption(option =>
            option
                .setName('amount')
                .setDescription('Number of messages to delete (1-100)')
                .setRequired(true)
                .setMinValue(1)
                .setMaxValue(100)
        )
        .addUserOption(option =>
            option
                .setName('user')
                .setDescription('Only delete messages from this user')
        ),
    category: 'moderation',
    async execute(interaction) {
        if (!interaction.channel || !interaction.channel.isTextBased()) {
            await interaction.reply({ content: 'This command can only be used in text channels!', flags: MessageFlags.Ephemeral });
            return;
        }

        const amount = interaction.options.getInteger('amount', true);
        const targetUser = interaction.options.getUser('user');

        await interaction.deferReply({ flags: MessageFlags.Ephemeral });

        try {
            const messages = await interaction.channel.messages.fetch({ limit: 100 });

            let messagesToDelete = messages.filter(msg => {
                const isRecent = Date.now() - msg.createdTimestamp < 14 * 24 * 60 * 60 * 1000; // 14 days
                if (!isRecent) return false;
                if (targetUser) return msg.author.id === targetUser.id;
                return true;
            });

            // Take only the requested amount
            const messagesToDeleteArray = Array.from(messagesToDelete.values()).slice(0, amount);

            if ('bulkDelete' in interaction.channel) {
                await interaction.channel.bulkDelete(messagesToDeleteArray, true);
            }

            const embed = new EmbedBuilder()
                .setColor('#2ECC71')
                .setTitle('🧹 Messages Cleared')
                .setDescription(`Successfully deleted **${messagesToDeleteArray.length}** message(s)${targetUser ? ` from ${targetUser}` : ''}.`)
                .setFooter({ text: `Cleared by ${interaction.user.tag}` })
                .setTimestamp();

            await interaction.editReply({ embeds: [embed] });
        } catch (error) {
            await interaction.editReply({
                content: 'Failed to delete messages. Make sure I have the Manage Messages permission!'
            });
        }
    },
};
