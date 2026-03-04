/**
 * JWT Service
 * 
 * Handles JWT token generation and validation.
 */

import jwt from 'jsonwebtoken';
import { env } from '../config/env';

export interface JWTPayload {
    userId: string;
    username: string;
    isSuperAdmin?: boolean;
    iat?: number;
    exp?: number;
}

export class JWTService {
    private readonly secret: string;
    private readonly expiresIn: string;

    constructor() {
        this.secret = env.JWT_SECRET;
        this.expiresIn = env.JWT_EXPIRES_IN;
    }

    /**
     * Generate JWT token
     */
    sign(payload: Omit<JWTPayload, 'iat' | 'exp'>): string {
        return (jwt.sign as any)(
            payload,
            this.secret,
            {
                expiresIn: this.expiresIn,
            }
        );
    }

    /**
     * Verify and decode JWT token
     */
    verify(token: string): JWTPayload {
        try {
            return jwt.verify(token, this.secret) as JWTPayload;
        } catch (error) {
            if (error instanceof jwt.TokenExpiredError) {
                throw new Error('Token expired');
            }
            if (error instanceof jwt.JsonWebTokenError) {
                throw new Error('Invalid token');
            }
            throw error;
        }
    }

    /**
     * Decode token without verification (for debugging)
     */
    decode(token: string): JWTPayload | null {
        return jwt.decode(token) as JWTPayload | null;
    }

    /**
     * Check if token is expired
     */
    isExpired(token: string): boolean {
        try {
            const decoded = this.decode(token);
            if (!decoded || !decoded.exp) return true;
            return Date.now() >= decoded.exp * 1000;
        } catch {
            return true;
        }
    }
}

export const jwtService = new JWTService();
