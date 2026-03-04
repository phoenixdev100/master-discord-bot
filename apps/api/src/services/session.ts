/**
 * Session Service
 * 
 * Manages user sessions in the database.
 */

import { prisma } from '../config/database';
import { jwtService } from './jwt';
import type { JWTPayload } from './jwt';

export interface CreateSessionData {
    userId: string;
    token: string;
    refreshToken?: string;
    ipAddress?: string;
    userAgent?: string;
}

export class SessionService {
    /**
     * Create a new session
     */
    async createSession(data: CreateSessionData): Promise<string> {
        const payload = jwtService.decode(data.token);
        if (!payload || !payload.exp) {
            throw new Error('Invalid token');
        }

        const expiresAt = new Date(payload.exp * 1000);

        await prisma.session.create({
            data: {
                userId: data.userId,
                token: data.token,
                refreshToken: data.refreshToken,
                expiresAt,
                ipAddress: data.ipAddress,
                userAgent: data.userAgent,
            },
        });

        return data.token;
    }

    /**
     * Get session by token
     */
    async getSession(token: string) {
        return prisma.session.findUnique({
            where: { token },
            include: {
                user: {
                    select: {
                        id: true,
                        username: true,
                        discriminator: true,
                        avatar: true,
                        isSuperAdmin: true,
                    },
                },
            },
        });
    }

    /**
     * Validate session
     */
    async validateSession(token: string): Promise<JWTPayload | null> {
        try {
            // Verify JWT
            const payload = jwtService.verify(token);

            // Check if session exists in database
            const session = await this.getSession(token);
            if (!session) {
                return null;
            }

            // Check if session is expired
            if (session.expiresAt < new Date()) {
                await this.deleteSession(token);
                return null;
            }

            return payload;
        } catch (error) {
            return null;
        }
    }

    /**
     * Delete session
     */
    async deleteSession(token: string): Promise<void> {
        await prisma.session.delete({
            where: { token },
        }).catch(() => {
            // Ignore if session doesn't exist
        });
    }

    /**
     * Delete all sessions for a user
     */
    async deleteUserSessions(userId: string): Promise<void> {
        await prisma.session.deleteMany({
            where: { userId },
        });
    }

    /**
     * Delete expired sessions (cleanup)
     */
    async deleteExpiredSessions(): Promise<number> {
        const result = await prisma.session.deleteMany({
            where: {
                expiresAt: {
                    lt: new Date(),
                },
            },
        });

        return result.count;
    }

    /**
     * Get all active sessions for a user
     */
    async getUserSessions(userId: string) {
        return prisma.session.findMany({
            where: {
                userId,
                expiresAt: {
                    gt: new Date(),
                },
            },
            orderBy: {
                createdAt: 'desc',
            },
        });
    }
}

export const sessionService = new SessionService();
