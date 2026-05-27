/**
 * Moderation Cases List Page
 * 
 * Filterable and paginated list of all moderation cases.
 */

'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Case {
    caseNumber: number;
    type: string;
    targetId: string;
    moderatorId: string;
    reason: string;
    createdAt: string;
    isActive: boolean;
    duration?: number;
    expiresAt?: string;
}

export default function ModerationCasesPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [cases, setCases] = useState<Case[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [filters, setFilters] = useState({
        type: '',
        isActive: '',
        search: '',
    });

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/login');
        }
    }, [status, router]);

    useEffect(() => {
        if (session) {
            fetchCases();
        }
    }, [session, page, filters]);

    const fetchCases = async () => {
        try {
            setLoading(true);
            const guildId = 'YOUR_GUILD_ID'; // TODO: Get from context

            const params = new URLSearchParams({
                page: page.toString(),
                limit: '20',
                ...(filters.type && { type: filters.type }),
                ...(filters.isActive && { isActive: filters.isActive }),
            });

            const res = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/api/guilds/${guildId}/moderation/cases?${params}`
            );
            const data = await res.json();

            if (data.success) {
                setCases(data.cases);
                setTotalPages(data.pagination.pages);
            }

            setLoading(false);
        } catch (error) {
            console.error('Failed to fetch cases:', error);
            setLoading(false);
        }
    };

    const handleFilterChange = (key: string, value: string) => {
        setFilters(prev => ({ ...prev, [key]: value }));
        setPage(1); // Reset to first page
    };

    if (status === 'loading') {
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
                    <h1 className="text-3xl font-bold text-white">Moderation Cases</h1>
                    <p className="text-gray-400 mt-1">View and manage all moderation actions</p>
                </div>
                <Link
                    href="/dashboard/moderation"
                    className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
                >
                    ← Back to Overview
                </Link>
            </div>

            {/* Filters */}
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {/* Search */}
                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                            Search
                        </label>
                        <input
                            type="text"
                            placeholder="Search by user ID, case number..."
                            value={filters.search}
                            onChange={(e) => handleFilterChange('search', e.target.value)}
                            className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                    </div>

                    {/* Type Filter */}
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                            Type
                        </label>
                        <select
                            value={filters.type}
                            onChange={(e) => handleFilterChange('type', e.target.value)}
                            className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        >
                            <option value="">All Types</option>
                            <option value="ban">Ban</option>
                            <option value="tempban">Temp Ban</option>
                            <option value="kick">Kick</option>
                            <option value="mute">Mute</option>
                            <option value="tempmute">Temp Mute</option>
                            <option value="warn">Warning</option>
                            <option value="unban">Unban</option>
                            <option value="unmute">Unmute</option>
                        </select>
                    </div>

                    {/* Status Filter */}
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                            Status
                        </label>
                        <select
                            value={filters.isActive}
                            onChange={(e) => handleFilterChange('isActive', e.target.value)}
                            className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        >
                            <option value="">All Status</option>
                            <option value="true">Active</option>
                            <option value="false">Inactive</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Cases Table */}
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700 overflow-hidden">
                {loading ? (
                    <div className="flex items-center justify-center py-12">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
                    </div>
                ) : cases.length === 0 ? (
                    <div className="text-center py-12 text-gray-400">
                        <p className="text-lg">No cases found</p>
                        <p className="text-sm mt-2">Try adjusting your filters</p>
                    </div>
                ) : (
                    <>
                        {/* Desktop Table */}
                        <div className="hidden md:block overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-700/50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                                            Case #
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                                            Type
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                                            Target
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                                            Reason
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                                            Date
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                                            Status
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-700">
                                    {cases.map((case_) => (
                                        <tr key={case_.caseNumber} className="hover:bg-gray-700/30 transition-colors">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className="text-sm font-medium text-white">#{case_.caseNumber}</span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`px-2 py-1 rounded text-xs font-medium ${getCaseTypeColor(case_.type)}`}>
                                                    {case_.type.toUpperCase()}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className="text-sm text-gray-300 font-mono">{case_.targetId.slice(0, 12)}...</span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="text-sm text-gray-300 line-clamp-2">
                                                    {case_.reason || 'No reason provided'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className="text-sm text-gray-400">
                                                    {new Date(case_.createdAt).toLocaleDateString()}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                {case_.isActive ? (
                                                    <span className="px-2 py-1 rounded text-xs font-medium bg-green-500/20 text-green-400">
                                                        Active
                                                    </span>
                                                ) : (
                                                    <span className="px-2 py-1 rounded text-xs font-medium bg-gray-500/20 text-gray-400">
                                                        Inactive
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <Link
                                                    href={`/dashboard/moderation/cases/${case_.caseNumber}`}
                                                    className="text-indigo-400 hover:text-indigo-300 text-sm transition-colors"
                                                >
                                                    View →
                                                </Link>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Mobile Cards */}
                        <div className="md:hidden divide-y divide-gray-700">
                            {cases.map((case_) => (
                                <Link
                                    key={case_.caseNumber}
                                    href={`/dashboard/moderation/cases/${case_.caseNumber}`}
                                    className="block p-4 hover:bg-gray-700/30 transition-colors"
                                >
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-sm font-medium text-white">Case #{case_.caseNumber}</span>
                                        <span className={`px-2 py-1 rounded text-xs font-medium ${getCaseTypeColor(case_.type)}`}>
                                            {case_.type.toUpperCase()}
                                        </span>
                                    </div>
                                    <p className="text-sm text-gray-300 mb-2">{case_.reason || 'No reason provided'}</p>
                                    <div className="flex items-center justify-between text-xs text-gray-400">
                                        <span>{new Date(case_.createdAt).toLocaleDateString()}</span>
                                        {case_.isActive ? (
                                            <span className="text-green-400">Active</span>
                                        ) : (
                                            <span className="text-gray-500">Inactive</span>
                                        )}
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </>
                )}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex items-center justify-center space-x-2">
                    <button
                        onClick={() => setPage(p => Math.max(1, p - 1))}
                        disabled={page === 1}
                        className="px-4 py-2 bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 disabled:text-gray-600 text-white rounded-lg transition-colors"
                    >
                        Previous
                    </button>
                    <span className="text-gray-400">
                        Page {page} of {totalPages}
                    </span>
                    <button
                        onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                        disabled={page === totalPages}
                        className="px-4 py-2 bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 disabled:text-gray-600 text-white rounded-lg transition-colors"
                    >
                        Next
                    </button>
                </div>
            )}
        </div>
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
