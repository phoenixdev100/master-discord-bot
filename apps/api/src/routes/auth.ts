/**
 * Authentication Routes
 * 
 * Handles Discord OAuth2 login flow and session management.
 */

import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { discordOAuth } from '../services/discord-oauth';
import { jwtService } from '../services/jwt';
import { sessionService } from '../services/session';
import { prisma } from '../config/database';
import { authenticate } from '../middleware/auth';
import redis from '../config/redis';
import crypto from 'crypto';

const callbackSchema = z.object({
    code: z.string(),
    state: z.string().optional(),
});

const OAUTH_STATE_TTL_SECONDS = 600; // 10 minutes
const OAUTH_STATE_PREFIX = 'oauth:state:';

export async function authRoutes(app: FastifyInstance): Promise<void> {
    /**
     * GET /api/auth/login
     * Redirects to Discord OAuth2 authorization page
     */
    app.get('/login', async (_, reply) => {
        const state = crypto.randomBytes(24).toString('hex');

        // Store state for CSRF validation on callback
        try {
            await redis.set(`${OAUTH_STATE_PREFIX}${state}`, '1', 'EX', OAUTH_STATE_TTL_SECONDS);
        } catch (error) {
            // If Redis is unavailable we still proceed, but log it
            console.error('Failed to store OAuth state:', error);
        }

        const authUrl = discordOAuth.getAuthorizationUrl(state);

        return reply.redirect(authUrl);
    });

    /**
     * GET /api/auth/callback
     * Handles OAuth2 callback from Discord
     */
    app.get('/callback', async (request, reply) => {
        const { code, state } = callbackSchema.parse(request.query);

        // Validate OAuth state (CSRF protection)
        if (state) {
            try {
                const key = `${OAUTH_STATE_PREFIX}${state}`;
                const exists = await redis.get(key);
                if (!exists) {
                    return reply.status(400).send({
                        error: 'Invalid State',
                        message: 'OAuth state is invalid or expired. Please try logging in again.',
                    });
                }
                await redis.del(key);
            } catch (error) {
                request.log.error({ error }, 'Failed to validate OAuth state');
                return reply.status(500).send({
                    error: 'Authentication Failed',
                    message: 'Could not validate login state',
                });
            }
        }

        try {
            // Exchange code for tokens
            const tokens = await discordOAuth.exchangeCode(code);

            // Get user info from Discord
            const discordUser = await discordOAuth.getUser(tokens.access_token);

            // Create or update user in database
            const user = await prisma.user.upsert({
                where: { id: discordUser.id },
                create: {
                    id: discordUser.id,
                    username: discordUser.username,
                    discriminator: discordUser.discriminator,
                    avatar: discordUser.avatar,
                },
                update: {
                    username: discordUser.username,
                    discriminator: discordUser.discriminator,
                    avatar: discordUser.avatar,
                },
                select: {
                    id: true,
                    username: true,
                    discriminator: true,
                    avatar: true,
                    isSuperAdmin: true,
                },
            });

            // Generate JWT
            const token = jwtService.sign({
                userId: user.id,
                username: user.username,
                isSuperAdmin: user.isSuperAdmin,
            });

            // Create session
            await sessionService.createSession({
                userId: user.id,
                token,
                refreshToken: tokens.refresh_token,
                ipAddress: request.ip,
                userAgent: request.headers['user-agent'],
            });

            // Return token
            return {
                success: true,
                token,
                user: {
                    id: user.id,
                    username: user.username,
                    discriminator: user.discriminator,
                    avatar: user.avatar,
                    isSuperAdmin: user.isSuperAdmin,
                },
            };
        } catch (error) {
            request.log.error({ error }, 'OAuth callback failed');
            return reply.status(500).send({
                error: 'Authentication Failed',
                message: 'Failed to authenticate with Discord',
            });
        }
    });

    /**
     * POST /api/auth/logout
     * Logs out the current user
     */
    app.post(
        '/logout',
        {
            preHandler: authenticate,
        },
        async (request, reply) => {
            const authHeader = request.headers.authorization;
            if (!authHeader) {
                return reply.status(401).send({
                    error: 'Unauthorized',
                    message: 'Missing authentication token',
                });
            }

            const token = authHeader.split(' ')[1];

            // Delete session
            await sessionService.deleteSession(token);

            return {
                success: true,
                message: 'Logged out successfully',
            };
        }
    );

    /**
     * GET /api/auth/me
     * Get current user information
     */
    app.get(
        '/me',
        {
            preHandler: authenticate,
        },
        async (request, reply) => {
            const user = await prisma.user.findUnique({
                where: { id: request.user!.id },
                select: {
                    id: true,
                    username: true,
                    discriminator: true,
                    avatar: true,
                    isSuperAdmin: true,
                    createdAt: true,
                },
            });

            if (!user) {
                return reply.status(404).send({
                    error: 'Not Found',
                    message: 'User not found',
                });
            }

            return {
                user,
            };
        }
    );

    /**
     * GET /api/auth/session
     * Check current session status (alias for /me but compatible with some clients)
     */
    app.get(
        '/session',
        {
            preHandler: authenticate,
        },
        async (request, reply) => {
            const user = await prisma.user.findUnique({
                where: { id: request.user!.id },
                select: {
                    id: true,
                    username: true,
                    discriminator: true,
                    avatar: true,
                    isSuperAdmin: true,
                },
            });

            if (!user) {
                return reply.status(401).send({
                    error: 'Unauthorized',
                    message: 'Session invalid',
                });
            }

            return {
                user,
                expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours from now
            };
        }
    );

    /**
     * GET /api/auth/sessions
     * Get all active sessions for current user
     */
    app.get(
        '/sessions',
        {
            preHandler: authenticate,
        },
        async (request) => {
            const sessions = await sessionService.getUserSessions(request.user!.id);

            return {
                sessions: sessions.map((session) => ({
                    id: session.id,
                    createdAt: session.createdAt,
                    expiresAt: session.expiresAt,
                    ipAddress: session.ipAddress,
                    userAgent: session.userAgent,
                })),
            };
        }
    );

    /**
     * DELETE /api/auth/sessions
     * Delete all sessions for current user (logout from all devices)
     */
    app.delete(
        '/sessions',
        {
            preHandler: authenticate,
        },
        async (request) => {
            await sessionService.deleteUserSessions(request.user!.id);

            return {
                success: true,
                message: 'All sessions deleted',
            };
        }
    );
}
