/**
 * Permission Checker
 * 
 * Core permission checking logic with role hierarchy, overrides, and caching.
 */

import type {
    PermissionContext,
    PermissionCheckResult,
    PermissionEvaluation,
    RoleWithPermissions,
    UserPermission,
    CachedPermissions,
} from './types';
import {
    PermissionEffect,
    matchesPermissionPattern,
    PermissionWildcards,
} from './types';

export class PermissionChecker {
    /**
     * Check if a user has permission to perform an action
     */
    static async check(
        context: PermissionContext,
        cachedPermissions: CachedPermissions
    ): Promise<PermissionCheckResult> {
        const { resource, action } = context;
        const fullPermission = `${resource}.${action}`;

        // 1. Super Admin bypass - ALWAYS allowed
        if (cachedPermissions.isSuperAdmin) {
            return {
                allowed: true,
                bypassedBy: 'super_admin',
                reason: 'Super Admin has unrestricted access',
            };
        }

        // 2. Guild Owner bypass - allowed for guild-level operations
        if (cachedPermissions.isGuildOwner && context.guildId) {
            return {
                allowed: true,
                bypassedBy: 'guild_owner',
                reason: 'Guild Owner has full access to their server',
            };
        }

        // 3. Check user-specific permission overrides (highest priority)
        const overrideResult = this.checkOverrides(
            fullPermission,
            cachedPermissions.overrides
        );
        if (overrideResult.granted !== undefined) {
            return {
                allowed: overrideResult.granted,
                reason: overrideResult.granted
                    ? `Explicitly allowed by permission override`
                    : `Explicitly denied by permission override`,
            };
        }

        // 4. Check role-based permissions
        const roleResult = this.checkRolePermissions(
            fullPermission,
            cachedPermissions.roles
        );
        if (roleResult.granted) {
            return {
                allowed: true,
                reason: `Granted by role: ${roleResult.matchedRole}`,
            };
        }

        // 5. Default deny
        return {
            allowed: false,
            reason: 'No matching permission found',
        };
    }

    /**
     * Check user-specific permission overrides
     */
    private static checkOverrides(
        permission: string,
        overrides: UserPermission[]
    ): { granted?: boolean; matchedPermission?: string } {
        // Check for explicit deny first (deny takes precedence)
        const denyOverride = overrides.find(
            (override) =>
                override.effect === PermissionEffect.DENY &&
                matchesPermissionPattern(permission, override.resource)
        );

        if (denyOverride) {
            return { granted: false, matchedPermission: denyOverride.resource };
        }

        // Check for explicit allow
        const allowOverride = overrides.find(
            (override) =>
                override.effect === PermissionEffect.ALLOW &&
                matchesPermissionPattern(permission, override.resource)
        );

        if (allowOverride) {
            return { granted: true, matchedPermission: allowOverride.resource };
        }

        // No override found
        return {};
    }

    /**
     * Check role-based permissions with hierarchy
     */
    private static checkRolePermissions(
        permission: string,
        roles: RoleWithPermissions[]
    ): { granted: boolean; matchedRole?: string; matchedPermission?: string } {
        // Sort roles by position (highest first) for proper hierarchy
        const sortedRoles = [...roles].sort((a, b) => b.position - a.position);

        for (const role of sortedRoles) {
            // Check if role has wildcard permission
            if (role.permissions.includes(PermissionWildcards.ALL)) {
                return {
                    granted: true,
                    matchedRole: role.name,
                    matchedPermission: PermissionWildcards.ALL,
                };
            }

            // Check for matching permission (supports wildcards)
            const matchedPermission = role.permissions.find((rolePermission) =>
                matchesPermissionPattern(permission, rolePermission)
            );

            if (matchedPermission) {
                return {
                    granted: true,
                    matchedRole: role.name,
                    matchedPermission,
                };
            }
        }

        return { granted: false };
    }

    /**
     * Check multiple permissions at once (all must be granted)
     */
    static async checkAll(
        permissions: string[],
        cachedPermissions: CachedPermissions,
        guildId?: string
    ): Promise<PermissionCheckResult> {
        for (const permission of permissions) {
            const [resource, action] = permission.split('.');
            const result = await this.check(
                {
                    userId: cachedPermissions.userId,
                    guildId,
                    resource,
                    action: action as any,
                },
                cachedPermissions
            );

            if (!result.allowed) {
                return result;
            }
        }

        return { allowed: true, reason: 'All permissions granted' };
    }

    /**
     * Check if user has any of the specified permissions
     */
    static async checkAny(
        permissions: string[],
        cachedPermissions: CachedPermissions,
        guildId?: string
    ): Promise<PermissionCheckResult> {
        // Super Admin or Guild Owner bypass
        if (cachedPermissions.isSuperAdmin) {
            return {
                allowed: true,
                bypassedBy: 'super_admin',
            };
        }

        if (cachedPermissions.isGuildOwner && guildId) {
            return {
                allowed: true,
                bypassedBy: 'guild_owner',
            };
        }

        for (const permission of permissions) {
            const [resource, action] = permission.split('.');
            const result = await this.check(
                {
                    userId: cachedPermissions.userId,
                    guildId,
                    resource,
                    action: action as any,
                },
                cachedPermissions
            );

            if (result.allowed) {
                return result;
            }
        }

        return {
            allowed: false,
            reason: 'None of the required permissions are granted',
        };
    }

    /**
     * Get all effective permissions for a user
     */
    static getEffectivePermissions(
        cachedPermissions: CachedPermissions
    ): string[] {
        // Super Admin has all permissions
        if (cachedPermissions.isSuperAdmin) {
            return [PermissionWildcards.ALL];
        }

        const permissions = new Set<string>();

        // Add permissions from all roles
        for (const role of cachedPermissions.roles) {
            for (const permission of role.permissions) {
                permissions.add(permission);
            }
        }

        // Apply overrides
        for (const override of cachedPermissions.overrides) {
            if (override.effect === PermissionEffect.ALLOW) {
                permissions.add(override.resource);
            } else if (override.effect === PermissionEffect.DENY) {
                permissions.delete(override.resource);
            }
        }

        return Array.from(permissions);
    }

    /**
     * Evaluate permission with detailed result
     */
    static evaluate(
        permission: string,
        cachedPermissions: CachedPermissions
    ): PermissionEvaluation {
        // Super Admin
        if (cachedPermissions.isSuperAdmin) {
            return {
                granted: true,
                source: 'super_admin',
            };
        }

        // Guild Owner
        if (cachedPermissions.isGuildOwner) {
            return {
                granted: true,
                source: 'guild_owner',
            };
        }

        // Check overrides
        const overrideResult = this.checkOverrides(
            permission,
            cachedPermissions.overrides
        );
        if (overrideResult.granted === true) {
            return {
                granted: true,
                source: 'override',
                matchedPermission: overrideResult.matchedPermission,
            };
        }
        if (overrideResult.granted === false) {
            return {
                granted: false,
                source: 'denied',
                matchedPermission: overrideResult.matchedPermission,
            };
        }

        // Check roles
        const roleResult = this.checkRolePermissions(
            permission,
            cachedPermissions.roles
        );
        if (roleResult.granted) {
            return {
                granted: true,
                source: 'role',
                matchedPermission: roleResult.matchedPermission,
                matchedRole: roleResult.matchedRole,
            };
        }

        // Denied
        return {
            granted: false,
            source: 'denied',
        };
    }
}
