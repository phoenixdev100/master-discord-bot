/**
 * Guild Detail Page
 *
 * Per-server configuration: admin role assignment + quick info.
 */

'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';

interface Role {
    id: string;
    name: string;
    color: number;
    position: number;
    managed: boolean;
}

interface Server {
    id: string;
    name: string;
    icon: string | null;
    ownerId: string;
    memberCount: number;
}

export default function GuildDetailPage() {
    const params = useParams();
    const guildId = params.guildId as string;

    const [server, setServer] = useState<Server | null>(null);
    const [roles, setRoles] = useState<Role[]>([]);
    const [adminRoleId, setAdminRoleId] = useState<string>('');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);

    useEffect(() => {
        load();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [guildId]);

    const load = async () => {
        try {
            const [guildsRes, rolesRes, adminRes] = await Promise.all([
                fetch('/api/dashboard/guilds'),
                fetch(`/api/guilds/${guildId}/discord-roles`),
                fetch(`/api/guilds/${guildId}/admin-role`),
            ]);

            if (guildsRes.ok) {
                const guilds = await guildsRes.json();
                setServer(guilds.find((g: Server) => g.id === guildId) ?? null);
            }
            if (rolesRes.ok) {
                const data = await rolesRes.json();
                setRoles(data.data ?? []);
            }
            if (adminRes.ok) {
                const data = await adminRes.json();
                setAdminRoleId(data.data?.adminRoleId ?? '');
            }
        } catch (error) {
            console.error('Failed to load guild:', error);
        } finally {
            setLoading(false);
        }
    };

    const saveAdminRole = async () => {
        setSaving(true);
        setMessage(null);
        try {
            const res = await fetch(`/api/guilds/${guildId}/admin-role`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ roleId: adminRoleId || null }),
            });
            if (res.ok) {
                setMessage({ type: 'ok', text: '✅ Admin role saved — takes effect within ~60 seconds.' });
            } else {
                const err = await res.json().catch(() => ({}));
                setMessage({ type: 'err', text: `❌ ${err.error ?? 'Failed to save'}` });
            }
        } catch {
            setMessage({ type: 'err', text: '❌ Failed to save admin role' });
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-32">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-fade-in">
            <Link href="/dashboard/servers" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                ← Back to servers
            </Link>

            {/* Header */}
            <div className="flex items-center gap-5">
                <div className="w-20 h-20 rounded-2xl bg-secondary flex items-center justify-center overflow-hidden border border-border/50">
                    {server?.icon ? (
                        <img src={`https://cdn.discordapp.com/icons/${guildId}/${server.icon}.png`} alt="" className="w-full h-full object-cover" />
                    ) : (
                        <span className="text-2xl font-bold text-muted-foreground">{server?.name?.slice(0, 2).toUpperCase() ?? '??'}</span>
                    )}
                </div>
                <div>
                    <h1 className="text-3xl font-bold text-foreground">{server?.name ?? 'Server'}</h1>
                    <p className="text-muted-foreground text-sm mt-1">{server?.memberCount ?? 0} members • {guildId}</p>
                </div>
            </div>

            {/* Admin Role Card */}
            <div className="glass rounded-xl p-6 border border-border/50 max-w-2xl">
                <h2 className="text-xl font-bold text-foreground mb-1">🛡️ Bot Admin Role</h2>
                <p className="text-sm text-muted-foreground mb-6">
                    Members with this role can use <strong>admin commands</strong> (/announce, /purge, /roleall, /audit, …)
                    even without raw Discord permissions. Enforced by the bot — takes effect within ~60 seconds.
                </p>

                <label className="block text-sm font-medium text-foreground mb-2">Admin role</label>
                <div className="flex gap-3">
                    <select
                        value={adminRoleId}
                        onChange={(e) => setAdminRoleId(e.target.value)}
                        className="flex-1 bg-secondary/50 border border-border rounded-lg px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                    >
                        <option value="">— No admin role (Discord permissions only) —</option>
                        {roles.map((r) => (
                            <option key={r.id} value={r.id} disabled={r.managed}>
                                {r.name}{r.managed ? ' (managed)' : ''}
                            </option>
                        ))}
                    </select>
                    <button
                        onClick={saveAdminRole}
                        disabled={saving}
                        className="bg-primary hover:bg-primary/90 disabled:opacity-50 text-primary-foreground px-6 py-2.5 rounded-lg text-sm font-medium transition-colors"
                    >
                        {saving ? 'Saving…' : 'Save'}
                    </button>
                </div>

                {message && (
                    <p className={`mt-4 text-sm ${message.type === 'ok' ? 'text-green-500' : 'text-red-500'}`}>
                        {message.text}
                    </p>
                )}
            </div>
        </div>
    );
}
