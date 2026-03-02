/**
 * Audit Log Service
 * 
 * Records all administrative actions for compliance and security.
 */

import { prisma } from '../config/database';

export interface AuditLogData {
    guildId: string;
    userId: string;
    action: string;
    resource: string;
    resourceId?: string;
    metadata?: Record<string, unknown>;
    ipAddress?: string;
    userAgent?: string;
}

export class AuditLogService {
    /**
     * Create an audit log entry
     */
    async log(data: AuditLogData): Promise<void> {
        try {
            await prisma.auditLog.create({
                data: {
                    guildId: data.guildId,
                    userId: data.userId,
                    action: data.action,
                    resource: data.resource,
                    resourceId: data.resourceId,
                    metadata: data.metadata as any,
                    ipAddress: data.ipAddress,
                    userAgent: data.userAgent,
                },
            });
        } catch (error) {
            console.error('Failed to create audit log:', error);
            // Don't throw - audit logging should not break the main flow
        }
    }

    /**
     * Get audit logs for a guild
     */
    async getGuildLogs(
        guildId: string,
        options?: {
            limit?: number;
            offset?: number;
            action?: string;
            userId?: string;
            startDate?: Date;
            endDate?: Date;
        }
    ): Promise<any[]> {
        return prisma.auditLog.findMany({
            where: {
                guildId,
                ...(options?.action && { action: options.action }),
                ...(options?.userId && { userId: options.userId }),
                ...(options?.startDate &&
                    options?.endDate && {
                    createdAt: {
                        gte: options.startDate,
                        lte: options.endDate,
                    },
                }),
            },
            include: {
                user: {
                    select: {
                        id: true,
                        username: true,
                        discriminator: true,
                        avatar: true,
                    },
                },
            },
            orderBy: {
                createdAt: 'desc',
            },
            take: options?.limit ?? 50,
            skip: options?.offset ?? 0,
        });
    }

    /**
     * Get audit logs for a user
     */
    async getUserLogs(
        userId: string,
        options?: {
            limit?: number;
            offset?: number;
            guildId?: string;
        }
    ): Promise<any[]> {
        return prisma.auditLog.findMany({
            where: {
                userId,
                ...(options?.guildId && { guildId: options.guildId }),
            },
            include: {
                guild: {
                    select: {
                        id: true,
                        name: true,
                        icon: true,
                    },
                },
            },
            orderBy: {
                createdAt: 'desc',
            },
            take: options?.limit ?? 50,
            skip: options?.offset ?? 0,
        });
    }

    /**
     * Get audit log statistics
     */
    async getStats(guildId: string, days: number = 30) {
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);

        const logs = await prisma.auditLog.findMany({
            where: {
                guildId,
                createdAt: {
                    gte: startDate,
                },
            },
            select: {
                action: true,
                userId: true,
            },
        });

        // Count by action
        const actionCounts = logs.reduce(
            (acc, log) => {
                acc[log.action] = (acc[log.action] || 0) + 1;
                return acc;
            },
            {} as Record<string, number>
        );

        // Count by user
        const userCounts = logs.reduce(
            (acc, log) => {
                acc[log.userId] = (acc[log.userId] || 0) + 1;
                return acc;
            },
            {} as Record<string, number>
        );

        return {
            total: logs.length,
            byAction: actionCounts,
            byUser: userCounts,
            period: {
                start: startDate,
                end: new Date(),
                days,
            },
        };
    }
}

export const auditLogService = new AuditLogService();
