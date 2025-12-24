"use client";

import { useState, useEffect } from "react";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Play, Star, Mic, Captions } from "lucide-react";
import { animeService } from "@/lib/api/anime";
import { QTipAnime, Anime } from "@/lib/api/types";
import Link from "next/link";

interface AnimeHoverCardProps {
  children: React.ReactNode;
  anime: Anime; // Pass basic anime data for initial render if needed, or just ID to fetch details
}

export function AnimeHoverCard({ children, anime }: AnimeHoverCardProps) {
  const [data, setData] = useState<QTipAnime | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [hasFetched, setHasFetched] = useState(false);

  useEffect(() => {
    if (isOpen && !data && !isLoading && !hasFetched) {
      const fetchData = async () => {
         setIsLoading(true);
         setHasFetched(true);
         try {
             const dataId = typeof anime.data_id === 'number' 
                ? anime.data_id 
                : (anime.data_id ? Number(anime.data_id) : undefined);
             const res = await animeService.getQTip(anime.id, dataId);
             setData(res);
         } finally {
             setIsLoading(false);
         }
      };
      
      fetchData();
    }
  }, [isOpen, anime.id, anime.data_id, data, isLoading, hasFetched]);

  return (
    <HoverCard openDelay={200} closeDelay={100} onOpenChange={setIsOpen}>
      <HoverCardTrigger asChild>
        {children}
      </HoverCardTrigger>
      <HoverCardContent 
        side="right" 
        align="start" 
        alignOffset={-40}
        className="w-[350px] bg-[#1a1a1a]/95 backdrop-blur-xl border-white/10 p-0 overflow-hidden shadow-2xl z-50 rounded-xl"
      >
        <div className="p-5 space-y-4">
            {/* Header Info */}
            <div className="space-y-2">
                <h3 className="text-xl font-bold text-white leading-tight line-clamp-2">
                    {data?.title || anime.title.userPreferred}
                </h3>
                
                <div className="flex flex-wrap items-center gap-2">
                    {/* Rating */}
                    <div className="flex items-center gap-1 text-yellow-400 font-bold text-sm">
                        <Star className="w-3.5 h-3.5 fill-current" />
                        <span>{data?.rating || anime.rating || "N/A"}</span>
                    </div>

                    {/* Quality */}
                    {(data?.quality || anime.tvInfo?.quality) && (
                        <Badge variant="outline" className="border-[#ccff00] text-[#ccff00] h-5 px-1.5 text-[10px] uppercase font-bold rounded-sm">
                            {data?.quality || anime.tvInfo?.quality || "HD"}
                        </Badge>
                    )}

                    {/* Sub/Dub */}
                    <div className="flex items-center gap-1.5 ml-1">
                        <div className="bg-white/10 px-1.5 py-0.5 rounded-sm flex items-center gap-1">
                            <Captions className="w-3 h-3 text-white/70" />
                            <span className="text-[10px] font-bold text-white">{data?.subCount || anime.tvInfo?.sub || "?"}</span>
                        </div>
                        {(data?.dubCount || anime.tvInfo?.dub) && (
                            <div className="bg-white/10 px-1.5 py-0.5 rounded-sm flex items-center gap-1">
                                <Mic className="w-3 h-3 text-white/70" />
                                <span className="text-[10px] font-bold text-white">{data?.dubCount || anime.tvInfo?.dub}</span>
                            </div>
                        )}
                    </div>

                    {/* Type */}
                    <Badge variant="secondary" className="bg-white/10 hover:bg-white/20 text-white h-5 px-1.5 text-[10px] ml-auto">
                        {data?.type || anime.type || "TV"}
                    </Badge>
                </div>
            </div>

            {/* Description */}
            <div className="text-xs text-white/70 leading-relaxed line-clamp-4 min-h-[4rem]">
                {isLoading ? (
                    <div className="space-y-1">
                        <Skeleton className="h-3 w-full bg-white/10" />
                        <Skeleton className="h-3 w-[90%] bg-white/10" />
                        <Skeleton className="h-3 w-[95%] bg-white/10" />
                    </div>
                ) : (
                    <p className="animate-in fade-in duration-500">{data?.description || anime.description || "No description available."}</p>
                )}
            </div>

            {/* Metadata Grid */}
            <div className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1.5 text-[11px]">
                <span className="text-white/40">Japanese:</span>
                <span className="text-white/80 truncate">{data?.japaneseTitle || anime.title.native || "-"}</span>

                <span className="text-white/40">Aired:</span>
                <span className="text-white/80 truncate">{data?.airedDate || (typeof anime.releaseDate === 'string' ? anime.releaseDate : String(anime.releaseDate || "-"))}</span>
                
                <span className="text-white/40">Status:</span>
                <span className="text-white/80 truncate">{data?.status || anime.status || "Unknown"}</span>

                <span className="text-white/40">Genres:</span>
                <span className="text-primary truncate">
                    {data?.genres?.slice(0, 3).join(", ") || anime.genres?.slice(0, 3).join(", ") || "-"}
                </span>
            </div>

            {/* Action Button */}
            <Link href={`/anime/${anime.id}`} className="block pt-2">
                <Button className="w-full gap-2 font-bold text-black bg-white hover:bg-white/90 rounded-full h-10 transition-transform active:scale-95">
                    <Play className="w-4 h-4 fill-current" /> Watch Now
                </Button>
            </Link>
        </div>
      </HoverCardContent>
    </HoverCard>
  );
}
