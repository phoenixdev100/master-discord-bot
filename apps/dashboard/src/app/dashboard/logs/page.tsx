/**
 * Audit Logs Page
 * 
 * View system-wide audit logs.
 */

'use client';

import { useState, useEffect } from 'react';

interface Log {
    id: string;
    action: string;
    server: string;
    user: string;
    resource: string;
    time: string;
    icon: string;
}

export default function LogsPage() {
    const [logs, setLogs] = useState<Log[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    useEffect(() => {
        fetchLogs(page);
    }, [page]);

    const fetchLogs = async (pageNum: number) => {
        setLoading(true);
        try {
            const response = await fetch(`/api/dashboard/logs?page=${pageNum}&limit=20`);
            if (response.ok) {
                const data = await response.json();
                setLogs(data.logs);
                setTotalPages(data.pagination.pages);
            }
        } catch (error) {
            console.error('Failed to fetch logs:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-400 to-pink-500 bg-clip-text text-transparent">
                    Audit Logs
                </h1>
                <p className="text-muted-foreground mt-1">
                    Track all activities and events across the system
                </p>
            </div>

            {/* Logs Table */}
            <div className="glass rounded-xl overflow-hidden border border-border/50">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-secondary/50 border-b border-border/50">
                                <th className="p-4 font-medium text-muted-foreground">Action</th>
                                <th className="p-4 font-medium text-muted-foreground">User</th>
                                <th className="p-4 font-medium text-muted-foreground">Server</th>
                                <th className="p-4 font-medium text-muted-foreground">Resource</th>
                                <th className="p-4 font-medium text-muted-foreground">Time</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border/50">
                            {loading ? (
                                Array.from({ length: 5 }).map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                        <td className="p-4"><div className="h-4 w-24 bg-secondary rounded"></div></td>
                                        <td className="p-4"><div className="h-4 w-32 bg-secondary rounded"></div></td>
                                        <td className="p-4"><div className="h-4 w-32 bg-secondary rounded"></div></td>
                                        <td className="p-4"><div className="h-4 w-20 bg-secondary rounded"></div></td>
                                        <td className="p-4"><div className="h-4 w-24 bg-secondary rounded"></div></td>
                                    </tr>
                                ))
                            ) : logs.length > 0 ? (
                                logs.map((log) => (
                                    <tr key={log.id} className="group hover:bg-secondary/30 transition-colors">
                                        <td className="p-4">
                                            <div className="flex items-center gap-3">
                                                <span className="text-xl">{log.icon}</span>
                                                <span className="font-medium text-foreground">{log.action}</span>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <div className="flex items-center gap-2">
                                                <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold text-primary">
                                                    {log.user.charAt(0).toUpperCase()}
                                                </div>
                                                <span className="text-sm">{log.user}</span>
                                            </div>
                                        </td>
                                        <td className="p-4 text-sm text-muted-foreground">{log.server}</td>
                                        <td className="p-4">
                                            <code className="px-2 py-1 rounded bg-secondary text-xs">{log.resource}</code>
                                        </td>
                                        <td className="p-4 text-sm text-muted-foreground">
                                            {new Date(log.time).toLocaleString()}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={5} className="p-8 text-center text-muted-foreground">
                                        No logs found
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div className="p-4 border-t border-border/50 flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">
                        Page {page} of {totalPages}
                    </span>
                    <div className="flex gap-2">
                        <button
                            onClick={() => setPage(p => Math.max(1, p - 1))}
                            disabled={page === 1}
                            className="px-3 py-1 rounded bg-secondary hover:bg-secondary/80 disabled:opacity-50 text-sm transition-colors"
                        >
                            Previous
                        </button>
                        <button
                            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                            disabled={page === totalPages}
                            className="px-3 py-1 rounded bg-secondary hover:bg-secondary/80 disabled:opacity-50 text-sm transition-colors"
                        >
                            Next
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
