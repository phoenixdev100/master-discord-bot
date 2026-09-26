/**
 * Reaction Role Event Handlers
 *
 * Assigns/removes roles when users react to configured messages.
 */

import type { MessageReaction, User, PartialMessageReaction, PartialUser } from 'discord.js';
import type { BotClient } from '../client';
import logger from '../config/logger';
import { apiClient } from '../utils/api-client';

interface ReactionRoleResponse {
    success?: boolean;
    data?: { roleId?: string } | null;
}

function emojiKey(reaction: MessageReaction | PartialMessageReaction): string {
    // Custom emojis stringify as <:name:id>; unicode use their name
    return reaction.emoji.id ? reaction.emoji.toString() : (reaction.emoji.name ?? '');
}

async function lookupRole(
    guildId: string,
    messageId: string,
    emoji: string
): Promise<string | null> {
    try {
        const res = await apiClient.get<ReactionRoleResponse>(
            `/guilds/${guildId}/reactionroles/${messageId}/${encodeURIComponent(emoji)}`
        );
        return res.data?.roleId ?? null;
    } catch {
        return null;
    }
}

export async function handleMessageReactionAdd(
    _client: BotClient,
    reaction: MessageReaction | PartialMessageReaction,
    user: User | PartialUser
): Promise<void> {
    if (user.bot) return;

    try {
        if (reaction.partial) reaction = await reaction.fetch();
        if (user.partial) user = await user.fetch();
        if (!reaction.message.guild) return;

        const roleId = await lookupRole(
            reaction.message.guild.id,
            reaction.message.id,
            emojiKey(reaction)
        );
        if (!roleId) return;

        const member = await reaction.message.guild.members.fetch(user.id).catch(() => null);
        if (!member) return;

        await member.roles.add(roleId, 'Reaction role');
    } catch (error) {
        logger.warn({ error }, 'Failed to assign reaction role');
    }
}

export async function handleMessageReactionRemove(
    _client: BotClient,
    reaction: MessageReaction | PartialMessageReaction,
    user: User | PartialUser
): Promise<void> {
    if (user.bot) return;

    try {
        if (reaction.partial) reaction = await reaction.fetch();
        if (user.partial) user = await user.fetch();
        if (!reaction.message.guild) return;

        const roleId = await lookupRole(
            reaction.message.guild.id,
            reaction.message.id,
            emojiKey(reaction)
        );
        if (!roleId) return;

        const member = await reaction.message.guild.members.fetch(user.id).catch(() => null);
        if (!member) return;

        await member.roles.remove(roleId, 'Reaction role removed');
    } catch (error) {
        logger.warn({ error }, 'Failed to remove reaction role');
    }
}
