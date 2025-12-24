import { Anime } from "@/lib/api/types";
import { AnimeCard } from "./AnimeCard";

interface AnimeGridProps {
  animes: Anime[];
}

export function AnimeGrid({ animes }: AnimeGridProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
      {animes.map((anime) => (
        <AnimeCard key={anime.id} anime={anime} />
      ))}
    </div>
  );
}
