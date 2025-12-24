"use client";

import { useWatchHistory } from "@/hooks/useWatchHistory";
import { History, Play, X, Trash2 } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { AnimeHoverCard } from "./AnimeHoverCard";

export function ContinueWatching() {
    const { history, removeFromHistory, clearHistory } = useWatchHistory();

    if (!history || history.length === 0) return null;

    return (
        <section className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex items-center justify-between px-4 md:px-0">
                <div className="flex items-center gap-2">
                    <History className="w-5 h-5 text-primary" />
                    <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-white">Continue Watching</h2>
                </div>
                <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => {
                        if (confirm("Are you sure you want to clear your entire watch history?")) {
                            clearHistory();
                        }
                    }}
                    className="text-white/50 hover:text-red-500 hover:bg-red-500/10 transition-colors"
                >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Clear All
                </Button>
            </div>
            
            <div className="relative">
                <div className="flex overflow-x-auto gap-4 pb-4 px-4 md:px-0 scrollbar-hide">
                    {history.map((item) => (
                        <div key={item.anime.id} className="group relative w-[240px] md:w-[300px] flex-shrink-0">
                            <button 
                                onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    removeFromHistory(item.anime.id);
                                }}
                                className="absolute top-2 right-2 z-20 p-2 bg-black/60 hover:bg-red-500 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-300 backdrop-blur-sm"
                                title="Remove from history"
                            >
                                <X className="w-4 h-4" />
                            </button>
                            <AnimeHoverCard anime={item.anime}>
                                <Link 
                                    href={`/watch/${item.episode.id}${item.episode.id.includes('?') ? '&' : '?'}animeId=${item.anime.id}`}
                                    className="block space-y-3"
                                >
                                    <div className="relative aspect-video rounded-xl overflow-hidden ring-1 ring-white/10 group-hover:ring-primary/50 transition-all duration-300">
                                        <Image 
                                            src={item.episode.image || item.anime.image} 
                                            alt={item.anime.title.userPreferred}
                                            fill
                                            className="object-cover group-hover:scale-105 transition-transform duration-500"
                                            sizes="(max-width: 768px) 240px, 300px"
                                        />
                                        <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors" />
                                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                            <div className="bg-primary p-3 rounded-full shadow-lg transform translate-y-2 group-hover:translate-y-0 transition-transform">
                                                <Play className="w-6 h-6 text-primary-foreground fill-current" />
                                            </div>
                                        </div>
                                        
                                        {/* Progress Bar */}
                                        <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20">
                                            <div 
                                                className="h-full bg-primary" 
                                                style={{ width: `${Math.min((item.timestamp / item.duration) * 100, 100)}%` }}
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-1">
                                        <h3 className="font-semibold text-white truncate group-hover:text-primary transition-colors">
                                            {item.anime.title.userPreferred}
                                        </h3>
                                        <p className="text-xs text-white/50 font-medium uppercase tracking-wider">
                                            Episode {item.episode.number} {item.duration > 0 && `• ${Math.max(0, Math.floor((item.duration - item.timestamp) / 60))}m left`}
                                        </p>
                                    </div>
                                </Link>
                            </AnimeHoverCard>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
