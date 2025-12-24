import Link from "next/link";
import Image from "next/image";
import { Anime } from "@/lib/api/types";

interface CompactAnimeCardProps {
  anime: Anime;
}

import { AnimeHoverCard } from "./AnimeHoverCard";

export function CompactAnimeCard({ anime }: CompactAnimeCardProps) {
  return (
    <AnimeHoverCard anime={anime}>
      <Link 
        href={`/anime/${anime.id}`}
        className="flex items-center gap-4 group bg-transparent hover:bg-white/5 p-2.5 rounded-xl transition-all duration-300"
      >
        <div className="relative h-20 w-14 shrink-0 rounded-md overflow-hidden shadow-2xl ring-1 ring-white/10 group-hover:ring-primary/50 transition-all">
          <Image 
            src={anime.image} 
            alt={anime.title.userPreferred} 
            fill 
            className="object-cover transition-transform duration-500 group-hover:scale-110"
            sizes="56px"
          />
        </div>
        <div className="min-w-0 flex-1 space-y-1.5">
          <h3 className="text-[15px] font-bold text-white group-hover:text-primary transition-colors truncate leading-tight">
            {anime.title.userPreferred}
          </h3>
          <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-1.5">
                  <div className="bg-[#ccff00]/10 border border-[#ccff00]/20 px-1.5 py-0.5 rounded flex items-center gap-1">
                      <span className="text-[9px] font-black text-[#ccff00] leading-none">CC</span>
                      <span className="text-[10px] font-bold text-[#ccff00] leading-none">{anime.tvInfo?.sub || "?"}</span>
                  </div>
                  {anime.tvInfo?.dub && (
                      <div className="bg-[#00f7ff]/10 border border-[#00f7ff]/20 px-1.5 py-0.5 rounded flex items-center gap-1">
                          <span className="text-[9px] font-black text-[#00f7ff] leading-none">DUB</span>
                          <span className="text-[10px] font-bold text-[#00f7ff] leading-none">{anime.tvInfo.dub}</span>
                      </div>
                  )}
              </div>
              <div className="flex items-center gap-2">
                  <span className="text-[10px] text-white/30">•</span>
                  <span className="text-[10px] text-white/50 font-bold uppercase tracking-wider">{anime.type || "TV"}</span>
              </div>
          </div>
        </div>
      </Link>
    </AnimeHoverCard>
  );
}
