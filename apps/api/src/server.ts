/**
 * Fastify Server Setup
 * 
 * Configures and creates the Fastify server instance.
 */

import Fastify from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import rateLimit from '@fastify/rate-limit';
import swagger from '@fastify/swagger';
import swaggerUi from '@fastify/swagger-ui';
import { env, isDevelopment } from './config/env';
import logger from './config/logger';
import redis from './config/redis';
import { errorHandler, notFoundHandler } from './middleware/error-handler';
import { auditLog } from './middleware/audit';

export async function createServer() {
    const app = Fastify({
        logger: logger as any,
        trustProxy: true,
        requestIdHeader: 'x-request-id',
        requestIdLogLabel: 'reqId',
    });

    // CORS
    await app.register(cors, {
        origin: isDevelopment
            ? true
            : [process.env.NEXTAUTH_URL || 'http://localhost:3000'],
        credentials: true,
    });

    // Security headers
    await app.register(helmet, {
        contentSecurityPolicy: isDevelopment ? false : undefined,
    });

    // Rate limiting
    await app.register(rateLimit, {
        max: env.RATE_LIMIT_MAX_REQUESTS,
        timeWindow: env.RATE_LIMIT_WINDOW_MS,
        redis,
        skipOnError: true,
        keyGenerator: (request) => {
            return request.user?.id || request.ip;
        },
    });

    // Swagger documentation
    if (isDevelopment) {
        await app.register(swagger, {
            openapi: {
                info: {
                    title: 'Discord Bot Platform API',
                    description: 'API documentation for the Discord Bot Platform',
                    version: '1.0.0',
                },
                servers: [
                    {
                        url: env.API_URL,
                        description: 'Development server',
                    },
                ],
                components: {
                    securitySchemes: {
                        bearerAuth: {
                            type: 'http',
                            scheme: 'bearer',
                            bearerFormat: 'JWT',
                        },
                    },
                },
            },
        });

        await app.register(swaggerUi, {
            routePrefix: '/docs',
            uiConfig: {
                docExpansion: 'list',
                deepLinking: true,
            },
        });
    }

    // Global hooks
    app.addHook('onRequest', auditLog);

    // Error handlers
    app.setErrorHandler(errorHandler as any);
    app.setNotFoundHandler(notFoundHandler as any);

    // Root route
    app.get('/', async () => {
        return {
            name: 'Discord Bot Platform API',
            version: '1.0.0',
            status: 'running',
            docs: isDevelopment ? `${env.API_URL}/docs` : undefined,
        };
    });

    return app;
}
