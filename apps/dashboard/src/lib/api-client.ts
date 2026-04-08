/**
 * API Client for Dashboard
 * 
 * HTTP client for communicating with the backend API.
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

class APIClient {
    private baseUrl: string;

    constructor() {
        this.baseUrl = API_URL;
    }

    private async request<T>(
        endpoint: string,
        options?: RequestInit
    ): Promise<T> {
        const url = `${this.baseUrl}${endpoint}`;

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

        return response.json();
    }

    async get<T>(endpoint: string, token?: string): Promise<T> {
        return this.request<T>(endpoint, {
            method: 'GET',
            headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
    }

    async post<T>(endpoint: string, data?: unknown, token?: string): Promise<T> {
        return this.request<T>(endpoint, {
            method: 'POST',
            body: data ? JSON.stringify(data) : undefined,
            headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
    }

    async put<T>(endpoint: string, data?: unknown, token?: string): Promise<T> {
        return this.request<T>(endpoint, {
            method: 'PUT',
            body: data ? JSON.stringify(data) : undefined,
            headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
    }

    async delete<T>(endpoint: string, token?: string): Promise<T> {
        return this.request<T>(endpoint, {
            method: 'DELETE',
            headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
    }
}

export const apiClient = new APIClient();
