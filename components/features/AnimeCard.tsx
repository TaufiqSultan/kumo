import Link from "next/link";
import { Star } from "lucide-react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Anime } from "@/lib/api/types";

interface AnimeCardProps {
  anime: Anime;
}

import { AnimeHoverCard } from "./AnimeHoverCard";

export function AnimeCard({ anime }: AnimeCardProps) {
  const title = anime.title.userPreferred || anime.title.english || anime.title.romaji;
  
  return (
    <AnimeHoverCard anime={anime}>
      <Link href={`/anime/${anime.id}`} className="group block h-full">
        <Card className="h-full overflow-hidden border-0 bg-transparent shadow-none transition-transform duration-200 group-hover:scale-105">
          <CardContent className="p-0 relative aspect-[2/3] overflow-hidden rounded-md">
             {/* eslint-disable-next-line @next/next/no-img-element */}
            <img 
              src={anime.image} 
              alt={title}
              className="h-full w-full object-cover transition-all duration-300 group-hover:brightness-110"
              loading="lazy"
            />
            <div className="absolute top-2 right-2 flex flex-col gap-1">
               {anime.rating && (
                <Badge variant="secondary" className="bg-black/70 text-yellow-400 backdrop-blur-sm border-0 gap-1">
                  <Star className="w-3 h-3 fill-current" />
                  {anime.rating / 10}
                </Badge>
               )}
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
               <p className="text-white text-sm font-medium line-clamp-2">{title}</p>
            </div>
          </CardContent>
          <CardFooter className="p-2 pt-3 flex flex-col items-start gap-1">
            <h3 className="font-semibold text-sm line-clamp-1 group-hover:text-primary transition-colors">
              {title}
            </h3>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
               {anime.releaseDate && (
                 <>
                   <span>{anime.releaseDate}</span>
                   <span>•</span>
                 </>
               )}
               <span className="capitalize">{anime.type || "TV"}</span>
            </div>
          </CardFooter>
        </Card>
      </Link>
    </AnimeHoverCard>
  );
}

export function AnimeCardSkeleton() {
  return (
    <div className="space-y-3">
      <Skeleton className="aspect-[2/3] w-full rounded-md" />
      <div className="space-y-1">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
      </div>
    </div>
  );
}
