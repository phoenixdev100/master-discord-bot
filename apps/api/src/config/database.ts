/**
 * Database Configuration
 */

import { prisma, connectDatabase } from '@discord-platform/database';
import logger from './logger';

export async function initializeDatabase(): Promise<void> {
    try {
        await connectDatabase();
        logger.info('✅ Database connected');
    } catch (error) {
        logger.error({ error }, '❌ Database connection failed');
        throw error;
    }
}

export { prisma };
export default prisma;
