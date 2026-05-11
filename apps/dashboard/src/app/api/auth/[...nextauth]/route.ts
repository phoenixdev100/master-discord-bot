/**
 * NextAuth Configuration
 * 
 * Handles Discord OAuth2 authentication for the dashboard.
 */

import NextAuth, { NextAuthOptions } from 'next-auth';
import DiscordProvider from 'next-auth/providers/discord';

export const authOptions: NextAuthOptions = {
    providers: [
        DiscordProvider({
            clientId: process.env.DISCORD_CLIENT_ID!,
            clientSecret: process.env.DISCORD_CLIENT_SECRET!,
            authorization: {
                params: {
                    scope: 'identify email guilds',
                },
            },
        }),
    ],
    callbacks: {
        async jwt({ token, account, profile }) {
            // Add Discord access token and user info to JWT
            if (account && profile) {
                token.accessToken = account.access_token;
                token.discordId = (profile as { id: string }).id;
            }
            return token;
        },
        async session({ session, token }) {
            // Add Discord info to session
            if (session.user) {
                (session.user as any).id = token.discordId;
                (session.user as any).accessToken = token.accessToken;
            }
            return session;
        },
    },
    pages: {
        signIn: '/login',
        error: '/login',
    },
    session: {
        strategy: 'jwt',
        maxAge: 7 * 24 * 60 * 60, // 7 days
    },
    secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
