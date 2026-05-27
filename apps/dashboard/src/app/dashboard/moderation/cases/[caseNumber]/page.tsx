/**
 * Moderation Case Detail Page
 * 
 * View and edit individual moderation case details.
 */

'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';

interface CaseDetail {
    id: string;
    caseNumber: number;
    guildId: string;
    type: string;
    targetId: string;
    moderatorId: string;
    reason: string;
    duration?: number;
    expiresAt?: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

export default function CaseDetailPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const params = useParams();
    const caseNumber = params?.caseNumber as string;

    const [caseData, setCaseData] = useState<CaseDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState(false);
    const [editReason, setEditReason] = useState('');
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/login');
        }
    }, [status, router]);

    useEffect(() => {
        if (session && caseNumber) {
            fetchCase();
        }
    }, [session, caseNumber]);

    const fetchCase = async () => {
        try {
            setLoading(true);
            const guildId = 'YOUR_GUILD_ID'; // TODO: Get from context

            const res = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/api/guilds/${guildId}/moderation/cases/${caseNumber}`
            );
            const data = await res.json();

            if (data.success) {
                setCaseData(data.case);
                setEditReason(data.case.reason || '');
            } else {
                router.push('/dashboard/moderation/cases');
            }

            setLoading(false);
        } catch (error) {
            console.error('Failed to fetch case:', error);
            setLoading(false);
        }
    };

    const handleSave = async () => {
        if (!caseData) return;

        try {
            setSaving(true);
            const guildId = 'YOUR_GUILD_ID';

            const res = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/api/guilds/${guildId}/moderation/cases/${caseNumber}`,
                {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ reason: editReason }),
                }
            );

            const data = await res.json();

            if (data.success) {
                setCaseData(data.case);
                setEditing(false);
            }

            setSaving(false);
        } catch (error) {
            console.error('Failed to update case:', error);
            setSaving(false);
        }
    };

    const handleToggleActive = async () => {
        if (!caseData) return;

        try {
            const guildId = 'YOUR_GUILD_ID';

            const res = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/api/guilds/${guildId}/moderation/cases/${caseNumber}`,
                {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ isActive: !caseData.isActive }),
                }
            );

            const data = await res.json();

            if (data.success) {
                setCaseData(data.case);
            }
        } catch (error) {
            console.error('Failed to toggle case status:', error);
        }
    };

    const handleDelete = async () => {
        if (!caseData || !confirm('Are you sure you want to delete this case?')) return;

        try {
            const guildId = 'YOUR_GUILD_ID';

            const res = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/api/guilds/${guildId}/moderation/cases/${caseNumber}`,
                {
                    method: 'DELETE',
                }
            );

            const data = await res.json();

            if (data.success) {
                router.push('/dashboard/moderation/cases');
            }
        } catch (error) {
            console.error('Failed to delete case:', error);
        }
    };

    if (status === 'loading' || loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
            </div>
        );
    }

    if (!caseData) {
        return (
            <div className="text-center py-12">
                <p className="text-gray-400">Case not found</p>
                <Link
                    href="/dashboard/moderation/cases"
                    className="text-indigo-400 hover:text-indigo-300 mt-4 inline-block"
                >
                    ← Back to Cases
                </Link>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <div className="flex items-center space-x-3">
                        <h1 className="text-3xl font-bold text-white">Case #{caseData.caseNumber}</h1>
                        <span className={`px-3 py-1 rounded-lg text-sm font-medium ${getCaseTypeColor(caseData.type)}`}>
                            {caseData.type.toUpperCase()}
                        </span>
                        {caseData.isActive ? (
                            <span className="px-3 py-1 rounded-lg text-sm font-medium bg-green-500/20 text-green-400">
                                Active
                            </span>
                        ) : (
                            <span className="px-3 py-1 rounded-lg text-sm font-medium bg-gray-500/20 text-gray-400">
                                Inactive
                            </span>
                        )}
                    </div>
                    <p className="text-gray-400 mt-1">
                        Created {new Date(caseData.createdAt).toLocaleString()}
                    </p>
                </div>
                <Link
                    href="/dashboard/moderation/cases"
                    className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
                >
                    ← Back to Cases
                </Link>
            </div>

            {/* Case Details */}
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
                <h2 className="text-xl font-semibold text-white mb-4">Case Information</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <InfoField label="Case Number" value={`#${caseData.caseNumber}`} />
                    <InfoField label="Type" value={caseData.type.toUpperCase()} />
                    <InfoField label="Target User ID" value={caseData.targetId} mono />
                    <InfoField label="Moderator ID" value={caseData.moderatorId} mono />
                    <InfoField label="Created At" value={new Date(caseData.createdAt).toLocaleString()} />
                    <InfoField label="Updated At" value={new Date(caseData.updatedAt).toLocaleString()} />

                    {caseData.duration && (
                        <InfoField
                            label="Duration"
                            value={formatDuration(caseData.duration)}
                        />
                    )}

                    {caseData.expiresAt && (
                        <InfoField
                            label="Expires At"
                            value={new Date(caseData.expiresAt).toLocaleString()}
                        />
                    )}
                </div>
            </div>

            {/* Reason */}
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-semibold text-white">Reason</h2>
                    {!editing && (
                        <button
                            onClick={() => setEditing(true)}
                            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors text-sm"
                        >
                            Edit Reason
                        </button>
                    )}
                </div>

                {editing ? (
                    <div className="space-y-4">
                        <textarea
                            value={editReason}
                            onChange={(e) => setEditReason(e.target.value)}
                            className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 min-h-[100px]"
                            placeholder="Enter reason..."
                        />
                        <div className="flex items-center space-x-3">
                            <button
                                onClick={handleSave}
                                disabled={saving}
                                className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white rounded-lg transition-colors"
                            >
                                {saving ? 'Saving...' : 'Save'}
                            </button>
                            <button
                                onClick={() => {
                                    setEditing(false);
                                    setEditReason(caseData.reason || '');
                                }}
                                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                ) : (
                    <p className="text-gray-300 whitespace-pre-wrap">
                        {caseData.reason || 'No reason provided'}
                    </p>
                )}
            </div>

            {/* Actions */}
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
                <h2 className="text-xl font-semibold text-white mb-4">Actions</h2>

                <div className="flex flex-wrap gap-3">
                    <button
                        onClick={handleToggleActive}
                        className={`px-4 py-2 rounded-lg transition-colors ${caseData.isActive
                                ? 'bg-yellow-600 hover:bg-yellow-700 text-white'
                                : 'bg-green-600 hover:bg-green-700 text-white'
                            }`}
                    >
                        {caseData.isActive ? 'Deactivate Case' : 'Reactivate Case'}
                    </button>

                    <button
                        onClick={handleDelete}
                        className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                    >
                        Delete Case
                    </button>

                    <Link
                        href={`/dashboard/moderation/cases`}
                        className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors inline-block"
                    >
                        View All Cases
                    </Link>
                </div>
            </div>

            {/* Timeline (Future Enhancement) */}
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
                <h2 className="text-xl font-semibold text-white mb-4">Timeline</h2>
                <div className="space-y-4">
                    <TimelineItem
                        icon="📝"
                        title="Case Created"
                        description={`Case #${caseData.caseNumber} was created`}
                        timestamp={caseData.createdAt}
                    />
                    {caseData.updatedAt !== caseData.createdAt && (
                        <TimelineItem
                            icon="✏️"
                            title="Case Updated"
                            description="Case details were modified"
                            timestamp={caseData.updatedAt}
                        />
                    )}
                    {caseData.expiresAt && new Date(caseData.expiresAt) < new Date() && (
                        <TimelineItem
                            icon="⏰"
                            title="Case Expired"
                            description="Temporary action has expired"
                            timestamp={caseData.expiresAt}
                        />
                    )}
                </div>
            </div>
        </div>
    );
}

// Helper Components
function InfoField({ label, value, mono = false }: { label: string; value: string; mono?: boolean }) {
    return (
        <div>
            <p className="text-sm text-gray-400 mb-1">{label}</p>
            <p className={`text-white ${mono ? 'font-mono text-sm' : ''}`}>{value}</p>
        </div>
    );
}

function TimelineItem({ icon, title, description, timestamp }: { icon: string; title: string; description: string; timestamp: string }) {
    return (
        <div className="flex items-start space-x-4">
            <div className="flex-shrink-0 w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center text-xl">
                {icon}
            </div>
            <div className="flex-1">
                <p className="text-white font-medium">{title}</p>
                <p className="text-sm text-gray-400">{description}</p>
                <p className="text-xs text-gray-500 mt-1">{new Date(timestamp).toLocaleString()}</p>
            </div>
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

function formatDuration(seconds: number): string {
    if (seconds < 60) return `${seconds} seconds`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)} minutes`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours`;
    return `${Math.floor(seconds / 86400)} days`;
}
