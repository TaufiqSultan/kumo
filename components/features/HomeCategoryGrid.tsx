import { Anime } from "@/lib/api/types";
import { CompactAnimeCard } from "./CompactAnimeCard";
import Link from "next/link";
import { ChevronRight } from "lucide-react";

interface CategoryColumnProps {
  title: string;
  animes: Anime[];
  viewAllHref: string;
}

function CategoryColumn({ title, animes, viewAllHref }: CategoryColumnProps) {
  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-xl font-bold tracking-tight text-white mb-2">{title}</h2>
      <div className="flex flex-col gap-1">
        {animes.slice(0, 5).map((anime) => (
          <CompactAnimeCard key={anime.id} anime={anime} />
        ))}
      </div>
      <Link 
        href={viewAllHref}
        className="flex items-center gap-1 text-sm font-medium text-white/50 hover:text-primary transition-colors mt-2"
      >
        View more <ChevronRight className="w-4 h-4" />
      </Link>
    </div>
  );
}

interface HomeCategoryGridProps {
  topAiring: Anime[];
  mostPopular: Anime[];
  mostFavorite: Anime[];
  latestEpisode: Anime[];
}

export function HomeCategoryGrid({ topAiring, mostPopular, mostFavorite, latestEpisode }: HomeCategoryGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
      <CategoryColumn 
        title="Top Airing" 
        animes={topAiring} 
        viewAllHref="/airing" 
      />
      <CategoryColumn 
        title="Most Popular" 
        animes={mostPopular} 
        viewAllHref="/popular" 
      />
      <CategoryColumn 
        title="Most Favorite" 
        animes={mostFavorite} 
        viewAllHref="/favorite" 
      />
      <CategoryColumn 
        title="Latest Episodes" 
        animes={latestEpisode} 
        viewAllHref="/latest" 
      />
    </div>
  );
}
