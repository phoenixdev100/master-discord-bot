import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import type { Command } from '../../types/command';

export const eightball: Command = {
    data: new SlashCommandBuilder()
        .setName('8ball')
        .setDescription('Ask the magic 8-ball a question')
        .addStringOption(option =>
            option
                .setName('question')
                .setDescription('Your yes/no question')
                .setRequired(true)
        ),
    category: 'fun',
    async execute(interaction) {
        const question = interaction.options.getString('question', true);

        const responses = [
            // Positive
            '🟢 It is certain.',
            '🟢 It is decidedly so.',
            '🟢 Without a doubt.',
            '🟢 Yes definitely.',
            '🟢 You may rely on it.',
            '🟢 As I see it, yes.',
            '🟢 Most likely.',
            '🟢 Outlook good.',
            '🟢 Yes.',
            '🟢 Signs point to yes.',
            // Neutral
            '🟡 Reply hazy, try again.',
            '🟡 Ask again later.',
            '🟡 Better not tell you now.',
            '🟡 Cannot predict now.',
            '🟡 Concentrate and ask again.',
            // Negative
            '🔴 Don\'t count on it.',
            '🔴 My reply is no.',
            '🔴 My sources say no.',
            '🔴 Outlook not so good.',
            '🔴 Very doubtful.',
        ];

        const answer = responses[Math.floor(Math.random() * responses.length)];

        const embed = new EmbedBuilder()
            .setColor('#9B59B6')
            .setTitle('🎱 Magic 8-Ball')
            .addFields(
                { name: '❓ Question', value: question },
                { name: '💬 Answer', value: answer }
            )
            .setFooter({ text: `Asked by ${interaction.user.tag}` })
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    },
};
