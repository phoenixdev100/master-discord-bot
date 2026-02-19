/**
 * Permission Cache
 * 
 * Redis-based caching layer for permission data to reduce database queries.
 */

import type { Redis } from 'ioredis';
import type { CachedPermissions, RoleWithPermissions, UserPermission } from './types';

export interface PermissionCacheConfig {
    ttl: number; // Time to live in seconds
    prefix: string; // Redis key prefix
}

export class PermissionCache {
    private redis: Redis;
    private config: PermissionCacheConfig;

    constructor(redis: Redis, config?: Partial<PermissionCacheConfig>) {
        this.redis = redis;
        this.config = {
            ttl: config?.ttl ?? 300, // Default 5 minutes
            prefix: config?.prefix ?? 'perm:',
        };
    }

    /**
     * Get cache key for user permissions
     */
    private getCacheKey(userId: string, guildId: string): string {
        return `${this.config.prefix}${guildId}:${userId}`;
    }

    /**
     * Get cached permissions for a user
     */
    async get(userId: string, guildId: string): Promise<CachedPermissions | null> {
        try {
            const key = this.getCacheKey(userId, guildId);
            const cached = await this.redis.get(key);

            if (!cached) {
                return null;
            }

            const data = JSON.parse(cached) as CachedPermissions;

            // Check if cache is expired
            if (Date.now() > data.expiresAt) {
                await this.invalidate(userId, guildId);
                return null;
            }

            return data;
        } catch (error) {
            console.error('Failed to get cached permissions:', error);
            return null;
        }
    }

    /**
     * Set cached permissions for a user
     */
    async set(
        userId: string,
        guildId: string,
        roles: RoleWithPermissions[],
        overrides: UserPermission[],
        isSuperAdmin: boolean,
        isGuildOwner: boolean
    ): Promise<void> {
        try {
            const key = this.getCacheKey(userId, guildId);
            const now = Date.now();

            const data: CachedPermissions = {
                userId,
                guildId,
                roles,
                overrides,
                isSuperAdmin,
                isGuildOwner,
                cachedAt: now,
                expiresAt: now + this.config.ttl * 1000,
            };

            await this.redis.setex(
                key,
                this.config.ttl,
                JSON.stringify(data)
            );
        } catch (error) {
            console.error('Failed to cache permissions:', error);
        }
    }

    /**
     * Invalidate cached permissions for a user
     */
    async invalidate(userId: string, guildId: string): Promise<void> {
        try {
            const key = this.getCacheKey(userId, guildId);
            await this.redis.del(key);
        } catch (error) {
            console.error('Failed to invalidate permission cache:', error);
        }
    }

    /**
     * Invalidate all cached permissions for a guild
     */
    async invalidateGuild(guildId: string): Promise<void> {
        try {
            const pattern = `${this.config.prefix}${guildId}:*`;
            const keys = await this.redis.keys(pattern);

            if (keys.length > 0) {
                await this.redis.del(...keys);
            }
        } catch (error) {
            console.error('Failed to invalidate guild permission cache:', error);
        }
    }

    /**
     * Invalidate all cached permissions for a user across all guilds
     */
    async invalidateUser(userId: string): Promise<void> {
        try {
            const pattern = `${this.config.prefix}*:${userId}`;
            const keys = await this.redis.keys(pattern);

            if (keys.length > 0) {
                await this.redis.del(...keys);
            }
        } catch (error) {
            console.error('Failed to invalidate user permission cache:', error);
        }
    }

    /**
     * Clear all permission cache
     */
    async clear(): Promise<void> {
        try {
            const pattern = `${this.config.prefix}*`;
            const keys = await this.redis.keys(pattern);

            if (keys.length > 0) {
                await this.redis.del(...keys);
            }
        } catch (error) {
            console.error('Failed to clear permission cache:', error);
        }
    }

    /**
     * Get cache statistics
     */
    async getStats(): Promise<{
        totalKeys: number;
        memoryUsage: string;
    }> {
        try {
            const pattern = `${this.config.prefix}*`;
            const keys = await this.redis.keys(pattern);

            // Get approximate memory usage
            let memoryUsage = 0;
            for (const key of keys.slice(0, 100)) { // Sample first 100 keys
                const size = await this.redis.memory('USAGE', key);
                if (size) memoryUsage += size;
            }

            return {
                totalKeys: keys.length,
                memoryUsage: `${(memoryUsage / 1024).toFixed(2)} KB`,
            };
        } catch (error) {
            console.error('Failed to get cache stats:', error);
            return {
                totalKeys: 0,
                memoryUsage: '0 KB',
            };
        }
    }
}
