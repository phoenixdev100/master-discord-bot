/**
 * Redis Client Configuration
 */

import Redis from 'ioredis';
import { env } from './env';
import logger from './logger';

export const redis = new Redis(env.REDIS_URL, {
    maxRetriesPerRequest: 3,
    retryStrategy(times) {
        const delay = Math.min(times * 50, 2000);
        return delay;
    },
    reconnectOnError(err) {
        const targetError = 'READONLY';
        if (err.message.includes(targetError)) {
            // Reconnect when Redis is in readonly mode
            return true;
        }
        return false;
    },
});

redis.on('connect', () => {
    logger.info('✅ Redis connected');
});

redis.on('error', (err) => {
    logger.error({ err }, '❌ Redis error');
});

redis.on('close', () => {
    logger.warn('⚠️  Redis connection closed');
});

export default redis;
