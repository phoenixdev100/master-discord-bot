/**
 * Settings Page
 * 
 * Manage system-wide configuration.
 */

'use client';

import { useState, useEffect } from 'react';

export default function SettingsPage() {
    const [settings, setSettings] = useState<Record<string, any>>({});
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            const response = await fetch('/api/dashboard/settings');
            if (response.ok) {
                const data = await response.json();
                setSettings(data);
            }
        } catch (error) {
            console.error('Failed to fetch settings:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setMessage(null);

        try {
            const response = await fetch('/api/dashboard/settings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(settings)
            });

            if (response.ok) {
                setMessage({ type: 'success', text: 'Settings saved successfully!' });
            } else {
                setMessage({ type: 'error', text: 'Failed to save settings.' });
            }
        } catch (error) {
            setMessage({ type: 'error', text: 'An error occurred.' });
        } finally {
            setSaving(false);
        }
    };

    const handleChange = (key: string, value: any) => {
        setSettings(prev => ({ ...prev, [key]: value }));
    };

    return (
        <div className="space-y-8 animate-fade-in max-w-4xl mx-auto">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-200 to-gray-400 bg-clip-text text-transparent">
                    System Settings
                </h1>
                <p className="text-muted-foreground mt-1">
                    Configure global bot settings and preferences
                </p>
            </div>

            {loading ? (
                <div className="space-y-6">
                    <div className="h-32 rounded-xl bg-secondary/50 animate-pulse"></div>
                    <div className="h-32 rounded-xl bg-secondary/50 animate-pulse"></div>
                </div>
            ) : (
                <form onSubmit={handleSave} className="space-y-8">
                    {/* General Settings */}
                    <div className="glass rounded-xl p-6 border border-border/50">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-2 rounded-lg bg-primary/10 text-primary">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                            </div>
                            <h2 className="text-xl font-bold">General</h2>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-foreground">Bot Name</label>
                                <input
                                    type="text"
                                    value={settings.botName || ''}
                                    onChange={(e) => handleChange('botName', e.target.value)}
                                    placeholder="My Awesome Bot"
                                    className="w-full px-4 py-2 bg-secondary/50 rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-foreground">Owner ID</label>
                                <input
                                    type="text"
                                    value={settings.ownerId || ''}
                                    onChange={(e) => handleChange('ownerId', e.target.value)}
                                    placeholder="Enter your Discord ID"
                                    className="w-full px-4 py-2 bg-secondary/50 rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                                />
                            </div>
                            <div className="space-y-2 md:col-span-2">
                                <label className="text-sm font-medium text-foreground">Status Message</label>
                                <input
                                    type="text"
                                    value={settings.statusMessage || ''}
                                    onChange={(e) => handleChange('statusMessage', e.target.value)}
                                    placeholder="Listening to commands..."
                                    className="w-full px-4 py-2 bg-secondary/50 rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Branding Settings */}
                    <div className="glass rounded-xl p-6 border border-border/50">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-2 rounded-lg bg-pink-500/10 text-pink-500">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                                </svg>
                            </div>
                            <h2 className="text-xl font-bold">Branding</h2>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-foreground">Dashboard Theme</label>
                                <select
                                    value={settings.theme || 'dark'}
                                    onChange={(e) => handleChange('theme', e.target.value)}
                                    className="w-full px-4 py-2 bg-secondary/50 rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                                >
                                    <option value="dark">Dark</option>
                                    <option value="light">Light</option>
                                    <option value="system">System</option>
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-foreground">Primary Color</label>
                                <input
                                    type="color"
                                    value={settings.primaryColor || '#6366f1'}
                                    onChange={(e) => handleChange('primaryColor', e.target.value)}
                                    className="w-full h-10 rounded-lg cursor-pointer"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Save Button */}
                    <div className="flex items-center justify-between pt-4">
                        {message && (
                            <div className={`text-sm ${message.type === 'success' ? 'text-green-500' : 'text-red-500'}`}>
                                {message.text}
                            </div>
                        )}
                        <button
                            type="submit"
                            disabled={saving}
                            className={`ml-auto px-8 py-3 bg-primary text-primary-foreground rounded-xl font-bold shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/40 hover:-translate-y-1 transition-all duration-300 ${saving ? 'opacity-70 cursor-not-allowed' : ''
                                }`}
                        >
                            {saving ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                </form>
            )}
        </div>
    );
}
