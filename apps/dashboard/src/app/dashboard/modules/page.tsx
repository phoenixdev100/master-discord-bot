/**
 * Modules Page
 * 
 * Manage global modules and their default states.
 */

'use client';

import { useState, useEffect } from 'react';

interface Module {
    id: string;
    name: string;
    description: string | null;
    category: string;
    isDefault: boolean;
    enabledInGuilds: number;
    totalGuilds: number;
}

export default function ModulesPage() {
    const [modules, setModules] = useState<Module[]>([]);
    const [loading, setLoading] = useState(true);
    const [toggling, setToggling] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');

    useEffect(() => {
        fetchModules();
    }, []);

    const fetchModules = async () => {
        try {
            const response = await fetch('/api/dashboard/modules');
            if (response.ok) {
                const data = await response.json();
                setModules(data);
            }
        } catch (error) {
            console.error('Failed to fetch modules:', error);
        } finally {
            setLoading(false);
        }
    };

    const toggleModuleDefault = async (module: Module) => {
        setToggling(module.id);
        try {
            const response = await fetch(`/api/dashboard/modules/${module.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ isDefault: !module.isDefault })
            });

            if (response.ok) {
                setModules(modules.map(m =>
                    m.id === module.id ? { ...m, isDefault: !m.isDefault } : m
                ));
            }
        } catch (error) {
            console.error('Failed to toggle module:', error);
        } finally {
            setToggling(null);
        }
    };

    const categories = ['all', ...Array.from(new Set(modules.map(m => m.category)))];

    const filteredModules = modules.filter(module => {
        const matchesCategory = selectedCategory === 'all' || module.category === selectedCategory;
        const matchesSearch = module.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (module.description && module.description.toLowerCase().includes(searchQuery.toLowerCase()));
        return matchesCategory && matchesSearch;
    });

    return (
        <div className="space-y-8 animate-fade-in">
            {/* Header */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 p-8 text-white">
                <div className="absolute inset-0 bg-grid-white/10"></div>
                <div className="relative z-10">
                    <h1 className="text-4xl font-bold mb-2">Bot Modules</h1>
                    <p className="text-white/90 text-lg">
                        Manage available features and their default states for new servers
                    </p>
                </div>
            </div>

            {/* Filter & Search */}
            <div className="glass rounded-lg p-6 flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                    <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <input
                        type="text"
                        placeholder="Search modules..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-secondary rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
                    />
                </div>
                <div className="flex gap-2 overflow-x-auto">
                    {categories.map(category => (
                        <button
                            key={category}
                            onClick={() => setSelectedCategory(category)}
                            className={`px-4 py-2 rounded-lg whitespace-nowrap capitalize transition-colors ${selectedCategory === category
                                    ? 'bg-primary text-primary-foreground'
                                    : 'bg-secondary text-foreground hover:bg-secondary/80'
                                }`}
                        >
                            {category}
                        </button>
                    ))}
                </div>
            </div>

            {/* Modules Grid */}
            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                        <div key={i} className="h-48 rounded-xl bg-secondary/50 animate-pulse border border-border/50"></div>
                    ))}
                </div>
            ) : filteredModules.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredModules.map((module) => (
                        <div
                            key={module.id}
                            className="group relative overflow-hidden rounded-xl bg-card border border-border/50 p-6 hover:border-primary/50 transition-all duration-300 shadow-sm hover:shadow-lg"
                        >
                            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-primary/10 to-transparent rounded-bl-full -mr-10 -mt-10 transition-transform group-hover:scale-110"></div>

                            <div className="relative">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="p-3 rounded-lg bg-primary/10 text-primary">
                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                                        </svg>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs text-muted-foreground">Default:</span>
                                        <button
                                            onClick={() => toggleModuleDefault(module)}
                                            disabled={toggling === module.id}
                                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background ${module.isDefault ? 'bg-primary' : 'bg-secondary'
                                                } ${toggling === module.id ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                                        >
                                            <span
                                                className={`${module.isDefault ? 'translate-x-6' : 'translate-x-1'
                                                    } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
                                            />
                                        </button>
                                    </div>
                                </div>

                                <h3 className="text-xl font-bold mb-2">{module.name}</h3>
                                <p className="text-sm text-muted-foreground mb-4 h-10 line-clamp-2">
                                    {module.description || 'No description provided.'}
                                </p>

                                <div className="flex items-center justify-between text-xs text-muted-foreground mt-4 pt-4 border-t border-border/50">
                                    <span className="bg-secondary px-2 py-1 rounded capitalize">
                                        {module.category}
                                    </span>
                                    <span>
                                        in {module.enabledInGuilds} servers
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-20 rounded-xl bg-card/50 border border-border/50 border-dashed">
                    <p className="text-muted-foreground">No modules found matching filters.</p>
                </div>
            )}
        </div>
    );
}
