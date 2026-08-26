import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import type { Command } from '../../types/command';

export const roll: Command = {
    data: new SlashCommandBuilder()
        .setName('roll')
        .setDescription('Roll dice')
        .addIntegerOption(option =>
            option
                .setName('sides')
                .setDescription('Number of sides on the die (default: 6)')
                .setMinValue(2)
                .setMaxValue(100)
        )
        .addIntegerOption(option =>
            option
                .setName('count')
                .setDescription('Number of dice to roll (default: 1)')
                .setMinValue(1)
                .setMaxValue(10)
        ),
    category: 'fun',
    async execute(interaction) {
        const sides = interaction.options.getInteger('sides') || 6;
        const count = interaction.options.getInteger('count') || 1;

        const rolls: number[] = [];
        for (let i = 0; i < count; i++) {
            rolls.push(Math.floor(Math.random() * sides) + 1);
        }

        const total = rolls.reduce((sum, roll) => sum + roll, 0);
        const rollsText = rolls.join(', ');

        const embed = new EmbedBuilder()
            .setColor('#E74C3C')
            .setTitle('🎲 Dice Roll')
            .addFields(
                { name: 'Dice', value: `${count}d${sides}`, inline: true },
                { name: 'Rolls', value: rollsText, inline: true },
                { name: 'Total', value: `${total}`, inline: true }
            )
            .setFooter({ text: `Rolled by ${interaction.user.tag}` })
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    },
};
