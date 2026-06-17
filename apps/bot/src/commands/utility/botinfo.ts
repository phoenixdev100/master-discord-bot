import { SlashCommandBuilder, EmbedBuilder, version } from 'discord.js';
import type { Command } from '../../types/command';
import os from 'os';

export const botinfo: Command = {
    data: new SlashCommandBuilder()
        .setName('botinfo')
        .setDescription('Get information about the bot'),
    category: 'utility',
    async execute(interaction) {
        const client = interaction.client as any;

        const totalGuilds = client.guilds.cache.size;
        const totalUsers = client.guilds.cache.reduce((acc: number, guild: any) => acc + guild.memberCount, 0);
        const totalChannels = client.channels.cache.size;
        const totalCommands = client.commands?.size || 0;

        const uptime = process.uptime();
        const days = Math.floor(uptime / 86400);
        const hours = Math.floor(uptime / 3600) % 24;
        const minutes = Math.floor(uptime / 60) % 60;
        const seconds = Math.floor(uptime % 60);

        const memoryUsage = process.memoryUsage();
        const memoryUsed = (memoryUsage.heapUsed / 1024 / 1024).toFixed(2);
        const memoryTotal = (memoryUsage.heapTotal / 1024 / 1024).toFixed(2);

        const embed = new EmbedBuilder()
            .setColor('#5865F2')
            .setTitle(`🤖 ${client.user.username} Information`)
            .setThumbnail(client.user.displayAvatarURL({ size: 256 }))
            .addFields(
                { name: '📊 Statistics', value: `**Servers:** ${totalGuilds}\n**Users:** ${totalUsers.toLocaleString()}\n**Channels:** ${totalChannels}\n**Commands:** ${totalCommands}`, inline: true },
                { name: '⏱️ Uptime', value: `${days}d ${hours}h ${minutes}m ${seconds}s`, inline: true },
                { name: '💾 Memory', value: `${memoryUsed}MB / ${memoryTotal}MB`, inline: true },
                { name: '🔧 System', value: `**Node.js:** ${process.version}\n**Discord.js:** v${version}\n**Platform:** ${os.platform()}\n**CPU:** ${os.cpus()[0].model}`, inline: false },
                { name: '🏓 Ping', value: `**WebSocket:** ${client.ws.ping}ms\n**API:** Calculating...`, inline: true },
                { name: '📅 Created', value: `<t:${Math.floor(client.user.createdTimestamp / 1000)}:R>`, inline: true }
            )
            .setFooter({ text: `Requested by ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL() })
            .setTimestamp();

        const sent = await interaction.reply({ embeds: [embed], fetchReply: true });

        // Update with actual API latency
        const apiLatency = sent.createdTimestamp - interaction.createdTimestamp;
        embed.data.fields![4].value = `**WebSocket:** ${client.ws.ping}ms\n**API:** ${apiLatency}ms`;

        await interaction.editReply({ embeds: [embed] });
    },
};
