/**
 * Moderation Dashboard Page
 * 
 * Overview of moderation statistics and recent cases.
 */

'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface ModerationStats {
    totalCases: number;
    activeCases: number;
    casesToday: number;
    casesThisWeek: number;
    casesByType: {
        ban: number;
        kick: number;
        mute: number;
        warn: number;
    };
}

interface RecentCase {
    caseNumber: number;
    type: string;
    targetId: string;
    moderatorId: string;
    reason: string;
    createdAt: string;
    isActive: boolean;
}

export default function ModerationDashboard() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [stats, setStats] = useState<ModerationStats | null>(null);
    const [recentCases, setRecentCases] = useState<RecentCase[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/login');
        }
    }, [status, router]);

    useEffect(() => {
        if (session) {
            fetchModerationData();
        }
    }, [session]);

    const fetchModerationData = async () => {
        try {
            // TODO: Replace with actual guild ID from context
            const guildId = 'YOUR_GUILD_ID';

            // Fetch stats (you'll need to create this endpoint)
            // const statsRes = await fetch(`/api/guilds/${guildId}/moderation/stats`);
            // const statsData = await statsRes.json();

            // Mock data for now
            setStats({
                totalCases: 1247,
                activeCases: 89,
                casesToday: 12,
                casesThisWeek: 67,
                casesByType: {
                    ban: 234,
                    kick: 456,
                    mute: 389,
                    warn: 168,
                },
            });

            // Fetch recent cases
            const casesRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/guilds/${guildId}/moderation/cases?limit=10`);
            const casesData = await casesRes.json();

            if (casesData.success) {
                setRecentCases(casesData.cases);
            }

            setLoading(false);
        } catch (error) {
            console.error('Failed to fetch moderation data:', error);
            setLoading(false);
        }
    };

    if (status === 'loading' || loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-white">Moderation</h1>
                    <p className="text-gray-400 mt-1">Manage server moderation and view cases</p>
                </div>
                <Link
                    href="/dashboard/moderation/cases"
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors"
                >
                    View All Cases
                </Link>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title="Total Cases"
                    value={stats?.totalCases || 0}
                    icon="📊"
                    color="blue"
                />
                <StatCard
                    title="Active Cases"
                    value={stats?.activeCases || 0}
                    icon="🔴"
                    color="red"
                />
                <StatCard
                    title="Today"
                    value={stats?.casesToday || 0}
                    icon="📅"
                    color="green"
                />
                <StatCard
                    title="This Week"
                    value={stats?.casesThisWeek || 0}
                    icon="📈"
                    color="purple"
                />
            </div>

            {/* Case Type Breakdown */}
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
                <h2 className="text-xl font-semibold text-white mb-4">Cases by Type</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <TypeCard
                        type="Bans"
                        count={stats?.casesByType.ban || 0}
                        icon="🔨"
                        color="red"
                    />
                    <TypeCard
                        type="Kicks"
                        count={stats?.casesByType.kick || 0}
                        icon="👢"
                        color="orange"
                    />
                    <TypeCard
                        type="Mutes"
                        count={stats?.casesByType.mute || 0}
                        icon="🔇"
                        color="yellow"
                    />
                    <TypeCard
                        type="Warnings"
                        count={stats?.casesByType.warn || 0}
                        icon="⚠️"
                        color="blue"
                    />
                </div>
            </div>

            {/* Recent Cases */}
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-semibold text-white">Recent Cases</h2>
                    <Link
                        href="/dashboard/moderation/cases"
                        className="text-indigo-400 hover:text-indigo-300 text-sm transition-colors"
                    >
                        View All →
                    </Link>
                </div>

                {recentCases.length === 0 ? (
                    <div className="text-center py-12 text-gray-400">
                        <p className="text-lg">No moderation cases yet</p>
                        <p className="text-sm mt-2">Cases will appear here as moderators take action</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {recentCases.map((case_) => (
                            <Link
                                key={case_.caseNumber}
                                href={`/dashboard/moderation/cases/${case_.caseNumber}`}
                                className="block p-4 bg-gray-700/30 hover:bg-gray-700/50 rounded-lg transition-colors border border-gray-600/50"
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-4">
                                        <div className="flex-shrink-0">
                                            <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-gray-600 text-white font-semibold">
                                                #{case_.caseNumber}
                                            </span>
                                        </div>
                                        <div>
                                            <div className="flex items-center space-x-2">
                                                <span className={`px-2 py-1 rounded text-xs font-medium ${getCaseTypeColor(case_.type)}`}>
                                                    {case_.type.toUpperCase()}
                                                </span>
                                                {case_.isActive && (
                                                    <span className="px-2 py-1 rounded text-xs font-medium bg-green-500/20 text-green-400">
                                                        Active
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-sm text-gray-300 mt-1">
                                                {case_.reason || 'No reason provided'}
                                            </p>
                                            <p className="text-xs text-gray-500 mt-1">
                                                {new Date(case_.createdAt).toLocaleString()}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-xs text-gray-400">Target</p>
                                        <p className="text-sm text-gray-300 font-mono">{case_.targetId.slice(0, 8)}...</p>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>

            {/* Quick Actions */}
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
                <h2 className="text-xl font-semibold text-white mb-4">Quick Actions</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <QuickActionButton
                        label="View Cases"
                        icon="📋"
                        href="/dashboard/moderation/cases"
                    />
                    <QuickActionButton
                        label="Auto-Mod Rules"
                        icon="🤖"
                        href="/dashboard/moderation/automod"
                    />
                    <QuickActionButton
                        label="Appeals"
                        icon="📝"
                        href="/dashboard/moderation/appeals"
                    />
                    <QuickActionButton
                        label="Settings"
                        icon="⚙️"
                        href="/dashboard/moderation/settings"
                    />
                </div>
            </div>
        </div>
    );
}

// Helper Components
function StatCard({ title, value, icon, color }: { title: string; value: number; icon: string; color: string }) {
    const colorClasses = {
        blue: 'from-blue-500/20 to-blue-600/20 border-blue-500/50',
        red: 'from-red-500/20 to-red-600/20 border-red-500/50',
        green: 'from-green-500/20 to-green-600/20 border-green-500/50',
        purple: 'from-purple-500/20 to-purple-600/20 border-purple-500/50',
    };

    return (
        <div className={`bg-gradient-to-br ${colorClasses[color as keyof typeof colorClasses]} backdrop-blur-sm rounded-xl p-6 border`}>
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-gray-400 text-sm">{title}</p>
                    <p className="text-3xl font-bold text-white mt-2">{value.toLocaleString()}</p>
                </div>
                <div className="text-4xl">{icon}</div>
            </div>
        </div>
    );
}

function TypeCard({ type, count, icon, color }: { type: string; count: number; icon: string; color: string }) {
    return (
        <div className="bg-gray-700/30 rounded-lg p-4 border border-gray-600/50">
            <div className="flex items-center space-x-3">
                <span className="text-2xl">{icon}</span>
                <div>
                    <p className="text-sm text-gray-400">{type}</p>
                    <p className="text-xl font-bold text-white">{count}</p>
                </div>
            </div>
        </div>
    );
}

function QuickActionButton({ label, icon, href }: { label: string; icon: string; href: string }) {
    return (
        <Link
            href={href}
            className="flex flex-col items-center justify-center p-4 bg-gray-700/30 hover:bg-gray-700/50 rounded-lg transition-colors border border-gray-600/50 group"
        >
            <span className="text-3xl mb-2 group-hover:scale-110 transition-transform">{icon}</span>
            <span className="text-sm text-gray-300 text-center">{label}</span>
        </Link>
    );
}

function getCaseTypeColor(type: string): string {
    const colors: Record<string, string> = {
        ban: 'bg-red-500/20 text-red-400',
        tempban: 'bg-orange-500/20 text-orange-400',
        kick: 'bg-yellow-500/20 text-yellow-400',
        mute: 'bg-blue-500/20 text-blue-400',
        tempmute: 'bg-cyan-500/20 text-cyan-400',
        warn: 'bg-purple-500/20 text-purple-400',
        unban: 'bg-green-500/20 text-green-400',
        unmute: 'bg-teal-500/20 text-teal-400',
    };
    return colors[type] || 'bg-gray-500/20 text-gray-400';
}
