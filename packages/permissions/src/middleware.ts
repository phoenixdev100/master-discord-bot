/**
 * Permission Middleware
 * 
 * Middleware functions for enforcing permissions in API routes.
 */

import type { FastifyRequest, FastifyReply } from 'fastify';
import type { PermissionService } from './service';
import type { PermissionAction } from './types';

/**
 * User context attached to request after authentication
 */
export interface AuthenticatedUser {
    id: string;
    username: string;
    isSuperAdmin?: boolean;
}

/**
 * Extended request with user context
 */
export interface AuthenticatedRequest<
    Params = { guildId?: string },
    Body = { guildId?: string },
    Query = { guildId?: string }
> extends FastifyRequest<{
    Params: Params;
    Body: Body;
    Querystring: Query;
}> {
    user: AuthenticatedUser;
}

/**
 * Permission requirement configuration
 */
export interface PermissionRequirement {
    resource: string;
    action: PermissionAction;
    requireAll?: boolean; // If true, user must have all permissions
}

/**
 * Create permission middleware
 */
export function createPermissionMiddleware(permissionService: PermissionService) {
    /**
     * Require specific permission(s)
     */
    return function requirePermission(
        requirements: PermissionRequirement | PermissionRequirement[]
    ) {
        return async (request: AuthenticatedRequest, reply: FastifyReply) => {
            const user = request.user;

            if (!user) {
                return reply.status(401).send({
                    error: 'Unauthorized',
                    message: 'Authentication required',
                });
            }

            // Get guild ID from params or body
            const guildId =
                request.params.guildId ||
                request.body?.guildId ||
                request.query.guildId;

            if (!guildId) {
                return reply.status(400).send({
                    error: 'Bad Request',
                    message: 'Guild ID is required',
                });
            }

            // Normalize requirements to array
            const reqs = Array.isArray(requirements) ? requirements : [requirements];

            // Check permissions
            const permissions = reqs.map((req) => `${req.resource}.${req.action}`);

            const checkMethod =
                reqs.length > 1 && reqs[0].requireAll
                    ? 'hasAllPermissions'
                    : 'hasAnyPermission';

            const result = await permissionService[checkMethod](
                user.id,
                guildId,
                permissions
            );

            if (!result.allowed) {
                return reply.status(403).send({
                    error: 'Forbidden',
                    message: result.reason || 'Insufficient permissions',
                    required: permissions,
                });
            }

            // Permission granted, continue
        };
    };
}

/**
 * Require Super Admin access
 */
export function requireSuperAdmin(permissionService: PermissionService) {
    return async (request: AuthenticatedRequest, reply: FastifyReply) => {
        const user = request.user;

        if (!user) {
            return reply.status(401).send({
                error: 'Unauthorized',
                message: 'Authentication required',
            });
        }

        const isSuperAdmin = await permissionService.isSuperAdmin(user.id);

        if (!isSuperAdmin) {
            return reply.status(403).send({
                error: 'Forbidden',
                message: 'Super Admin access required',
            });
        }

        // Super Admin verified, continue
    };
}

/**
 * Require guild owner access
 */
export function requireGuildOwner(permissionService: PermissionService) {
    return async (request: AuthenticatedRequest, reply: FastifyReply) => {
        const user = request.user;

        if (!user) {
            return reply.status(401).send({
                error: 'Unauthorized',
                message: 'Authentication required',
            });
        }

        const guildId =
            request.params.guildId ||
            request.body?.guildId ||
            request.query.guildId;

        if (!guildId) {
            return reply.status(400).send({
                error: 'Bad Request',
                message: 'Guild ID is required',
            });
        }

        // Super Admin can bypass
        const isSuperAdmin = await permissionService.isSuperAdmin(user.id);
        if (isSuperAdmin) {
            return; // Continue
        }

        const isOwner = await permissionService.isGuildOwner(user.id, guildId);

        if (!isOwner) {
            return reply.status(403).send({
                error: 'Forbidden',
                message: 'Guild Owner access required',
            });
        }

        // Owner verified, continue
    };
}

/**
 * Require either Super Admin or Guild Owner
 */
export function requireAdminAccess(permissionService: PermissionService) {
    return async (request: AuthenticatedRequest, reply: FastifyReply) => {
        const user = request.user;

        if (!user) {
            return reply.status(401).send({
                error: 'Unauthorized',
                message: 'Authentication required',
            });
        }

        const guildId =
            request.params.guildId ||
            request.body?.guildId ||
            request.query.guildId;

        if (!guildId) {
            return reply.status(400).send({
                error: 'Bad Request',
                message: 'Guild ID is required',
            });
        }

        const isSuperAdmin = await permissionService.isSuperAdmin(user.id);
        if (isSuperAdmin) {
            return; // Continue
        }

        const isOwner = await permissionService.isGuildOwner(user.id, guildId);
        if (isOwner) {
            return; // Continue
        }

        return reply.status(403).send({
            error: 'Forbidden',
            message: 'Super Admin or Guild Owner access required',
        });
    };
}
