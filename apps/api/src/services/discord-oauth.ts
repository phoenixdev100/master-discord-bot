/**
 * Discord OAuth2 Service
 * 
 * Handles Discord OAuth2 authentication flow.
 */

import { env } from '../config/env';

export interface DiscordUser {
    id: string;
    username: string;
    discriminator: string;
    avatar: string | null;
    email?: string;
    verified?: boolean;
}

export interface DiscordTokenResponse {
    access_token: string;
    token_type: string;
    expires_in: number;
    refresh_token: string;
    scope: string;
}

export class DiscordOAuthService {
    private readonly clientId: string;
    private readonly clientSecret: string;
    private readonly redirectUri: string;
    private readonly apiBase = 'https://discord.com/api/v10';

    constructor() {
        this.clientId = env.DISCORD_CLIENT_ID;
        this.clientSecret = env.DISCORD_CLIENT_SECRET;
        this.redirectUri = env.DISCORD_REDIRECT_URI;
    }

    /**
     * Get OAuth2 authorization URL
     */
    getAuthorizationUrl(state?: string): string {
        const params = new URLSearchParams({
            client_id: this.clientId,
            redirect_uri: this.redirectUri,
            response_type: 'code',
            scope: 'identify email guilds',
        });

        if (state) {
            params.append('state', state);
        }

        return `https://discord.com/api/oauth2/authorize?${params.toString()}`;
    }

    /**
     * Exchange authorization code for access token
     */
    async exchangeCode(code: string): Promise<DiscordTokenResponse> {
        const response = await fetch(`${this.apiBase}/oauth2/token`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
                client_id: this.clientId,
                client_secret: this.clientSecret,
                grant_type: 'authorization_code',
                code,
                redirect_uri: this.redirectUri,
            }),
        });

        if (!response.ok) {
            const error = await response.text();
            throw new Error(`Failed to exchange code: ${error}`);
        }

        return response.json();
    }

    /**
     * Refresh access token
     */
    async refreshToken(refreshToken: string): Promise<DiscordTokenResponse> {
        const response = await fetch(`${this.apiBase}/oauth2/token`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
                client_id: this.clientId,
                client_secret: this.clientSecret,
                grant_type: 'refresh_token',
                refresh_token: refreshToken,
            }),
        });

        if (!response.ok) {
            const error = await response.text();
            throw new Error(`Failed to refresh token: ${error}`);
        }

        return response.json();
    }

    /**
     * Get user information from Discord
     */
    async getUser(accessToken: string): Promise<DiscordUser> {
        const response = await fetch(`${this.apiBase}/users/@me`, {
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        });

        if (!response.ok) {
            const error = await response.text();
            throw new Error(`Failed to get user: ${error}`);
        }

        return response.json();
    }

    /**
     * Get user's guilds from Discord
     */
    async getUserGuilds(accessToken: string): Promise<any[]> {
        const response = await fetch(`${this.apiBase}/users/@me/guilds`, {
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        });

        if (!response.ok) {
            const error = await response.text();
            throw new Error(`Failed to get guilds: ${error}`);
        }

        return response.json();
    }

    /**
     * Revoke access token
     */
    async revokeToken(accessToken: string): Promise<void> {
        const response = await fetch(`${this.apiBase}/oauth2/token/revoke`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
                client_id: this.clientId,
                client_secret: this.clientSecret,
                token: accessToken,
            }),
        });

        if (!response.ok) {
            const error = await response.text();
            throw new Error(`Failed to revoke token: ${error}`);
        }
    }
}

export const discordOAuth = new DiscordOAuthService();
