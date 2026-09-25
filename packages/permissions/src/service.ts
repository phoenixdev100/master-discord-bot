/**
 * Permission Service
 * 
 * High-level service for permission management with database integration and caching.
 */

import type { PrismaClient } from '@discord-platform/database';
import type { Redis } from 'ioredis';
import type {
    PermissionContext,
    PermissionCheckResult,
    CachedPermissions,
    RoleWithPermissions,
    UserPermission,
} from './types';
import { PermissionChecker } from './checker';
import { PermissionCache } from './cache';
import { PermissionEffect } from './types';

export class PermissionService {
    private prisma: PrismaClient;
    private cache: PermissionCache;
    private superAdminId: string;

    constructor(prisma: PrismaClient, redis: Redis, superAdminId: string) {
        this.prisma = prisma;
        this.cache = new PermissionCache(redis);
        this.superAdminId = superAdminId;
    }

    /**
     * Check if a user has permission to perform an action
     */
    async hasPermission(context: PermissionContext): Promise<PermissionCheckResult> {
        const { userId, guildId } = context;

        if (!guildId) {
            throw new Error('Guild ID is required for permission checks');
        }

        // Get or load cached permissions
        const cachedPermissions = await this.getPermissions(userId, guildId);

        // Perform permission check
        return PermissionChecker.check(context, cachedPermissions);
    }

    /**
     * Check if user has all specified permissions
     */
    async hasAllPermissions(
        userId: string,
        guildId: string,
        permissions: string[]
    ): Promise<PermissionCheckResult> {
        const cachedPermissions = await this.getPermissions(userId, guildId);
        return PermissionChecker.checkAll(permissions, cachedPermissions, guildId);
    }

    /**
     * Check if user has any of the specified permissions
     */
    async hasAnyPermission(
        userId: string,
        guildId: string,
        permissions: string[]
    ): Promise<PermissionCheckResult> {
        const cachedPermissions = await this.getPermissions(userId, guildId);
        return PermissionChecker.checkAny(permissions, cachedPermissions, guildId);
    }

    /**
     * Get all effective permissions for a user
     */
    async getEffectivePermissions(
        userId: string,
        guildId: string
    ): Promise<string[]> {
        const cachedPermissions = await this.getPermissions(userId, guildId);
        return PermissionChecker.getEffectivePermissions(cachedPermissions);
    }

    /**
     * Get or load cached permissions for a user
     */
    private async getPermissions(
        userId: string,
        guildId: string
    ): Promise<CachedPermissions> {
        // Try to get from cache
        const cached = await this.cache.get(userId, guildId);
        if (cached) {
            return cached;
        }

        // Load from database
        return this.loadPermissions(userId, guildId);
    }

    /**
     * Load permissions from database and cache them
     */
    private async loadPermissions(
        userId: string,
        guildId: string
    ): Promise<CachedPermissions> {
        // Check if user is Super Admin
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            select: { isSuperAdmin: true },
        });

        const isSuperAdmin = user?.isSuperAdmin || userId === this.superAdminId;

        // Check if user is Guild Owner
        const guild = await this.prisma.guild.findUnique({
            where: { id: guildId },
            select: { ownerId: true },
        });

        const isGuildOwner = guild?.ownerId === userId;

        // Get user's guild membership
        await this.prisma.guildUser.findUnique({
            where: {
                guildId_userId: {
                    guildId,
                    userId,
                },
            },
        });

        // Get roles with permissions
        const roleAssignments = await this.prisma.roleAssignment.findMany({
            where: {
                userId,
                guildId,
            },
            include: {
                role: true,
            },
        });

        const roles: RoleWithPermissions[] = roleAssignments.map((assignment) => ({
            id: assignment.role.id,
            name: assignment.role.name,
            permissions: assignment.role.permissions as string[],
            position: assignment.role.position,
        }));

        // Get user-specific permission overrides
        const permissionOverrides = await this.prisma.permission.findMany({
            where: {
                guildId,
                userId,
            },
        });

        const overrides: UserPermission[] = permissionOverrides.map((p) => ({
            resource: p.resource,
            action: p.action,
            effect: p.effect as PermissionEffect,
            conditions: p.conditions as Record<string, unknown> | undefined,
        }));

        // Cache the permissions
        await this.cache.set(
            userId,
            guildId,
            roles,
            overrides,
            isSuperAdmin,
            isGuildOwner
        );

        return {
            userId,
            guildId,
            roles,
            overrides,
            isSuperAdmin,
            isGuildOwner,
            cachedAt: Date.now(),
            expiresAt: Date.now() + 300000, // 5 minutes
        };
    }

    /**
     * Invalidate cached permissions for a user
     */
    async invalidateUserPermissions(userId: string, guildId: string): Promise<void> {
        await this.cache.invalidate(userId, guildId);
    }

    /**
     * Invalidate all cached permissions for a guild
     */
    async invalidateGuildPermissions(guildId: string): Promise<void> {
        await this.cache.invalidateGuild(guildId);
    }

    /**
     * Grant permission to a user
     */
    async grantPermission(
        guildId: string,
        userId: string,
        resource: string,
        action: string,
        conditions?: Record<string, unknown>
    ): Promise<void> {
        await this.prisma.permission.upsert({
            where: {
                guildId_userId_resource_action: {
                    guildId,
                    userId,
                    resource,
                    action,
                },
            },
            create: {
                guildId,
                userId,
                resource,
                action,
                effect: PermissionEffect.ALLOW,
                conditions: conditions as any,
            },
            update: {
                effect: PermissionEffect.ALLOW,
                conditions: conditions as any,
            },
        });

        // Invalidate cache
        await this.invalidateUserPermissions(userId, guildId);
    }

    /**
     * Revoke permission from a user
     */
    async revokePermission(
        guildId: string,
        userId: string,
        resource: string,
        action: string
    ): Promise<void> {
        await this.prisma.permission.delete({
            where: {
                guildId_userId_resource_action: {
                    guildId,
                    userId,
                    resource,
                    action,
                },
            },
        });

        // Invalidate cache
        await this.invalidateUserPermissions(userId, guildId);
    }

    /**
     * Deny permission for a user (explicit deny)
     */
    async denyPermission(
        guildId: string,
        userId: string,
        resource: string,
        action: string,
        conditions?: Record<string, unknown>
    ): Promise<void> {
        await this.prisma.permission.upsert({
            where: {
                guildId_userId_resource_action: {
                    guildId,
                    userId,
                    resource,
                    action,
                },
            },
            create: {
                guildId,
                userId,
                resource,
                action,
                effect: PermissionEffect.DENY,
                conditions: conditions as any,
            },
            update: {
                effect: PermissionEffect.DENY,
                conditions: conditions as any,
            },
        });

        // Invalidate cache
        await this.invalidateUserPermissions(userId, guildId);
    }

    /**
     * Check if a user is Super Admin
     */
    async isSuperAdmin(userId: string): Promise<boolean> {
        if (userId === this.superAdminId) {
            return true;
        }

        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            select: { isSuperAdmin: true },
        });

        return user?.isSuperAdmin ?? false;
    }

    /**
     * Check if a user is a guild owner
     */
    async isGuildOwner(userId: string, guildId: string): Promise<boolean> {
        const guild = await this.prisma.guild.findUnique({
            where: { id: guildId },
            select: { ownerId: true },
        });

        return guild?.ownerId === userId;
    }
}
