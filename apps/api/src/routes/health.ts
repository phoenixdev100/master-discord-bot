/**
 * Health Check Routes
 * 
 * Provides health and readiness endpoints for monitoring.
 */

import type { FastifyInstance } from 'fastify';
import { checkDatabaseHealth } from '@discord-platform/database';
import redis from '../config/redis';

export async function healthRoutes(app: FastifyInstance): Promise<void> {
    /**
     * GET /api/health
     * Basic health check
     */
    app.get('/', async () => {
        return {
            status: 'ok',
            timestamp: new Date().toISOString(),
        };
    });

    /**
     * GET /api/health/ready
     * Readiness check - verifies all dependencies are available
     */
    app.get('/ready', async (_, reply) => {
        const checks = {
            database: false,
            redis: false,
        };

        try {
            // Check database
            checks.database = await checkDatabaseHealth();

            // Check Redis
            const redisPing = await redis.ping();
            checks.redis = redisPing === 'PONG';

            const isReady = checks.database && checks.redis;

            return reply.status(isReady ? 200 : 503).send({
                status: isReady ? 'ready' : 'not ready',
                checks,
                timestamp: new Date().toISOString(),
            });
        } catch (error) {
            return reply.status(503).send({
                status: 'not ready',
                checks,
                error: error instanceof Error ? error.message : 'Unknown error',
                timestamp: new Date().toISOString(),
            });
        }
    });

    /**
     * GET /api/health/live
     * Liveness check - verifies the service is running
     */
    app.get('/live', async () => {
        return {
            status: 'alive',
            timestamp: new Date().toISOString(),
            uptime: process.uptime(),
            memory: process.memoryUsage(),
        };
    });
}
