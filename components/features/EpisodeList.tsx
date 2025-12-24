"use client";

import { useState, useMemo } from "react";
import { Episode } from "@/lib/api/types";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown } from "lucide-react";

interface EpisodeListProps {
  episodes: Episode[];
  currentEpisodeId?: string;
  animeId: string;
}

export function EpisodeList({ episodes, currentEpisodeId, animeId }: EpisodeListProps) {
  // Sort episodes
  const sortedEpisodes = useMemo(() => {
    return [...episodes].sort((a, b) => a.number - b.number);
  }, [episodes]);

  const [page, setPage] = useState(1);
  const itemsPerPage = 48; 
  const totalPages = Math.ceil(sortedEpisodes.length / itemsPerPage);
  const [isOpen, setIsOpen] = useState(true); // Default to open

  // Synchronize page when currentEpisodeId changes or on initial load
  const [lastSyncedId, setLastSyncedId] = useState<string | undefined>(undefined);
  
  if (currentEpisodeId && currentEpisodeId !== lastSyncedId && sortedEpisodes.length > 0) {
      // Find index with robust matching
      let index = sortedEpisodes.findIndex(e => e.id === currentEpisodeId);
      
      // Fuzzy matching if exact ID fails
      if (index === -1) {
          const baseId = currentEpisodeId.split('?')[0];
          index = sortedEpisodes.findIndex(e => e.id.split('?')[0] === baseId);
      }
      
      if (index === -1) {
          const match = currentEpisodeId.match(/-(\d+)(\?|$)/);
          if (match) {
              const epNum = parseInt(match[1]);
              index = sortedEpisodes.findIndex(e => e.number === epNum);
          }
      }

      if (index !== -1) {
        const targetPage = Math.floor(index / itemsPerPage) + 1;
        if (page !== targetPage) {
            setPage(targetPage);
        }
        setLastSyncedId(currentEpisodeId);
        if (!isOpen) setIsOpen(true); // Auto-open if navigating to an episode
      }
  }

  // Calculate current slice
  const paginatedEpisodes = useMemo(() => {
    const start = (page - 1) * itemsPerPage;
    return sortedEpisodes.slice(start, start + itemsPerPage);
  }, [page, sortedEpisodes]);


  if (episodes.length === 0) {
    return <div className="p-4 text-white/50 text-sm">No episodes found.</div>;
  }

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
        setPage(newPage);
    }
  };

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen} className="flex flex-col space-y-4">
      {/* Header controls */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 bg-white/5 border border-white/10 rounded-xl backdrop-blur-sm">
        <CollapsibleTrigger asChild>
            <Button variant="ghost" className="p-0 hover:bg-transparent flex items-center gap-3 group cursor-pointer w-full sm:w-auto justify-start">
                <h3 className="text-xl font-bold text-white flex items-center gap-3">
                    Episodes
                    <span className="text-xs font-normal text-white/60 bg-white/10 px-2 py-0.5 rounded-full border border-white/5">
                        {episodes.length} Total
                    </span>
                    <ChevronDown className={cn("w-5 h-5 text-white/50 transition-transform duration-200 group-hover:text-white", isOpen && "rotate-180")} />
                </h3>
            </Button>
        </CollapsibleTrigger>
        
        {isOpen && totalPages > 1 && (
            <div className="flex items-center gap-2 animate-in fade-in slide-in-from-left-4 duration-300">
                <Button 
                    variant="outline" 
                    size="sm"
                    className="h-8 border-white/10 bg-transparent text-white hover:bg-white/10 disabled:opacity-30"
                    disabled={page === 1}
                    onClick={(e) => { e.stopPropagation(); handlePageChange(page - 1); }}
                >
                    Prev
                </Button>
                <span className="text-sm font-medium text-white/60 min-w-[80px] text-center">
                    Page {page} of {totalPages}
                </span>
                <Button 
                    variant="outline" 
                    size="sm"
                    className="h-8 border-white/10 bg-transparent text-white hover:bg-white/10 disabled:opacity-30"
                    disabled={page === totalPages}
                    onClick={(e) => { e.stopPropagation(); handlePageChange(page + 1); }}
                >
                    Next
                </Button>
            </div>
        )}
      </div>

      <CollapsibleContent className="space-y-4 data-[state=closed]:animate-collapsible-up data-[state=open]:animate-collapsible-down overflow-hidden">
        {/* Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
                {paginatedEpisodes.map((ep) => {
                    const isCurrent = currentEpisodeId === ep.id;
                    return (

                        <Link key={ep.id} href={`/watch/${ep.id}${ep.id.includes('?') ? '&' : '?'}animeId=${animeId}`} className="group relative">
                            <div className={cn(
                                "flex flex-col justify-between p-4 rounded-xl transition-all duration-300 border h-full relative overflow-hidden group-hover:shadow-lg group-hover:shadow-primary/5",
                                isCurrent 
                                    ? "bg-primary/10 border-primary/50 shadow-[0_0_20px_rgba(59,130,246,0.15)] scale-[1.02] z-10 ring-1 ring-primary/30" 
                                    : "bg-white/5 border-white/5 hover:bg-white/10 hover:border-white/20 hover:-translate-y-0.5"
                            )}>
                                {/* Background Glows */}
                                {isCurrent && (
                                    <>
                                        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 blur-3xl rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none" />
                                        <div className="absolute bottom-0 left-0 w-24 h-24 bg-primary/10 blur-2xl rounded-full translate-y-1/3 -translate-x-1/3 pointer-events-none" />
                                    </>
                                )}
                                
                                <div className="flex items-start justify-between gap-2 mb-3 relative z-10">
                                    <span className={cn(
                                        "text-[10px] font-black tracking-widest px-2 py-0.5 rounded-sm uppercase",
                                        isCurrent ? "bg-primary text-black shadow-lg shadow-primary/20" : "bg-white/10 text-white/50"
                                    )}>
                                        EP {ep.number}
                                    </span>
                                    {ep.isFiller && (
                                        <span className="text-[10px] font-extrabold tracking-wider px-1.5 py-0.5 rounded-sm uppercase bg-orange-500/20 text-orange-400 border border-orange-500/20 shadow-[0_0_10px_rgba(249,115,22,0.1)]">
                                            Filler
                                        </span>
                                    )}
                                </div>

                                <div className="space-y-1 relative z-10">
                                    <h4 className={cn(
                                        "text-sm font-semibold line-clamp-2 leading-tight transition-colors",
                                        isCurrent ? "text-white" : "text-white/70 group-hover:text-white"
                                    )}>
                                        {ep.title || `Episode ${ep.number}`}
                                    </h4>
                                    
                                    {isCurrent && (
                                        <div className="flex items-center gap-2 mt-2 pt-2 border-t border-white/10">
                                            <div className="flex items-end gap-[2px] h-3">
                                                <span className="w-0.5 bg-primary animate-[music-bar_0.8s_ease-in-out_infinite]" style={{ animationDelay: '0s' }} />
                                                <span className="w-0.5 bg-primary animate-[music-bar_0.8s_ease-in-out_infinite]" style={{ animationDelay: '0.2s', height: '60%' }} />
                                                <span className="w-0.5 bg-primary animate-[music-bar_0.8s_ease-in-out_infinite]" style={{ animationDelay: '0.4s', height: '80%' }} />
                                            </div>
                                            <span className="text-[10px] font-bold text-primary tracking-widest uppercase">Now Watching</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </Link>
                    )
                })}
        </div>
        
        {/* Bottom Pagination (Convenience) */}
        {totalPages > 1 && (
            <div className="flex justify-center pt-4">
                <div className="flex items-center gap-2 bg-black/40 p-2 rounded-full border border-white/5">
                    <Button 
                        variant="ghost" 
                        size="sm"
                        className="h-8 w-8 p-0 rounded-full text-white/70 hover:bg-white/20"
                        disabled={page === 1}
                        onClick={() => handlePageChange(page - 1)}
                    >
                        &lt;
                    </Button>
                    <span className="text-sm font-medium text-white/50 px-2 text-center min-w-[100px]">
                        Page {page} / {totalPages}
                    </span>
                    <Button 
                        variant="ghost" 
                        size="sm"
                        className="h-8 w-8 p-0 rounded-full text-white/70 hover:bg-white/20"
                        disabled={page === totalPages}
                        onClick={() => handlePageChange(page + 1)}
                    >
                        &gt;
                    </Button>
                </div>
            </div>
        )}
      </CollapsibleContent>
    </Collapsible>
  );
}

export function EpisodeListSkeleton() {
  return (
    <div className="flex flex-col space-y-4">
      <div className="h-16 w-full bg-white/5 animate-pulse rounded-xl border border-white/10" />
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
        {[...Array(12)].map((_, i) => (
          <Skeleton key={i} className="h-24 rounded-xl" />
        ))}
      </div>
    </div>
  );
}
