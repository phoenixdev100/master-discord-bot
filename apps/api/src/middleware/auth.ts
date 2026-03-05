/**
 * Authentication Middleware
 * 
 * Validates JWT tokens and attaches user to request.
 */

import type { FastifyRequest, FastifyReply } from 'fastify';
import { sessionService } from '../services/session';

/**
 * Authenticated user attached to request
 */
export interface AuthenticatedUser {
    id: string;
    username: string;
    isSuperAdmin?: boolean;
}

/**
 * Extend FastifyRequest with user
 */
declare module 'fastify' {
    interface FastifyRequest {
        user?: AuthenticatedUser;
    }
}

/**
 * Extract token from Authorization header
 */
function extractToken(request: FastifyRequest): string | null {
    const authHeader = request.headers.authorization;
    if (!authHeader) return null;

    const [type, token] = authHeader.split(' ');
    if (type !== 'Bearer' || !token) return null;

    return token;
}

/**
 * Authentication middleware - validates JWT and attaches user to request
 */
export async function authenticate(
    request: FastifyRequest,
    reply: FastifyReply
): Promise<void> {
    const token = extractToken(request);

    if (!token) {
        return reply.status(401).send({
            error: 'Unauthorized',
            message: 'Missing authentication token',
        });
    }

    const payload = await sessionService.validateSession(token);

    if (!payload) {
        return reply.status(401).send({
            error: 'Unauthorized',
            message: 'Invalid or expired token',
        });
    }

    // Attach user to request
    request.user = {
        id: payload.userId,
        username: payload.username,
        isSuperAdmin: payload.isSuperAdmin,
    };
}

/**
 * Optional authentication - attaches user if token is valid, but doesn't fail if missing
 */
export async function optionalAuthenticate(
    request: FastifyRequest
): Promise<void> {
    const token = extractToken(request);

    if (!token) {
        return; // Continue without user
    }

    const payload = await sessionService.validateSession(token);

    if (payload) {
        request.user = {
            id: payload.userId,
            username: payload.username,
            isSuperAdmin: payload.isSuperAdmin,
        };
    }
}
