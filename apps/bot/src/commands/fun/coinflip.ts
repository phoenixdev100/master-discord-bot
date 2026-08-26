import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import type { Command } from '../../types/command';

export const coinflip: Command = {
    data: new SlashCommandBuilder()
        .setName('coinflip')
        .setDescription('Flip a coin'),
    category: 'fun',
    async execute(interaction) {
        const result = Math.random() < 0.5 ? 'Heads' : 'Tails';
        const emoji = result === 'Heads' ? '🪙' : '💿';

        const embed = new EmbedBuilder()
            .setColor(result === 'Heads' ? '#FFD700' : '#C0C0C0')
            .setTitle(`${emoji} Coin Flip`)
            .setDescription(`The coin landed on: **${result}**!`)
            .setFooter({ text: `Flipped by ${interaction.user.tag}` })
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    },
};
