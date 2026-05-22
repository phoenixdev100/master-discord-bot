/**
 * Enhanced Dashboard Home Page
 * 
 * Modern, vibrant dashboard with premium design
 */

'use client';

import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { useState, useEffect } from 'react';

export default function DashboardPage() {
    const { data: session } = useSession();
    const [mounted, setMounted] = useState(false);
    const [stats, setStats] = useState({
        servers: 0,
        modules: 0,
        commands: 0,
        users: 0
    });
    const [recentActivity, setRecentActivity] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setMounted(true);
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            // Fetch stats
            const statsResponse = await fetch('/api/dashboard/stats');
            if (statsResponse.ok) {
                const statsData = await statsResponse.json();
                setStats(statsData);
            }

            // Fetch recent activity
            const activityResponse = await fetch('/api/dashboard/activity');
            if (activityResponse.ok) {
                const activityData = await activityResponse.json();
                // Format activity with relative time
                const formattedActivity = activityData.slice(0, 3).map((item: any) => ({
                    ...item,
                    time: getRelativeTime(new Date(item.time))
                }));
                setRecentActivity(formattedActivity);
            }
        } catch (error) {
            console.error('Failed to fetch dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };

    const getRelativeTime = (date: Date) => {
        const now = new Date();
        const diff = now.getTime() - date.getTime();
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);

        if (minutes < 1) return 'Just now';
        if (minutes < 60) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
        if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
        return `${days} day${days > 1 ? 's' : ''} ago`;
    };

    return (
        <div className="space-y-8 animate-fade-in">
            {/* Hero Section */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-purple-600 via-blue-600 to-cyan-500 p-8 text-white">
                <div className="absolute inset-0 bg-grid-white/10"></div>
                <div className="relative z-10">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-4xl font-bold mb-2">
                                Welcome back, {session?.user?.name || 'User'}! 👋
                            </h1>
                            <p className="text-white/90 text-lg">
                                Manage your Discord bot from this powerful dashboard
                            </p>
                        </div>
                        <div className="hidden lg:block">
                            <div className="w-32 h-32 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                                <svg className="w-16 h-16" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515a.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0a12.64 12.64 0 0 0-.617-1.25a.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057a19.9 19.9 0 0 0 5.993 3.03a.078.078 0 0 0 .084-.028a14.09 14.09 0 0 0 1.226-1.994a.076.076 0 0 0-.041-.106a13.107 13.107 0 0 1-1.872-.892a.077.077 0 0 1-.008-.128a10.2 10.2 0 0 0 .372-.292a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127a12.299 12.299 0 0 1-1.873.892a.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028a19.839 19.839 0 0 0 6.002-3.03a.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03z" />
                                </svg>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Total Servers */}
                <div className="group relative overflow-hidden rounded-xl bg-gradient-to-br from-purple-500/10 to-purple-600/10 border border-purple-500/20 p-6 hover:border-purple-500/40 transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/20">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full -mr-16 -mt-16 group-hover:scale-110 transition-transform duration-300"></div>
                    <div className="relative">
                        <div className="flex items-center justify-between mb-4">
                            <div className="w-12 h-12 rounded-lg bg-purple-500/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                                <svg className="w-6 h-6 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                </svg>
                            </div>
                            <span className="text-xs font-medium text-purple-500 bg-purple-500/10 px-2 py-1 rounded-full">+0%</span>
                        </div>
                        <p className="text-sm text-muted-foreground mb-1">Total Servers</p>
                        <p className="text-3xl font-bold text-foreground">{stats.servers}</p>
                    </div>
                </div>

                {/* Active Modules */}
                <div className="group relative overflow-hidden rounded-xl bg-gradient-to-br from-blue-500/10 to-blue-600/10 border border-blue-500/20 p-6 hover:border-blue-500/40 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/20">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full -mr-16 -mt-16 group-hover:scale-110 transition-transform duration-300"></div>
                    <div className="relative">
                        <div className="flex items-center justify-between mb-4">
                            <div className="w-12 h-12 rounded-lg bg-blue-500/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                                <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                                </svg>
                            </div>
                            <span className="text-xs font-medium text-blue-500 bg-blue-500/10 px-2 py-1 rounded-full">+0%</span>
                        </div>
                        <p className="text-sm text-muted-foreground mb-1">Active Modules</p>
                        <p className="text-3xl font-bold text-foreground">{stats.modules}</p>
                    </div>
                </div>

                {/* Commands Used */}
                <div className="group relative overflow-hidden rounded-xl bg-gradient-to-br from-cyan-500/10 to-cyan-600/10 border border-cyan-500/20 p-6 hover:border-cyan-500/40 transition-all duration-300 hover:shadow-lg hover:shadow-cyan-500/20">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/10 rounded-full -mr-16 -mt-16 group-hover:scale-110 transition-transform duration-300"></div>
                    <div className="relative">
                        <div className="flex items-center justify-between mb-4">
                            <div className="w-12 h-12 rounded-lg bg-cyan-500/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                                <svg className="w-6 h-6 text-cyan-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                </svg>
                            </div>
                            <span className="text-xs font-medium text-cyan-500 bg-cyan-500/10 px-2 py-1 rounded-full">+0%</span>
                        </div>
                        <p className="text-sm text-muted-foreground mb-1">Commands Used</p>
                        <p className="text-3xl font-bold text-foreground">{stats.commands}</p>
                    </div>
                </div>

                {/* Total Users */}
                <div className="group relative overflow-hidden rounded-xl bg-gradient-to-br from-pink-500/10 to-pink-600/10 border border-pink-500/20 p-6 hover:border-pink-500/40 transition-all duration-300 hover:shadow-lg hover:shadow-pink-500/20">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-pink-500/10 rounded-full -mr-16 -mt-16 group-hover:scale-110 transition-transform duration-300"></div>
                    <div className="relative">
                        <div className="flex items-center justify-between mb-4">
                            <div className="w-12 h-12 rounded-lg bg-pink-500/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                                <svg className="w-6 h-6 text-pink-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                                </svg>
                            </div>
                            <span className="text-xs font-medium text-pink-500 bg-pink-500/10 px-2 py-1 rounded-full">+0%</span>
                        </div>
                        <p className="text-sm text-muted-foreground mb-1">Total Users</p>
                        <p className="text-3xl font-bold text-foreground">{stats.users}</p>
                    </div>
                </div>
            </div>

            {/* Quick Actions & Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Quick Actions */}
                <div className="lg:col-span-2 glass rounded-xl p-6 border border-border/50">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-bold text-foreground">Quick Actions</h2>
                        <span className="text-xs text-muted-foreground">Get started</span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Link
                            href="/dashboard/servers"
                            className="group relative overflow-hidden rounded-lg bg-gradient-to-br from-purple-500/10 to-purple-600/10 border border-purple-500/20 p-5 hover:border-purple-500/40 transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/20"
                        >
                            <div className="flex items-start gap-4">
                                <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                                    <svg className="w-5 h-5 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                    </svg>
                                </div>
                                <div className="flex-1">
                                    <p className="font-semibold text-foreground mb-1">Add Server</p>
                                    <p className="text-xs text-muted-foreground">Invite bot to a new server</p>
                                </div>
                            </div>
                        </Link>

                        <Link
                            href="/dashboard/modules"
                            className="group relative overflow-hidden rounded-lg bg-gradient-to-br from-blue-500/10 to-blue-600/10 border border-blue-500/20 p-5 hover:border-blue-500/40 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/20"
                        >
                            <div className="flex items-start gap-4">
                                <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                                    <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                </div>
                                <div className="flex-1">
                                    <p className="font-semibold text-foreground mb-1">Configure</p>
                                    <p className="text-xs text-muted-foreground">Enable or disable features</p>
                                </div>
                            </div>
                        </Link>

                        <Link
                            href="/dashboard/logs"
                            className="group relative overflow-hidden rounded-lg bg-gradient-to-br from-cyan-500/10 to-cyan-600/10 border border-cyan-500/20 p-5 hover:border-cyan-500/40 transition-all duration-300 hover:shadow-lg hover:shadow-cyan-500/20"
                        >
                            <div className="flex items-start gap-4">
                                <div className="w-10 h-10 rounded-lg bg-cyan-500/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                                    <svg className="w-5 h-5 text-cyan-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                </div>
                                <div className="flex-1">
                                    <p className="font-semibold text-foreground mb-1">View Logs</p>
                                    <p className="text-xs text-muted-foreground">Check audit and activity logs</p>
                                </div>
                            </div>
                        </Link>
                    </div>
                </div>

                {/* Recent Activity */}
                <div className="glass rounded-xl p-6 border border-border/50">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-bold text-foreground">Recent Activity</h2>
                        <Link href="/dashboard/logs" className="text-xs text-primary hover:underline">View all</Link>
                    </div>
                    <div className="space-y-4">
                        {loading ? (
                            <div className="flex items-center justify-center py-8">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                            </div>
                        ) : recentActivity.length > 0 ? (
                            recentActivity.map((activity, index) => (
                                <div key={index} className="flex items-start gap-3 p-3 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors">
                                    <div className="text-2xl">{activity.icon}</div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-foreground">{activity.action}</p>
                                        <p className="text-xs text-muted-foreground truncate">{activity.server || activity.module || activity.command}</p>
                                        <p className="text-xs text-muted-foreground mt-1">{activity.time}</p>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-8 text-muted-foreground">
                                <p className="text-sm">No recent activity</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
