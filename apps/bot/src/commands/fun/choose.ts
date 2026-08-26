import { SlashCommandBuilder, EmbedBuilder, MessageFlags } from 'discord.js';
import type { Command } from '../../types/command';

export const choose: Command = {
    data: new SlashCommandBuilder()
        .setName('choose')
        .setDescription('Choose between multiple options')
        .addStringOption(option =>
            option
                .setName('options')
                .setDescription('Options separated by | (e.g., Pizza|Burger|Sushi)')
                .setRequired(true)
        ),
    category: 'fun',
    async execute(interaction) {
        const optionsString = interaction.options.getString('options', true);
        const options = optionsString.split('|').map(opt => opt.trim()).filter(opt => opt.length > 0);

        if (options.length < 2) {
            await interaction.reply({
                content: '❌ Please provide at least 2 options separated by |',
                flags: MessageFlags.Ephemeral
            });
            return;
        }

        const chosen = options[Math.floor(Math.random() * options.length)];

        const embed = new EmbedBuilder()
            .setColor('#9B59B6')
            .setTitle('🎲 Choice Made!')
            .setDescription(`I choose: **${chosen}**`)
            .addFields({ name: 'Options', value: options.join(', ') })
            .setFooter({ text: `Requested by ${interaction.user.tag}` })
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    },
};
