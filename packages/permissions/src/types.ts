/**
 * Permission Types and Constants
 * 
 * Defines all permission-related types, enums, and constants used throughout the platform.
 */

/**
 * Permission effect - whether to allow or deny access
 */
export enum PermissionEffect {
    ALLOW = 'allow',
    DENY = 'deny',
}

/**
 * Permission action types
 */
export enum PermissionAction {
    READ = 'read',
    WRITE = 'write',
    EXECUTE = 'execute',
    DELETE = 'delete',
    MANAGE = 'manage',
}

/**
 * Permission resources - organized by module
 */
export const PermissionResources = {
    // System-level permissions
    SYSTEM: {
        MANAGE: 'system.manage',
        VIEW_LOGS: 'system.view_logs',
        CONFIGURE: 'system.configure',
    },

    // Module management
    MODULES: {
        VIEW: 'modules.view',
        ENABLE: 'modules.enable',
        DISABLE: 'modules.disable',
        CONFIGURE: 'modules.configure',
    },

    // Guild management
    GUILD: {
        VIEW: 'guild.view',
        MANAGE: 'guild.manage',
        SETTINGS: 'guild.settings',
        DELETE: 'guild.delete',
    },

    // User management
    USERS: {
        VIEW: 'users.view',
        MANAGE: 'users.manage',
        BAN: 'users.ban',
        KICK: 'users.kick',
    },

    // Role management
    ROLES: {
        VIEW: 'roles.view',
        CREATE: 'roles.create',
        EDIT: 'roles.edit',
        DELETE: 'roles.delete',
        ASSIGN: 'roles.assign',
    },

    // Moderation
    MODERATION: {
        VIEW_CASES: 'moderation.view_cases',
        CREATE_CASE: 'moderation.create_case',
        EDIT_CASE: 'moderation.edit_case',
        DELETE_CASE: 'moderation.delete_case',
        BAN: 'moderation.ban',
        KICK: 'moderation.kick',
        MUTE: 'moderation.mute',
        WARN: 'moderation.warn',
        AUTOMOD: 'moderation.automod',
    },

    // Leveling
    LEVELING: {
        VIEW: 'leveling.view',
        MANAGE: 'leveling.manage',
        CONFIGURE: 'leveling.configure',
        RESET: 'leveling.reset',
    },

    // Economy
    ECONOMY: {
        VIEW: 'economy.view',
        MANAGE: 'economy.manage',
        CONFIGURE: 'economy.configure',
        ADD_BALANCE: 'economy.add_balance',
        REMOVE_BALANCE: 'economy.remove_balance',
    },

    // Tickets
    TICKETS: {
        VIEW: 'tickets.view',
        CREATE: 'tickets.create',
        CLOSE: 'tickets.close',
        MANAGE: 'tickets.manage',
    },

    // Custom Commands
    COMMANDS: {
        VIEW: 'commands.view',
        CREATE: 'commands.create',
        EDIT: 'commands.edit',
        DELETE: 'commands.delete',
    },

    // Audit Logs
    AUDIT: {
        VIEW: 'audit.view',
        EXPORT: 'audit.export',
    },
} as const;

/**
 * Flatten permission resources for easier access
 */
export const AllPermissions = Object.values(PermissionResources).flatMap(
    (category) => Object.values(category)
);

/**
 * Permission check result
 */
export interface PermissionCheckResult {
    allowed: boolean;
    reason?: string;
    bypassedBy?: 'super_admin' | 'guild_owner';
}

/**
 * Permission context for checking permissions
 */
export interface PermissionContext {
    userId: string;
    guildId?: string;
    resource: string;
    action: PermissionAction;
    metadata?: Record<string, unknown>;
}

/**
 * Role with permissions
 */
export interface RoleWithPermissions {
    id: string;
    name: string;
    permissions: string[];
    position: number;
}

/**
 * User permission override
 */
export interface UserPermission {
    resource: string;
    action: string;
    effect: PermissionEffect;
    conditions?: Record<string, unknown>;
}

/**
 * Cached permission data
 */
export interface CachedPermissions {
    userId: string;
    guildId: string;
    roles: RoleWithPermissions[];
    overrides: UserPermission[];
    isSuperAdmin: boolean;
    isGuildOwner: boolean;
    cachedAt: number;
    expiresAt: number;
}

/**
 * Permission evaluation result
 */
export interface PermissionEvaluation {
    granted: boolean;
    source: 'super_admin' | 'guild_owner' | 'role' | 'override' | 'denied';
    matchedPermission?: string;
    matchedRole?: string;
}

/**
 * Default role permissions by type
 */
export const DefaultRolePermissions = {
    ADMIN: [
        PermissionResources.GUILD.VIEW,
        PermissionResources.GUILD.MANAGE,
        PermissionResources.GUILD.SETTINGS,
        PermissionResources.MODULES.VIEW,
        PermissionResources.MODULES.ENABLE,
        PermissionResources.MODULES.DISABLE,
        PermissionResources.MODULES.CONFIGURE,
        PermissionResources.USERS.VIEW,
        PermissionResources.USERS.MANAGE,
        PermissionResources.ROLES.VIEW,
        PermissionResources.ROLES.CREATE,
        PermissionResources.ROLES.EDIT,
        PermissionResources.ROLES.ASSIGN,
        PermissionResources.MODERATION.VIEW_CASES,
        PermissionResources.MODERATION.CREATE_CASE,
        PermissionResources.MODERATION.BAN,
        PermissionResources.MODERATION.KICK,
        PermissionResources.MODERATION.MUTE,
        PermissionResources.MODERATION.WARN,
        PermissionResources.AUDIT.VIEW,
    ],

    MODERATOR: [
        PermissionResources.GUILD.VIEW,
        PermissionResources.USERS.VIEW,
        PermissionResources.MODERATION.VIEW_CASES,
        PermissionResources.MODERATION.CREATE_CASE,
        PermissionResources.MODERATION.KICK,
        PermissionResources.MODERATION.MUTE,
        PermissionResources.MODERATION.WARN,
        PermissionResources.TICKETS.VIEW,
        PermissionResources.TICKETS.MANAGE,
    ],

    HELPER: [
        PermissionResources.GUILD.VIEW,
        PermissionResources.USERS.VIEW,
        PermissionResources.MODERATION.VIEW_CASES,
        PermissionResources.TICKETS.VIEW,
        PermissionResources.TICKETS.CREATE,
        PermissionResources.TICKETS.CLOSE,
    ],

    MEMBER: [
        PermissionResources.GUILD.VIEW,
        PermissionResources.LEVELING.VIEW,
        PermissionResources.ECONOMY.VIEW,
        PermissionResources.TICKETS.CREATE,
    ],
} as const;

/**
 * Permission wildcards for pattern matching
 */
export const PermissionWildcards = {
    ALL: '*',
    MODULE_ALL: (module: string) => `${module}.*`,
    ACTION_ALL: (resource: string) => `${resource}.*`,
} as const;

/**
 * Check if a permission matches a pattern (supports wildcards)
 */
export function matchesPermissionPattern(
    permission: string,
    pattern: string
): boolean {
    // Exact match
    if (permission === pattern) return true;

    // Wildcard match
    if (pattern === PermissionWildcards.ALL) return true;

    // Module wildcard (e.g., "moderation.*" matches "moderation.ban")
    if (pattern.endsWith('.*')) {
        const prefix = pattern.slice(0, -2);
        return permission.startsWith(prefix + '.');
    }

    return false;
}

/**
 * Validate permission string format
 */
export function isValidPermission(permission: string): boolean {
    // Permission format: module.action or module.submodule.action
    const permissionRegex = /^[a-z_]+(\.[a-z_]+)+$/;
    return permissionRegex.test(permission);
}

/**
 * Get permission category from permission string
 */
export function getPermissionCategory(permission: string): string {
    return permission.split('.')[0];
}

/**
 * Get permission action from permission string
 */
export function getPermissionAction(permission: string): string {
    const parts = permission.split('.');
    return parts[parts.length - 1];
}
