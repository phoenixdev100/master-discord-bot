import { SlashCommandBuilder, EmbedBuilder, MessageFlags } from 'discord.js';
import type { Command } from '../../types/command';

export const poll: Command = {
    data: new SlashCommandBuilder()
        .setName('poll')
        .setDescription('Create a poll')
        .addStringOption(option =>
            option
                .setName('question')
                .setDescription('The poll question')
                .setRequired(true)
        )
        .addStringOption(option =>
            option
                .setName('options')
                .setDescription('Poll options separated by | (e.g., Option 1|Option 2|Option 3)')
                .setRequired(true)
        )
        .addIntegerOption(option =>
            option
                .setName('duration')
                .setDescription('Poll duration in minutes (default: no limit)')
                .setMinValue(1)
        ),
    category: 'utility',
    async execute(interaction) {
        const question = interaction.options.getString('question', true);
        const optionsString = interaction.options.getString('options', true);
        const duration = interaction.options.getInteger('duration');

        const options = optionsString.split('|').map(opt => opt.trim()).filter(opt => opt.length > 0);

        if (options.length < 2) {
            await interaction.reply({
                content: '❌ Please provide at least 2 options separated by |',
                flags: MessageFlags.Ephemeral
            });
            return;
        }

        if (options.length > 10) {
            await interaction.reply({
                content: '❌ Maximum 10 options allowed!',
                flags: MessageFlags.Ephemeral
            });
            return;
        }

        const emojis = ['1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣', '🔟'];

        const optionsText = options.map((opt, index) => `${emojis[index]} ${opt}`).join('\n');

        const embed = new EmbedBuilder()
            .setColor('#3498DB')
            .setTitle(`📊 ${question}`)
            .setDescription(optionsText)
            .setFooter({
                text: `Poll by ${interaction.user.tag}${duration ? ` • Ends in ${duration} minutes` : ''}`,
                iconURL: interaction.user.displayAvatarURL()
            })
            .setTimestamp();

        const message = await interaction.reply({ embeds: [embed], fetchReply: true });

        // Add reactions
        for (let i = 0; i < options.length; i++) {
            await message.react(emojis[i]);
        }

        // Auto-end poll if duration is set
        if (duration) {
            setTimeout(async () => {
                try {
                    const fetchedMessage = await message.fetch();
                    const reactions = fetchedMessage.reactions.cache;

                    const results = options.map((opt, index) => {
                        const reaction = reactions.get(emojis[index]);
                        const count = (reaction?.count || 1) - 1; // Subtract bot's reaction
                        return `${emojis[index]} ${opt}: **${count} votes**`;
                    }).join('\n');

                    const resultsEmbed = new EmbedBuilder()
                        .setColor('#2ECC71')
                        .setTitle(`📊 ${question} - Results`)
                        .setDescription(results)
                        .setFooter({ text: `Poll ended • Created by ${interaction.user.tag}` })
                        .setTimestamp();

                    await fetchedMessage.edit({ embeds: [resultsEmbed] });
                } catch (error) {
                    console.error('Failed to end poll:', error);
                }
            }, duration * 60 * 1000);
        }
    },
};
