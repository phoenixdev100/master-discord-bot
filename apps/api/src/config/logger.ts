/**
 * Logger Configuration
 * 
 * Pino logger setup with pretty printing in development.
 */

import pino from 'pino';
import { env, isDevelopment } from './env';

export const logger = pino({
    level: env.LOG_LEVEL,
    transport: isDevelopment
        ? {
            target: 'pino-pretty',
            options: {
                colorize: true,
                translateTime: 'HH:MM:ss Z',
                ignore: 'pid,hostname',
            },
        }
        : undefined,
});

export default logger;
