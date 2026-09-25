/**
 * Logger Configuration
 * 
 * Pino logger setup with pretty printing in development.
 */

import pino from 'pino';
import { env, isDevelopment } from './env';

// Fastify 5 accepts a config object (not a pino instance) for `logger`.
export const loggerConfig = {
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
};

export const logger = pino(loggerConfig);

export default logger;
