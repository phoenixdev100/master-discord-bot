/**
 * Admin Role Helper
 *
 * Fetches the guild's dashboard-assigned admin role from the API
 * with a short-lived cache. Members holding this role may use
 * commands gated by `requiredPermission`.
 */

import { apiClient } from './api-client';

const CACHE_TTL_MS = 60_000;
const cache = new Map<string, { roleId: string | null; at: number }>();

export async function getAdminRoleId(guildId: string): Promise<string | null> {
    const cached = cache.get(guildId);
    if (cached && Date.now() - cached.at < CACHE_TTL_MS) {
        return cached.roleId;
    }

    try {
        const res = await apiClient.get<{ data: { adminRoleId: string | null } }>(
            `/guilds/${guildId}/admin-role`
        );
        const roleId = res.data?.adminRoleId ?? null;
        cache.set(guildId, { roleId, at: Date.now() });
        return roleId;
    } catch {
        // API unreachable → serve last known value (or none)
        return cached?.roleId ?? null;
    }
}
