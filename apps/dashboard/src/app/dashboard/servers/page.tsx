/**
 * Servers Page
 * 
 * Lists all servers the bot is in, with management options
 */

'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';

interface Server {
    id: string;
    name: string;
    icon: string | null;
    ownerId: string;
    memberCount: number;
    commandCount?: number;
    enabledModules: number;
    totalModules: number;
    joinedAt: string;
}

export default function ServersPage() {
    const { data: session } = useSession();
    const [servers, setServers] = useState<Server[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        fetchServers();
    }, []);

    const fetchServers = async () => {
        try {
            const response = await fetch('/api/dashboard/guilds');
            if (response.ok) {
                const data = await response.json();
                setServers(data);
            }
        } catch (error) {
            console.error('Failed to fetch servers:', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredServers = servers.filter(server =>
        server.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        server.id.includes(searchQuery)
    );

    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map(word => word[0])
            .join('')
            .substring(0, 2)
            .toUpperCase();
    };

    return (
        <div className="space-y-8 animate-fade-in">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">
                        Servers
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        Manage and configure your Discord servers
                    </p>
                </div>

                {/* Search & Actions */}
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        <input
                            type="text"
                            placeholder="Search servers..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="bg-secondary/50 border border-border rounded-lg pl-10 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm w-64 transition-all"
                        />
                    </div>
                    <button
                        onClick={() => window.open('https://discord.com/oauth2/authorize?client_id=' + process.env.DISCORD_CLIENT_ID + '&scope=bot&permissions=8', '_blank')}
                        className="bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        Add Server
                    </button>
                </div>
            </div>

            {/* Servers Grid */}
            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                        <div key={i} className="h-48 rounded-xl bg-secondary/50 animate-pulse border border-border/50"></div>
                    ))}
                </div>
            ) : filteredServers.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredServers.map((server) => (
                        <Link
                            key={server.id}
                            href={`/dashboard/servers/${server.id}`}
                            className="group relative overflow-hidden rounded-xl bg-card border border-border/50 p-6 hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5"
                        >
                            {/* Background Decoration */}
                            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500"></div>

                            <div className="relative flex items-start justify-between mb-6">
                                <div className="flex items-center gap-4">
                                    <div className="w-16 h-16 rounded-2xl bg-secondary flex items-center justify-center overflow-hidden border border-border/50 shadow-inner group-hover:shadow-primary/20 transition-all">
                                        {server.icon ? (
                                            <img
                                                src={`https://cdn.discordapp.com/icons/${server.id}/${server.icon}.png`}
                                                alt={server.name}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <span className="text-xl font-bold text-muted-foreground group-hover:text-primary transition-colors">
                                                {getInitials(server.name)}
                                            </span>
                                        )}
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-lg text-foreground group-hover:text-primary transition-colors line-clamp-1">
                                            {server.name}
                                        </h3>
                                        <span className={`text-xs px-2 py-0.5 rounded-full border ${server.enabledModules > 0
                                                ? 'bg-green-500/10 text-green-500 border-green-500/20'
                                                : 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20'
                                            }`}>
                                            {server.enabledModules}/{server.totalModules} Modules Active
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="relative grid grid-cols-2 gap-4 pt-4 border-t border-border/50">
                                <div>
                                    <p className="text-xs text-muted-foreground mb-1">Members</p>
                                    <div className="flex items-center gap-2">
                                        <svg className="w-4 h-4 text-primary/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                                        </svg>
                                        <span className="font-semibold">{server.memberCount}</span>
                                    </div>
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground mb-1">Joined</p>
                                    <div className="flex items-center gap-2">
                                        <svg className="w-4 h-4 text-primary/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                        </svg>
                                        <span className="font-semibold">{new Date(server.joinedAt).toLocaleDateString()}</span>
                                    </div>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            ) : (
                <div className="text-center py-20 rounded-xl bg-card/50 border border-border/50 border-dashed">
                    <div className="w-16 h-16 bg-secondary rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </div>
                    <h3 className="text-xl font-bold text-foreground mb-2">No servers found</h3>
                    <p className="text-muted-foreground max-w-md mx-auto mb-6">
                        {searchQuery ? `No servers matching "${searchQuery}"` : "The bot hasn't joined any servers yet."}
                    </p>
                    <button
                        onClick={() => window.open('https://discord.com/oauth2/authorize?client_id=' + process.env.DISCORD_CLIENT_ID + '&scope=bot&permissions=8', '_blank')}
                        className="bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-2 rounded-lg font-medium transition-colors"
                    >
                        Invite Bot
                    </button>
                </div>
            )}
        </div>
    );
}
