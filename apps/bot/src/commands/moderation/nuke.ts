import { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits, MessageFlags } from 'discord.js';
import type { Command } from '../../types/command';

export const nuke: Command = {
    data: new SlashCommandBuilder()
        .setName('nuke')
        .setDescription('Delete and recreate the current channel (clears all messages)')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels),
    category: 'moderation',
    async execute(interaction) {
        if (!interaction.channel || !('clone' in interaction.channel)) {
            await interaction.reply({
                content: '❌ This command can only be used in text channels!',
                flags: MessageFlags.Ephemeral
            });
            return;
        }

        await interaction.reply({
            content: '💣 Nuking channel in 3 seconds...',
            flags: MessageFlags.Ephemeral
        });

        setTimeout(async () => {
            try {
                const channel = interaction.channel as any;
                const position = channel.position;

                // Clone the channel
                const newChannel = await channel.clone({
                    reason: `Channel nuked by ${interaction.user.tag}`
                });

                // Set the same position
                await newChannel.setPosition(position);

                // Delete the old channel
                await channel.delete();

                // Send confirmation in new channel
                const embed = new EmbedBuilder()
                    .setColor('#E74C3C')
                    .setTitle('💥 Channel Nuked!')
                    .setDescription('This channel has been completely reset.')
                    .setImage('https://media.giphy.com/media/HhTXt43pk1I1W/giphy.gif')
                    .setFooter({ text: `Nuked by ${interaction.user.tag}` })
                    .setTimestamp();

                await newChannel.send({ embeds: [embed] });
            } catch (error) {
                console.error('Failed to nuke channel:', error);
            }
        }, 3000);
    },
};
