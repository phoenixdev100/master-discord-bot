/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    swcMinify: true,
    images: {
        domains: ['cdn.discordapp.com'],
    },
    env: {
        NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
    },
    async rewrites() {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
        return [
            {
                source: '/api/dashboard/:path*',
                destination: `${apiUrl}/api/dashboard/:path*`,
            },
            {
                source: '/api/guilds/:path*',
                destination: `${apiUrl}/api/guilds/:path*`,
            },
            // Add other backend proxy routes here as needed, but DO NOT include /api/auth
        ];
    },
};

module.exports = nextConfig;
