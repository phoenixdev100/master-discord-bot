/**
 * API Client
 * 
 * HTTP client for communicating with the API backend.
 */

import { env } from '../config/env';
import logger from '../config/logger';

export class APIClient {
    private baseUrl: string;

    constructor() {
        this.baseUrl = env.API_URL;
    }

    /**
     * Make a request to the API
     */
    private async request<T>(
        endpoint: string,
        options?: RequestInit
    ): Promise<T> {
        const url = `${this.baseUrl}${endpoint}`;

        try {
            const response = await fetch(url, {
                ...options,
                headers: {
                    'Content-Type': 'application/json',
                    ...options?.headers,
                },
            });

            if (!response.ok) {
                const error = await response.text();
                throw new Error(`API request failed: ${response.status} ${error}`);
            }

            return response.json() as Promise<T>;
        } catch (error) {
            logger.error({ error, endpoint }, 'API request failed');
            throw error;
        }
    }

    /**
     * GET request
     */
    async get<T>(endpoint: string): Promise<T> {
        return this.request<T>(endpoint, { method: 'GET' });
    }

    /**
     * POST request
     */
    async post<T>(endpoint: string, data?: unknown): Promise<T> {
        return this.request<T>(endpoint, {
            method: 'POST',
            body: data ? JSON.stringify(data) : undefined,
        });
    }

    /**
     * PUT request
     */
    async put<T>(endpoint: string, data?: unknown): Promise<T> {
        return this.request<T>(endpoint, {
            method: 'PUT',
            body: data ? JSON.stringify(data) : undefined,
        });
    }

    /**
     * PATCH request
     */
    async patch<T>(endpoint: string, data?: unknown): Promise<T> {
        return this.request<T>(endpoint, {
            method: 'PATCH',
            body: data ? JSON.stringify(data) : undefined,
        });
    }

    /**
     * DELETE request
     */
    async delete<T>(endpoint: string): Promise<T> {
        return this.request<T>(endpoint, { method: 'DELETE' });
    }

    /**
     * Register a guild with the API
     */
    async registerGuild(guildId: string, guildData: {
        name: string;
        icon: string | null;
        ownerId: string;
    }): Promise<void> {
        await this.post(`/api/guilds/${guildId}/register`, guildData);
    }

    /**
     * Unregister a guild from the API
     */
    async unregisterGuild(guildId: string): Promise<void> {
        await this.delete(`/api/guilds/${guildId}/unregister`);
    }

    /**
     * Check if a module is enabled for a guild
     */
    async isModuleEnabled(guildId: string, moduleName: string): Promise<boolean> {
        try {
            const response = await this.get<{ enabled: boolean }>(
                `/api/guilds/${guildId}/modules/${moduleName}`
            );
            return response.enabled;
        } catch (error) {
            logger.warn({ error, guildId, moduleName }, 'Failed to check module status');
            return false;
        }
    }

    /**
     * Health check
     */
    async healthCheck(): Promise<boolean> {
        try {
            await this.get('/api/health');
            return true;
        } catch (error) {
            return false;
        }
    }
}

export const apiClient = new APIClient();
